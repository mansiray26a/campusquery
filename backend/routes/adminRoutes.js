const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Student routes (accessible to authenticated users or public)
router.post('/reports', protect, createReport);
router.get('/tags', getTags);

// Admin-only routes
router.get('/stats', protect, admin, getAdminStats);
router.get('/answers', protect, admin, getAnswers);

router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.put('/users/:id/role', protect, admin, updateUserRole);

router.route('/reports')
  .get(protect, admin, getReports);

router.put('/reports/:id', protect, admin, updateReportStatus);

router.route('/tags')
  .post(protect, admin, createTag);

router.route('/tags/:id')
  .delete(protect, admin, deleteTag);

module.exports = router;
