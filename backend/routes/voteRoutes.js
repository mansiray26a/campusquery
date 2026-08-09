const express = require('express');
const router = express.Router();
const { voteQuestion, voteAnswer } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/question/:id', protect, voteQuestion);
router.post('/answer/:id', protect, voteAnswer);

module.exports = router;
