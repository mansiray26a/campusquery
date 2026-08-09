const express = require('express');
const router = express.Router();
const {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAnswer);
router.route('/:id')
  .put(protect, updateAnswer)
  .delete(protect, deleteAnswer);

router.post('/:id/accept', protect, acceptAnswer);

module.exports = router;
