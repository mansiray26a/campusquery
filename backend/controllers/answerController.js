const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Report = require('../models/Report');
const { updateReputation, ACTIONS } = require('../utils/reputationCalculator');

// @desc    Add a new answer to a question
// @route   POST /api/answers
// @access  Private
const createAnswer = async (req, res, next) => {
  try {
    const { body, questionId } = req.body;

    if (!body || !questionId) {
      res.status(400);
      throw new Error('Please provide answer body and questionId');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    const answer = await Answer.create({
      body,
      question: questionId,
      author: req.user._id
    });

    res.status(201).json(answer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update answer body
// @route   PUT /api/answers/:id
// @access  Private
const updateAnswer = async (req, res, next) => {
  try {
    const { body } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      res.status(404);
      throw new Error('Answer not found');
    }

    // Only owner or admin can edit
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to edit this answer');
    }

    answer.body = body || answer.body;
    const updatedAnswer = await answer.save();

    res.json(updatedAnswer);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      res.status(404);
      throw new Error('Answer not found');
    }

    // Only owner or admin can delete
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this answer');
    }

    // If accepted answer, update question reference
    const question = await Question.findById(answer.question);
    if (question && question.acceptedAnswer && question.acceptedAnswer.toString() === answer._id.toString()) {
      question.acceptedAnswer = undefined;
      await question.save();
      
      // Revert reputation
      await updateReputation(answer.author, ACTIONS.ANSWER_UNACCEPT);
    }

    // Remove associated reports
    await Report.deleteMany({ targetId: answer._id, type: 'Answer' });

    // Delete answer
    await Answer.findByIdAndDelete(answer._id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark answer as accepted (best answer)
// @route   POST /api/answers/:id/accept
// @access  Private
const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      res.status(404);
      throw new Error('Answer not found');
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      res.status(404);
      throw new Error('Associated question not found');
    }

    // Only question author can accept answers
    if (question.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the author of the question can accept an answer');
    }

    // Case 1: Answer is already accepted -> Unaccept it
    if (answer.isAccepted) {
      answer.isAccepted = false;
      await answer.save();

      question.acceptedAnswer = undefined;
      await question.save();

      // Deduct reputation
      await updateReputation(answer.author, ACTIONS.ANSWER_UNACCEPT);

      return res.json({ message: 'Answer unaccepted', question, answer });
    }

    // Case 2: There is another accepted answer already -> Switch them
    if (question.acceptedAnswer) {
      const prevAcceptedAnswer = await Answer.findById(question.acceptedAnswer);
      if (prevAcceptedAnswer) {
        prevAcceptedAnswer.isAccepted = false;
        await prevAcceptedAnswer.save();
        
        // Deduct old author reputation
        await updateReputation(prevAcceptedAnswer.author, ACTIONS.ANSWER_UNACCEPT);
      }
    }

    // Accept new answer
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    // Reward new author reputation
    await updateReputation(answer.author, ACTIONS.ANSWER_ACCEPT);

    res.json({ message: 'Answer accepted as the best solution', question, answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
};
