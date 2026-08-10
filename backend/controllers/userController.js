const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// @desc    Update user profile settings
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        reputation: updatedUser.reputation,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture
      });
    } else {
      res.status(404);
      throw new Error('User account not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile details
// @route   GET /api/users/profile/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const rawQuestions = await Question.find({ author: req.params.id });
    const questions = [];
    for (const q of rawQuestions) {
      await q.populate('author');
      await q.populate('tags');
      questions.push(q);
    }

    const answersCount = await Answer.countDocuments({ author: req.params.id });

    res.json({
      _id: user._id,
      username: user.username,
      reputation: user.reputation,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      role: user.role,
      questions,
      answersCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats & logs
// @route   GET /api/users/dashboard/summary
// @access  Private
const getUserDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    // Manually populate savedQuestions
    const populatedSavedQuestions = [];
    for (const qId of user.savedQuestions) {
       const q = await Question.findById(qId);
       if (q) {
          await q.populate('author');
          await q.populate('tags');
          populatedSavedQuestions.push(q);
       }
    }
    user.savedQuestions = populatedSavedQuestions;


    const questionCount = await Question.countDocuments({ author: userId });
    const answerCount = await Answer.countDocuments({ author: userId });

    const recentQuestionsRaw = await Question.find({ author: userId }).limit(5);
    const recentQuestions = [];
    for (const q of recentQuestionsRaw) {
      await q.populate('author');
      await q.populate('tags');
      recentQuestions.push(q);
    }

    const acceptedAnswersCount = await Answer.countDocuments({ author: userId, isAccepted: true });

    res.json({
      reputation: user.reputation,
      questionCount,
      answerCount,
      acceptedAnswersCount,
      recentQuestions,
      savedQuestions: user.savedQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle saving bookmark for a question
// @route   POST /api/users/save/:questionId
// @access  Private
const toggleSaveQuestion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const questionId = req.params.questionId;

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    const isSaved = user.savedQuestions.includes(questionId);

    if (isSaved) {
      user.savedQuestions = user.savedQuestions.filter(
        (id) => id.toString() !== questionId
      );
    } else {
      user.savedQuestions.push(questionId);
    }

    await user.save();

    res.json({
      savedQuestions: user.savedQuestions,
      isSaved: !isSaved
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getUserProfile,
  getUserDashboardData,
  toggleSaveQuestion
};
