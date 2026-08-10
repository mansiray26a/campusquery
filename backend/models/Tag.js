const { db } = require('../config/db');
const crypto = require('crypto');

class Tag {
  constructor(data) {
    this.id = data.id || data._id || crypto.randomUUID();
    this._id = this.id;
    this.name = data.name;
    this.description = data.description || '';
    this.questionCount = data.questionCount !== undefined ? Number(data.questionCount) : 0;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async findOne(query) {
    if (!query || !query.name) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM tags WHERE LOWER(name) = LOWER(?)',
      args: [query.name.toString().trim()]
    });
    if (res.rows.length === 0) return null;
    return new Tag(res.rows[0]);
  }

  static async findById(id) {
    if (!id) return null;
    const res = await db.execute({
      sql: 'SELECT * FROM tags WHERE id = ?',
      args: [id.toString()]
    });
    if (res.rows.length === 0) return null;
    return new Tag(res.rows[0]);
  }

  static async create({ name, description }) {
    const id = crypto.randomUUID();
    const cleanName = name.toLowerCase().trim().replace(/\s+/g, '-');
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: 'INSERT INTO tags (id, name, description, questionCount, createdAt) VALUES (?, ?, ?, 0, ?)',
      args: [id, cleanName, description, createdAt]
    });

    return new Tag({ id, name: cleanName, description, questionCount: 0, createdAt });
  }

  static async countDocuments() {
    const res = await db.execute('SELECT COUNT(*) as count FROM tags');
    return Number(res.rows[0].count);
  }

  static async find() {
    const res = await db.execute('SELECT * FROM tags ORDER BY questionCount DESC, name ASC');
    return res.rows.map(r => new Tag(r));
  }

  static async findByIdAndDelete(id) {
    await db.execute({ sql: 'DELETE FROM question_tags WHERE tagId = ?', args: [id.toString()] });
    await db.execute({ sql: 'DELETE FROM tags WHERE id = ?', args: [id.toString()] });
  }

  static async findByIdAndUpdate(id, update) {
    if (update.$inc && update.$inc.questionCount !== undefined) {
      await db.execute({
        sql: 'UPDATE tags SET questionCount = MAX(0, questionCount + ?) WHERE id = ?',
        args: [update.$inc.questionCount, id.toString()]
      });
    }
  }

  async save() {
    await db.execute({
      sql: 'UPDATE tags SET description = ?, questionCount = ? WHERE id = ?',
      args: [this.description, this.questionCount, this.id]
    });
    return this;
  }
}

module.exports = Tag;
