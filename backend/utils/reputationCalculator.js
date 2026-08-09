const User = require('../models/User');

const ACTIONS = {
  QUESTION_UPVOTE: 'QUESTION_UPVOTE',
  QUESTION_DOWNVOTE: 'QUESTION_DOWNVOTE',
  ANSWER_UPVOTE: 'ANSWER_UPVOTE',
  ANSWER_DOWNVOTE: 'ANSWER_DOWNVOTE',
  ANSWER_ACCEPT: 'ANSWER_ACCEPT',
  ANSWER_UNACCEPT: 'ANSWER_UNACCEPT',
  QUESTION_UPVOTE_REVERT: 'QUESTION_UPVOTE_REVERT',
  QUESTION_DOWNVOTE_REVERT: 'QUESTION_DOWNVOTE_REVERT',
  ANSWER_UPVOTE_REVERT: 'ANSWER_UPVOTE_REVERT',
  ANSWER_DOWNVOTE_REVERT: 'ANSWER_DOWNVOTE_REVERT'
};

const updateReputation = async (userId, action) => {
  try {
    let repChange = 0;
    switch (action) {
      case ACTIONS.QUESTION_UPVOTE:
        repChange = 10;
        break;
      case ACTIONS.QUESTION_DOWNVOTE:
        repChange = -2;
        break;
      case ACTIONS.ANSWER_UPVOTE:
        repChange = 15;
        break;
      case ACTIONS.ANSWER_DOWNVOTE:
        repChange = -2;
        break;
      case ACTIONS.ANSWER_ACCEPT:
        repChange = 20;
        break;
      case ACTIONS.ANSWER_UNACCEPT:
        repChange = -20;
        break;
      case ACTIONS.QUESTION_UPVOTE_REVERT:
        repChange = -10;
        break;
      case ACTIONS.QUESTION_DOWNVOTE_REVERT:
        repChange = 2;
        break;
      case ACTIONS.ANSWER_UPVOTE_REVERT:
        repChange = -15;
        break;
      case ACTIONS.ANSWER_DOWNVOTE_REVERT:
        repChange = 2;
        break;
      default:
        repChange = 0;
    }

    if (repChange !== 0) {
      await User.findByIdAndUpdate(userId, { $inc: { reputation: repChange } });
    }
  } catch (error) {
    console.error(`Error updating reputation for user ${userId}:`, error.message);
  }
};

module.exports = {
  ACTIONS,
  updateReputation
};
