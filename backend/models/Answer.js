const { db } = require('../config/db');
const User = require('./User');
const crypto = require('crypto');

class Answer {
  constructor(data) {
    this.id = data.id || data._id || crypto.randomUUID();
    this._id = this.id;
    this.question = data.questionId || data.question;
    this.author = data.authorId || data.author;
    this.body = data.body;
    this.voteScore = data.voteScore !== undefined ? Number(data.voteScore) : 0;
    this.isAccepted = Boolean(data.isAccepted);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.upvotes = Array.isArray(data.upvotes) ? data.upvotes : [];
    this.downvotes = Array.isArray(data.downvotes) ? data.downvotes : [];
  }

  static async loadVotes(answer) {
    const votesRes = await db.execute({
      sql: 'SELECT userId, voteType FROM answer_votes WHERE answerId = ?',
      args: [answer.id.toString()]
    });
    answer.upvotes = votesRes.rows.filter(v => Number(v.voteType) === 1).map(v => v.userId);
    answer.downvotes = votesRes.rows.filter(v => Number(v.voteType) === -1).map(v => v.userId);
    answer.voteScore = answer.upvotes.length - answer.downvotes.length;
    return answer;
  }

  static async findById(id) {
    if (!id) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM answers WHERE id = ?',
      args: [id.toString()]
    });
    if (res.rows.length === 0) return null;
    const answer = new Answer(res.rows[0]);
    await Answer.loadVotes(answer);
    return answer;
  }

  static async find(query = {}) {
    let sql = 'SELECT * FROM answers';
    let params = [];

    if (query.question) {
      sql += ' WHERE questionId = ?';
      params.push(query.question.toString());
    } else if (query.author) {
      sql += ' WHERE authorId = ?';
      params.push(query.author.toString());
    }

    sql += ' ORDER BY isAccepted DESC, voteScore DESC, createdAt ASC';

    const res = await db.execute({ sql, args: params });
    const answers = [];
    for (const row of res.rows) {
      const a = new Answer(row);
      await Answer.loadVotes(a);
      answers.push(a);
    }
    return answers;
  }

  static async create({ body, question, author }) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const qId = question.toString();
    const aId = author.toString();

    await db.execute({
      sql: `INSERT INTO answers (id, questionId, authorId, body, voteScore, isAccepted, createdAt)
            VALUES (?, ?, ?, ?, 0, 0, ?)`,
      args: [id, qId, aId, body, createdAt]
    });

    return new Answer({
      id,
      question: qId,
      author: aId,
      body,
      voteScore: 0,
      isAccepted: false,
      createdAt
    });
  }

  static async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM answers';
    let params = [];
    const clauses = [];

    if (query.question) {
      clauses.push('questionId = ?');
      params.push(query.question.toString());
    }
    if (query.author) {
      clauses.push('authorId = ?');
      params.push(query.author.toString());
    }
    if (query.isAccepted !== undefined) {
      clauses.push('isAccepted = ?');
      params.push(query.isAccepted ? 1 : 0);
    }

    if (clauses.length > 0) {
      sql += ' WHERE ' + clauses.join(' AND ');
    }

    const res = await db.execute({ sql, args: params });
    return Number(res.rows[0].count);
  }

  static async deleteMany(query = {}) {
    if (query.question) {
      await db.execute({ sql: 'DELETE FROM answers WHERE questionId = ?', args: [query.question.toString()] });
    } else if (query.author) {
      await db.execute({ sql: 'DELETE FROM answers WHERE authorId = ?', args: [query.author.toString()] });
    }
  }

  static async findByIdAndDelete(id) {
    await db.execute({ sql: 'DELETE FROM answer_votes WHERE answerId = ?', args: [id.toString()] });
    await db.execute({ sql: 'DELETE FROM answers WHERE id = ?', args: [id.toString()] });
  }

  async save() {
    await db.execute({
      sql: 'UPDATE answers SET body = ?, voteScore = ?, isAccepted = ? WHERE id = ?',
      args: [this.body, this.voteScore, this.isAccepted ? 1 : 0, this.id]
    });

    await db.execute({ sql: 'DELETE FROM answer_votes WHERE answerId = ?', args: [this.id] });
    for (const uId of this.upvotes) {
      await db.execute({
        sql: 'INSERT INTO answer_votes (answerId, userId, voteType) VALUES (?, ?, 1)',
        args: [this.id, uId.toString()]
      });
    }
    for (const uId of this.downvotes) {
      await db.execute({
        sql: 'INSERT INTO answer_votes (answerId, userId, voteType) VALUES (?, ?, -1)',
        args: [this.id, uId.toString()]
      });
    }

    return this;
  }

  async populate(path, fields) {
    if (path === 'author') {
      if (typeof this.author === 'string') {
        const user = await User.findById(this.author);
        this.author = user ? user : { _id: this.author, username: 'Unknown User' };
      }
    } else if (path === 'question') {
      if (typeof this.question === 'string') {
        const Question = require('./Question');
        const q = await Question.findById(this.question);
        this.question = q ? q : { _id: this.question, title: 'Unknown Question' };
      }
    }
    return this;
  }
}

module.exports = Answer;
