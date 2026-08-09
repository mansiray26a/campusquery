const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionDetails,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createQuestion)
  .get(getAllQuestions);

router.route('/:id')
  .get(getQuestionDetails)
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

module.exports = router;
