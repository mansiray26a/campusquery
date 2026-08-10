const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  constructor(data) {
    this.id = data.id || data._id || crypto.randomUUID();
    this._id = this.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'student';
    this.reputation = data.reputation !== undefined ? Number(data.reputation) : 0;
    this.bio = data.bio || '';
    this.profilePicture = data.profilePicture || '';
    this.savedQuestions = Array.isArray(data.savedQuestions) ? data.savedQuestions : [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async findOne(query) {
    let sql = 'SELECT * FROM users WHERE ';
    let params = [];

    if (query.$or) {
      const clauses = [];
      for (const item of query.$or) {
        if (item.email) {
          clauses.push('LOWER(email) = LOWER(?)');
          params.push(item.email);
        }
        if (item.username) {
          clauses.push('LOWER(username) = LOWER(?)');
          params.push(item.username);
        }
      }
      sql += clauses.join(' OR ');
    } else if (query.email) {
      sql += 'LOWER(email) = LOWER(?)';
      params.push(query.email);
    } else if (query.username) {
      sql += 'LOWER(username) = LOWER(?)';
      params.push(query.username);
    } else {
      return null;
    }

    const res = await db.execute({ sql, args: params });
    if (res.rows.length === 0) return null;
    return new User(res.rows[0]);
  }

  static async findById(id) {
    if (!id) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id.toString()]
    });
    if (res.rows.length === 0) return null;
    const user = new User(res.rows[0]);

    const savedRes = await db.execute({
      sql: 'SELECT questionId FROM saved_questions WHERE userId = ?',
      args: [id.toString()]
    });
    user.savedQuestions = savedRes.rows.map(r => r.questionId);
    return user;
  }

  static async create({ username, email, password, role = 'student' }) {
    const id = crypto.randomUUID();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO users (id, username, email, password, role, reputation, bio, profilePicture, createdAt) 
            VALUES (?, ?, ?, ?, ?, 0, '', '', ?)`,
      args: [id, username, email, hashedPassword, role, createdAt]
    });

    return new User({
      id,
      username,
      email,
      password: hashedPassword,
      role,
      reputation: 0,
      bio: '',
      profilePicture: '',
      createdAt
    });
  }

  static async countDocuments() {
    const res = await db.execute('SELECT COUNT(*) as count FROM users');
    return Number(res.rows[0].count);
  }

  static async find() {
    const res = await db.execute('SELECT * FROM users ORDER BY createdAt DESC');
    return res.rows.map(r => new User(r));
  }

  static async findByIdAndDelete(id) {
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id.toString()] });
  }

  static async findByIdAndUpdate(id, update) {
    if (update.$inc && update.$inc.reputation !== undefined) {
      await db.execute({
        sql: 'UPDATE users SET reputation = reputation + ? WHERE id = ?',
        args: [update.$inc.reputation, id.toString()]
      });
    }
  }

  select() {
    return this;
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    await db.execute({
      sql: `UPDATE users SET role = ?, reputation = ?, bio = ?, profilePicture = ? WHERE id = ?`,
      args: [this.role, this.reputation, this.bio, this.profilePicture, this.id]
    });

    await db.execute({ sql: 'DELETE FROM saved_questions WHERE userId = ?', args: [this.id] });
    for (const qId of this.savedQuestions) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO saved_questions (userId, questionId) VALUES (?, ?)',
        args: [this.id, qId.toString()]
      });
    }
    return this;
  }
}

module.exports = User;
