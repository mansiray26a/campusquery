const express = require('express');
const router = express.Router();
const { generateAIAnswer } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ai/answer — generate AI answer for a question (auth required)
router.post('/answer', protect, generateAIAnswer);

module.exports = router;
