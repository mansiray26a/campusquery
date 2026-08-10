const { db } = require('../config/db');
const User = require('./User');
const Tag = require('./Tag');
const crypto = require('crypto');

class QuestionQuery {
  constructor(queryObject = {}) {
    this.queryObject = queryObject;
    this.populates = [];
    this.sortObj = { createdAt: -1 };
    this.limitVal = null;
  }

  populate(path, fields) {
    this.populates.push({ path, fields });
    return this;
  }

  sort(sortQuery) {
    if (sortQuery) {
      this.sortObj = sortQuery;
    }
    return this;
  }

  limit(num) {
    this.limitVal = num;
    return this;
  }

  async exec() {
    let sql = 'SELECT DISTINCT q.* FROM questions q';
    let params = [];
    let joins = [];
    let whereClauses = [];

    if (this.queryObject.tags) {
      joins.push('JOIN question_tags qt ON q.id = qt.questionId');
      whereClauses.push('qt.tagId = ?');
      params.push(this.queryObject.tags.toString());
    }

    if (this.queryObject.author) {
      whereClauses.push('q.authorId = ?');
      params.push(this.queryObject.author.toString());
    }

    if (this.queryObject.$or) {
      let searchKeyword = null;
      for (const item of this.queryObject.$or) {
        if (item.title && item.title.$regex) searchKeyword = item.title.$regex;
        else if (item.description && item.description.$regex) searchKeyword = item.description.$regex;
        else if (item.body && item.body.$regex) searchKeyword = item.body.$regex;
      }
      if (searchKeyword) {
        whereClauses.push('(LOWER(q.title) LIKE LOWER(?) OR LOWER(q.description) LIKE LOWER(?) OR LOWER(q.body) LIKE LOWER(?))');
        const term = `%${searchKeyword}%`;
        params.push(term, term, term);
      }
    }

    if (joins.length > 0) sql += ' ' + joins.join(' ');
    if (whereClauses.length > 0) sql += ' WHERE ' + whereClauses.join(' AND ');

    if (this.sortObj.voteScore) {
      sql += ' ORDER BY q.voteScore DESC, q.createdAt DESC';
    } else if (this.sortObj.views) {
      sql += ' ORDER BY q.views DESC, q.createdAt DESC';
    } else {
      sql += ' ORDER BY q.createdAt DESC';
    }

    if (this.limitVal) {
      sql += ' LIMIT ?';
      params.push(this.limitVal);
    }

    const res = await db.execute({ sql, args: params });
    const questions = [];
    for (const row of res.rows) {
      const q = new Question(row);
      await Question.loadRelations(q);

      for (const pop of this.populates) {
        await q.populate(pop.path, pop.fields);
      }
      questions.push(q);
    }
    return questions;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class Question {
  constructor(data) {
    this.id = data.id || data._id || crypto.randomUUID();
    this._id = this.id;
    this.title = data.title;
    this.description = data.description;
    this.body = data.body;
    this.author = data.authorId || data.author;
    this.acceptedAnswer = data.acceptedAnswerId || data.acceptedAnswer || null;
    this.voteScore = data.voteScore !== undefined ? Number(data.voteScore) : 0;
    this.views = data.views !== undefined ? Number(data.views) : 0;
    this.createdAt = data.createdAt || new Date().toISOString();

    this.tags = Array.isArray(data.tags) ? data.tags : [];
    this.upvotes = Array.isArray(data.upvotes) ? data.upvotes : [];
    this.downvotes = Array.isArray(data.downvotes) ? data.downvotes : [];
  }

  static async loadRelations(question) {
    const qId = question.id.toString();

    const tagsRes = await db.execute({
      sql: 'SELECT tagId FROM question_tags WHERE questionId = ?',
      args: [qId]
    });
    question.tags = tagsRes.rows.map(r => r.tagId);

    const votesRes = await db.execute({
      sql: 'SELECT userId, voteType FROM question_votes WHERE questionId = ?',
      args: [qId]
    });
    question.upvotes = votesRes.rows.filter(v => Number(v.voteType) === 1).map(v => v.userId);
    question.downvotes = votesRes.rows.filter(v => Number(v.voteType) === -1).map(v => v.userId);
    question.voteScore = question.upvotes.length - question.downvotes.length;

    return question;
  }

  static find(queryObject = {}) {
    return new QuestionQuery(queryObject);
  }

  static async findById(id) {
    if (!id) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM questions WHERE id = ?',
      args: [id.toString()]
    });
    if (res.rows.length === 0) return null;
    const q = new Question(res.rows[0]);
    await Question.loadRelations(q);
    return q;
  }

  static async create({ title, description, body, author, tags = [] }) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const authorId = author.toString();

    await db.execute({
      sql: `INSERT INTO questions (id, title, description, body, authorId, voteScore, views, createdAt)
            VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
      args: [id, title, description, body, authorId, createdAt]
    });

    for (const tagId of tags) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO question_tags (questionId, tagId) VALUES (?, ?)',
        args: [id, tagId.toString()]
      });
    }

    const question = new Question({
      id,
      title,
      description,
      body,
      author: authorId,
      voteScore: 0,
      views: 0,
      createdAt,
      tags
    });

    return question;
  }

  static async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM questions';
    let params = [];

    if (query.author) {
      sql += ' WHERE authorId = ?';
      params.push(query.author.toString());
    }

    const res = await db.execute({ sql, args: params });
    return Number(res.rows[0].count);
  }

  static async findByIdAndDelete(id) {
    const qId = id.toString();
    await db.execute({ sql: 'DELETE FROM question_tags WHERE questionId = ?', args: [qId] });
    await db.execute({ sql: 'DELETE FROM question_votes WHERE questionId = ?', args: [qId] });
    await db.execute({ sql: 'DELETE FROM saved_questions WHERE questionId = ?', args: [qId] });
    await db.execute({ sql: 'DELETE FROM questions WHERE id = ?', args: [qId] });
  }

  static async updateMany(filter, update) {
    if (filter.tags && update.$pull && update.$pull.tags) {
      await db.execute({
        sql: 'DELETE FROM question_tags WHERE tagId = ?',
        args: [update.$pull.tags.toString()]
      });
    }
  }

  toObject() {
    return {
      _id: this.id,
      id: this.id,
      title: this.title,
      description: this.description,
      body: this.body,
      author: this.author,
      tags: this.tags,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      voteScore: this.voteScore,
      acceptedAnswer: this.acceptedAnswer,
      views: this.views,
      createdAt: this.createdAt
    };
  }

  async populate(path, fields) {
    if (path === 'author') {
      if (typeof this.author === 'string') {
        const user = await User.findById(this.author);
        this.author = user ? user : { _id: this.author, username: 'Unknown User' };
      }
    } else if (path === 'tags') {
      if (Array.isArray(this.tags) && (this.tags.length === 0 || typeof this.tags[0] === 'string')) {
        const fullTags = [];
        for (const tId of this.tags) {
          const tagObj = await Tag.findById(tId);
          if (tagObj) fullTags.push(tagObj);
        }
        this.tags = fullTags;
      }
    }
    return this;
  }

  async save() {
    await db.execute({
      sql: `UPDATE questions 
            SET title = ?, description = ?, body = ?, acceptedAnswerId = ?, voteScore = ?, views = ? 
            WHERE id = ?`,
      args: [
        this.title,
        this.description,
        this.body,
        this.acceptedAnswer ? this.acceptedAnswer.toString() : null,
        this.voteScore,
        this.views,
        this.id
      ]
    });

    await db.execute({ sql: 'DELETE FROM question_tags WHERE questionId = ?', args: [this.id] });
    for (const tag of this.tags) {
      const tagId = typeof tag === 'object' ? tag._id : tag;
      await db.execute({
        sql: 'INSERT OR IGNORE INTO question_tags (questionId, tagId) VALUES (?, ?)',
        args: [this.id, tagId.toString()]
      });
    }

    await db.execute({ sql: 'DELETE FROM question_votes WHERE questionId = ?', args: [this.id] });
    for (const uId of this.upvotes) {
      await db.execute({
        sql: 'INSERT INTO question_votes (questionId, userId, voteType) VALUES (?, ?, 1)',
        args: [this.id, uId.toString()]
      });
    }
    for (const uId of this.downvotes) {
      await db.execute({
        sql: 'INSERT INTO question_votes (questionId, userId, voteType) VALUES (?, ?, -1)',
        args: [this.id, uId.toString()]
      });
    }

    return this;
  }
}

module.exports = Question;
