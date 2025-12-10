const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getJobs,
  updateJob,
  deleteJob,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Job management routes
router.route('/jobs')
  .get(getJobs);

router.route('/jobs/:id')
  .put(updateJob)
  .delete(deleteJob);

// Statistics route
router.route('/stats')
  .get(getStats);

module.exports = router;

