const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL || 'file:campusquery.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  ...(authToken ? { authToken } : {})
});

const connectDB = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        reputation INTEGER DEFAULT 0,
        bio TEXT DEFAULT '',
        profilePicture TEXT DEFAULT '',
        createdAt TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        body TEXT NOT NULL,
        authorId TEXT NOT NULL,
        acceptedAnswerId TEXT,
        voteScore INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(authorId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id TEXT PRIMARY KEY,
        questionId TEXT NOT NULL,
        authorId TEXT NOT NULL,
        body TEXT NOT NULL,
        voteScore INTEGER DEFAULT 0,
        isAccepted INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY(authorId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        questionCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS question_tags (
        questionId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY (questionId, tagId),
        FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS question_votes (
        questionId TEXT NOT NULL,
        userId TEXT NOT NULL,
        voteType INTEGER NOT NULL,
        PRIMARY KEY (questionId, userId),
        FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS answer_votes (
        answerId TEXT NOT NULL,
        userId TEXT NOT NULL,
        voteType INTEGER NOT NULL,
        PRIMARY KEY (answerId, userId),
        FOREIGN KEY(answerId) REFERENCES answers(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS saved_questions (
        userId TEXT NOT NULL,
        questionId TEXT NOT NULL,
        PRIMARY KEY (userId, questionId),
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporterId TEXT NOT NULL,
        type TEXT NOT NULL,
        targetId TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        FOREIGN KEY(reporterId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log(`Turso LibSQL DB Connected & Schema initialized (${url.startsWith('file:') ? 'Local SQLite file' : 'Remote Turso Cloud'})`);
  } catch (error) {
    console.error(`Turso Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { db, connectDB };
