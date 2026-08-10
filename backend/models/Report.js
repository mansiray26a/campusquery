const { db } = require('../config/db');
const User = require('./User');
const crypto = require('crypto');

class ReportQuery {
  constructor(queryObject = {}) {
    this.queryObject = queryObject;
    this.populates = [];
  }

  populate(opts) {
    if (typeof opts === 'string') {
      this.populates.push({ path: opts });
    } else {
      this.populates.push(opts);
    }
    return this;
  }

  sort() {
    return this;
  }

  async exec() {
    let sql = 'SELECT * FROM reports ORDER BY createdAt DESC';
    const res = await db.execute(sql);
    const reports = [];
    for (const row of res.rows) {
      const r = new Report(row);
      for (const pop of this.populates) {
        await r.populate(pop.path || pop);
      }
      reports.push(r);
    }
    return reports;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class Report {
  constructor(data) {
    this.id = data.id || data._id || crypto.randomUUID();
    this._id = this.id;
    this.reporter = data.reporterId || data.reporter;
    this.type = data.type;
    this.targetId = data.targetId;
    this.reason = data.reason;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static find(queryObject = {}) {
    return new ReportQuery(queryObject);
  }

  static async findById(id) {
    if (!id) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM reports WHERE id = ?',
      args: [id.toString()]
    });
    if (res.rows.length === 0) return null;
    return new Report(res.rows[0]);
  }

  static async create({ reporter, type, targetId, reason }) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const repId = reporter.toString();
    const tId = targetId.toString();

    await db.execute({
      sql: `INSERT INTO reports (id, reporterId, type, targetId, reason, status, createdAt)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      args: [id, repId, type, tId, reason, createdAt]
    });

    return new Report({
      id,
      reporter: repId,
      type,
      targetId: tId,
      reason,
      status: 'pending',
      createdAt
    });
  }

  static async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM reports';
    let params = [];

    if (query.status) {
      sql += ' WHERE status = ?';
      params.push(query.status);
    }

    const res = await db.execute({ sql, args: params });
    return Number(res.rows[0].count);
  }

  static async deleteMany(query = {}) {
    if (query.targetId) {
      let sql = 'DELETE FROM reports WHERE targetId = ?';
      let params = [query.targetId.toString()];
      if (query.type) {
        sql += ' AND type = ?';
        params.push(query.type);
      }
      await db.execute({ sql, args: params });
    }
  }

  async populate(path) {
    if (path === 'reporter') {
      if (typeof this.reporter === 'string') {
        const user = await User.findById(this.reporter);
        this.reporter = user ? user : { _id: this.reporter, username: 'Unknown User' };
      }
    } else if (path === 'targetId' || (typeof path === 'object' && path.path === 'targetId')) {
      const Question = require('./Question');
      const Answer = require('./Answer');
      if (this.type === 'Question') {
        const q = await Question.findById(this.targetId);
        if (q && typeof path === 'object' && path.populate) {
          await q.populate('author');
        }
        this.targetId = q ? q : { _id: this.targetId, title: 'Deleted Question' };
      } else if (this.type === 'Answer') {
        const a = await Answer.findById(this.targetId);
        if (a && typeof path === 'object' && path.populate) {
          await a.populate('author');
        }
        this.targetId = a ? a : { _id: this.targetId, body: 'Deleted Answer' };
      }
    }
    return this;
  }

  async save() {
    await db.execute({
      sql: 'UPDATE reports SET status = ? WHERE id = ?',
      args: [this.status, this.id]
    });
    return this;
  }
}

module.exports = Report;
