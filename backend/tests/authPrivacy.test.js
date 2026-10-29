const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET ||= crypto.randomBytes(48).toString('hex');

const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { getUserDashboardData } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const makeResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('registration cannot assign administrator privileges by email or submitted role', async (t) => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  let capturedUser;
  User.findOne = async () => null;
  User.create = async (data) => {
    capturedUser = data;
    return new User({ ...data, id: 'new-user', sessionVersion: 0 });
  };
  t.after(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  });

  const response = makeResponse();
  let forwardedError;
  await registerUser({ body: {
    username: 'privilege-test',
    email: 'mansii143@gmail.com',
    password: 'valid-test-password',
    role: 'admin'
  } }, response, (error) => { forwardedError = error; });

  assert.equal(forwardedError, undefined);
  assert.equal(capturedUser.role, 'student');
  assert.equal(response.body.role, 'student');
  assert.ok(response.body.token);
});

test('login cannot provision an administrator through a fixed credential bypass', async (t) => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  let createCalled = false;
  User.findOne = async () => null;
  User.create = async () => { createCalled = true; throw new Error('must not provision users during login'); };
  t.after(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  });

  const response = makeResponse();
  let forwardedError;
  await loginUser({ body: { email: 'mansii143@gmail.com', password: 'invalid-password' } }, response, (error) => { forwardedError = error; });

  assert.equal(response.statusCode, 401);
  assert.equal(forwardedError?.message, 'Invalid email or password');
  assert.equal(createCalled, false);
});

test('public and admin serializers never include password hashes or private saved-question IDs', () => {
  const user = new User({
    id: 'user-a',
    username: 'student-a',
    email: 'student-a@example.test',
    password: 'hashed-password',
    savedQuestions: ['private-question-id'],
    role: 'student'
  });

  const publicUser = user.toPublicObject();
  const adminUser = user.toAdminObject();
  assert.equal(publicUser.username, 'student-a');
  assert.equal('password' in publicUser, false);
  assert.equal('email' in publicUser, false);
  assert.equal('savedQuestions' in publicUser, false);
  assert.equal(adminUser.email, 'student-a@example.test');
  assert.equal('password' in adminUser, false);
  assert.equal('savedQuestions' in adminUser, false);
});

test('populated question and answer authors expose only public profile fields', async (t) => {
  const author = new User({
    id: 'author-a',
    username: 'author',
    email: 'private@example.test',
    password: 'hashed-password',
    savedQuestions: ['private-question-id']
  });
  const originalFindById = User.findById;
  User.findById = async () => author;
  t.after(() => { User.findById = originalFindById; });

  const question = new Question({ id: 'question-a', title: 'Question', author: author.id });
  const answer = new Answer({ id: 'answer-a', body: 'Answer', author: author.id });
  await question.populate('author');
  await answer.populate('author');

  for (const populatedAuthor of [question.author, answer.author]) {
    assert.equal(populatedAuthor.username, 'author');
    assert.equal('password' in populatedAuthor, false);
    assert.equal('email' in populatedAuthor, false);
    assert.equal('savedQuestions' in populatedAuthor, false);
  }
});

test('dashboard query filters are always bound to the authenticated user ID', async (t) => {
  const originalFindById = User.findById;
  const originalQuestionCount = Question.countDocuments;
  const originalQuestionFind = Question.find;
  const originalAnswerCount = Answer.countDocuments;
  const observedQuestionFilters = [];
  const observedAnswerFilters = [];
  User.findById = async (id) => {
    assert.equal(id, 'user-a');
    return { reputation: 31, savedQuestions: [] };
  };
  Question.countDocuments = async (filter) => {
    observedQuestionFilters.push(filter);
    return 0;
  };
  Question.find = (filter) => {
    observedQuestionFilters.push(filter);
    return { limit: async () => [] };
  };
  Answer.countDocuments = async (filter) => {
    observedAnswerFilters.push(filter);
    return 0;
  };
  t.after(() => {
    User.findById = originalFindById;
    Question.countDocuments = originalQuestionCount;
    Question.find = originalQuestionFind;
    Answer.countDocuments = originalAnswerCount;
  });

  const response = makeResponse();
  let forwardedError;
  await getUserDashboardData({ user: { _id: 'user-a' } }, response, (error) => { forwardedError = error; });

  assert.equal(forwardedError, undefined);
  assert.ok(observedQuestionFilters.length > 0);
  assert.ok(observedQuestionFilters.every((filter) => filter.author === 'user-a'));
  assert.ok(observedAnswerFilters.every((filter) => filter.author === 'user-a'));
  assert.equal(response.body.reputation, 31);
});

test('logout increments the authenticated account session version', async (t) => {
  const originalIncrement = User.incrementSessionVersion;
  let invalidatedUserId;
  User.incrementSessionVersion = async (id) => { invalidatedUserId = id; };
  t.after(() => { User.incrementSessionVersion = originalIncrement; });

  const response = makeResponse();
  let forwardedError;
  await logoutUser({ user: { _id: 'user-a' } }, response, (error) => { forwardedError = error; });
  assert.equal(forwardedError, undefined);
  assert.equal(invalidatedUserId, 'user-a');
  assert.equal(response.body.message, 'Signed out successfully');
});

test('protected APIs reject a JWT from a revoked session', async (t) => {
  const originalFindById = User.findById;
  User.findById = async () => ({ _id: 'user-a', sessionVersion: 2 });
  t.after(() => { User.findById = originalFindById; });

  const token = jwt.sign({ id: 'user-a', sessionVersion: 1 }, process.env.JWT_SECRET);
  const response = makeResponse();
  let nextCalled = false;
  await protect({ headers: { authorization: `Bearer ${token}` } }, response, () => { nextCalled = true; });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Session has been revoked');
  assert.equal(nextCalled, false);
});
