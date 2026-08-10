const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const Report = require('../models/Report');

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res, next) => {
  try {
    const { title, description, body, tags } = req.body;

    if (!title || !description || !body) {
      res.status(400);
      throw new Error('Please fill in title, description, and body');
    }

    // Process tags
    const tagIds = [];
    if (tags && Array.isArray(tags)) {
      for (let tagName of tags) {
        tagName = tagName.toLowerCase().trim().replace(/\s+/g, '-');
        if (!tagName) continue;

        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({
            name: tagName,
            description: `Questions related to ${tagName}`
          });
        }

        tagIds.push(tag._id);
        
        // Increment tag questionCount
        tag.questionCount += 1;
        await tag.save();
      }
    }

    const question = await Question.create({
      title,
      description,
      body,
      author: req.user._id,
      tags: tagIds
    });

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions with optional search and filters
// @route   GET /api/questions
// @access  Public
const getAllQuestions = async (req, res, next) => {
  try {
    const { search, tag, sort, author } = req.query;
    const queryObject = {};

    // Search query
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag query
    if (tag) {
      const tagObj = await Tag.findOne({ name: tag.toLowerCase().trim() });
      if (tagObj) {
        queryObject.tags = tagObj._id;
      } else {
        // Tag search matches nothing
        return res.json({ questions: [], count: 0 });
      }
    }

    // Author query
    if (author) {
      queryObject.author = author;
    }

    // Sort query
    let sortQuery = { createdAt: -1 };
    if (sort === 'votes') {
      sortQuery = { voteScore: -1, createdAt: -1 };
    } else if (sort === 'views') {
      sortQuery = { views: -1, createdAt: -1 };
    }

    const questions = await Question.find(queryObject)
      .populate('author', 'username profilePicture reputation')
      .populate('tags', 'name')
      .sort(sortQuery);

    // Get answer counts for each question
    const questionsWithAnswersCount = await Promise.all(
      questions.map(async (q) => {
        const answersCount = await Answer.countDocuments({ question: q._id });
        return {
          ...q.toObject(),
          answersCount
        };
      })
    );

    res.json({
      questions: questionsWithAnswersCount,
      count: questionsWithAnswersCount.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question details, increment views, and fetch its answers
// @route   GET /api/questions/:id
// @access  Public
const getQuestionDetails = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }
    await question.populate('author');
    await question.populate('tags');

    // Increment views
    question.views += 1;
    await question.save();

    // Fetch answers
    const answers = await Answer.find({ question: question._id });
    for (const a of answers) {
      await a.populate('author');
    }

    res.json({
      question,
      answers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question details (title, description, body, tags)
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Only owner or admin can update
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to edit this question');
    }

    const { title, description, body, tags } = req.body;

    question.title = title || question.title;
    question.description = description || question.description;
    question.body = body || question.body;

    // Handle tag changes
    if (tags && Array.isArray(tags)) {
      // Decrement count for old tags
      for (const oldTagId of question.tags) {
        await Tag.findByIdAndUpdate(oldTagId, { $inc: { questionCount: -1 } });
      }

      const newTagIds = [];
      for (let tagName of tags) {
        tagName = tagName.toLowerCase().trim().replace(/\s+/g, '-');
        if (!tagName) continue;

        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({
            name: tagName,
            description: `Questions related to ${tagName}`
          });
        }

        newTagIds.push(tag._id);
        await Tag.findByIdAndUpdate(tag._id, { $inc: { questionCount: 1 } });
      }
      question.tags = newTagIds;
    }

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question, its answers, and decrement tag usage
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Only owner or admin can delete
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this question');
    }

    // Decrement count for tags
    for (const tagId of question.tags) {
      await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: -1 } });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });

    // Delete associated reports
    await Report.deleteMany({ targetId: question._id, type: 'Question' });

    // Delete the question
    await Question.findByIdAndDelete(question._id);

    res.json({ message: 'Question and associated data successfully removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionDetails,
  updateQuestion,
  deleteQuestion
};
