const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getUserProfile,
  getUserDashboardData,
  toggleSaveQuestion
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/profile/:id', getUserProfile);
router.get('/dashboard/summary', protect, getUserDashboardData);
router.post('/save/:questionId', protect, toggleSaveQuestion);

module.exports = router;
