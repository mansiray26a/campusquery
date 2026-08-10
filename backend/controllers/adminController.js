const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const Report = require('../models/Report');

// @desc    Get dashboard stats for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalQuestions = await Question.countDocuments({});
    const totalAnswers = await Answer.countDocuments({});
    const totalTags = await Tag.countDocuments({});
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalTags,
      pendingReports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role specified');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and all their questions, answers
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Admin cannot delete themselves');
    }

    // Delete questions asked by user
    const questions = await Question.find({ author: user._id });
    for (const q of questions) {
      // Decrement tag count
      for (const tagId of q.tags) {
        await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: -1 } });
      }
      await Answer.deleteMany({ question: q._id });
      await Report.deleteMany({ targetId: q._id, type: 'Question' });
      await Question.findByIdAndDelete(q._id);
    }

    // Delete answers written by user
    const userAnswers = await Answer.find({ author: user._id });
    for (const a of userAnswers) {
      await Report.deleteMany({ targetId: a._id, type: 'Answer' });
    }
    await Answer.deleteMany({ author: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User and all their contributions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'username')
      .populate({
        path: 'targetId',
        populate: { path: 'author', select: 'username' }
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit content report
// @route   POST /api/admin/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      res.status(400);
      throw new Error('Please fill in type, targetId and reason');
    }

    if (!['Question', 'Answer'].includes(type)) {
      res.status(400);
      throw new Error('Invalid report type. Use Question or Answer');
    }

    const report = await Report.create({
      reporter: req.user._id,
      type,
      targetId,
      reason
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (resolve, dismiss)
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['resolved', 'dismissed'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Use resolved or dismissed');
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    report.status = status;
    await report.save();

    res.json({ message: `Report status updated to ${status}`, report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tags
// @route   GET /api/admin/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tag (Admin only)
// @route   POST /api/admin/tags
// @access  Private/Admin
const createTag = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400);
      throw new Error('Please provide name and description for the tag');
    }

    const cleanName = name.toLowerCase().trim().replace(/\s+/g, '-');
    const tagExists = await Tag.findOne({ name: cleanName });

    if (tagExists) {
      res.status(400);
      throw new Error('Tag already exists');
    }

    const tag = await Tag.create({
      name: cleanName,
      description
    });

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tag
// @route   DELETE /api/admin/tags/:id
// @access  Private/Admin
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      res.status(404);
      throw new Error('Tag not found');
    }

    // Remove this tag reference from all questions
    await Question.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    await Tag.findByIdAndDelete(tag._id);

    res.json({ message: 'Tag removed from system successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all answers
// @route   GET /api/admin/answers
// @access  Private/Admin
const getAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({});
    for (const a of answers) {
      await a.populate('author');
      await a.populate('question');
    }
    res.json(answers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getReports,
  createReport,
  updateReportStatus,
  getTags,
  createTag,
  deleteTag,
  getAnswers
};
