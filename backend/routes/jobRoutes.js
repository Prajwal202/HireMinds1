const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.route('/').get(getJobs);
router.route('/:id').get(getJob);

// Protected routes - Recruiter only
router.use(protect);
router.use(authorize('employer', 'admin')); // authorize accepts multiple roles

router.route('/').post(addJob);
router.route('/my-jobs').get(getMyJobs);
router.route('/:id').put(updateJob).delete(deleteJob);

module.exports = router;
