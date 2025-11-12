const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// Routes
router.route('/').get(getJobs).post(addJob);

router.route('/:id').get(getJob).put(updateJob).delete(deleteJob);

module.exports = router;
