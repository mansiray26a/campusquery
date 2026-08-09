const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { updateReputation, ACTIONS } = require('../utils/reputationCalculator');

// @desc    Vote on a Question (upvote / downvote)
// @route   POST /api/votes/question/:id
// @access  Private
const voteQuestion = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const questionId = req.params.id;
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      res.status(400);
      throw new Error("Invalid vote type. Use 'upvote' or 'downvote'");
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    const authorId = question.author;
    const isSelfVote = authorId.toString() === userId.toString();

    let alreadyUpvoted = question.upvotes.includes(userId);
    let alreadyDownvoted = question.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (alreadyUpvoted) {
        question.upvotes = question.upvotes.filter((id) => id.toString() !== userId.toString());
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_UPVOTE_REVERT);
      } else {
        question.upvotes.push(userId);
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_UPVOTE);
        
        if (alreadyDownvoted) {
          question.downvotes = question.downvotes.filter((id) => id.toString() !== userId.toString());
          if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_DOWNVOTE_REVERT);
        }
      }
    } else {
      if (alreadyDownvoted) {
        question.downvotes = question.downvotes.filter((id) => id.toString() !== userId.toString());
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_DOWNVOTE_REVERT);
      } else {
        question.downvotes.push(userId);
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_DOWNVOTE);

        if (alreadyUpvoted) {
          question.upvotes = question.upvotes.filter((id) => id.toString() !== userId.toString());
          if (!isSelfVote) await updateReputation(authorId, ACTIONS.QUESTION_UPVOTE_REVERT);
        }
      }
    }

    question.voteScore = question.upvotes.length - question.downvotes.length;
    await question.save();

    res.json({
      voteScore: question.voteScore,
      upvotes: question.upvotes,
      downvotes: question.downvotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on an Answer (upvote / downvote)
// @route   POST /api/votes/answer/:id
// @access  Private
const voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const answerId = req.params.id;
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      res.status(400);
      throw new Error("Invalid vote type. Use 'upvote' or 'downvote'");
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      res.status(404);
      throw new Error('Answer not found');
    }

    const authorId = answer.author;
    const isSelfVote = authorId.toString() === userId.toString();

    let alreadyUpvoted = answer.upvotes.includes(userId);
    let alreadyDownvoted = answer.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (alreadyUpvoted) {
        answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId.toString());
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_UPVOTE_REVERT);
      } else {
        answer.upvotes.push(userId);
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_UPVOTE);

        if (alreadyDownvoted) {
          answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId.toString());
          if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_DOWNVOTE_REVERT);
        }
      }
    } else {
      if (alreadyDownvoted) {
        answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId.toString());
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_DOWNVOTE_REVERT);
      } else {
        answer.downvotes.push(userId);
        if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_DOWNVOTE);

        if (alreadyUpvoted) {
          answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId.toString());
          if (!isSelfVote) await updateReputation(authorId, ACTIONS.ANSWER_UPVOTE_REVERT);
        }
      }
    }

    answer.voteScore = answer.upvotes.length - answer.downvotes.length;
    await answer.save();

    res.json({
      voteScore: answer.voteScore,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  voteQuestion,
  voteAnswer
};
