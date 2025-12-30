const express = require('express');
const router = express.Router();
const {
  getRecruiterBids,
  getJobBids,
  getFreelancerBids,
  createBid,
  acceptBid,
  rejectBid,
  getAllocatedJobs
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Recruiter routes
router.get('/recruiter', getRecruiterBids);
router.get('/job/:jobId', getJobBids);

// Freelancer routes
router.get('/freelancer', getFreelancerBids);
router.get('/allocated', getAllocatedJobs);
router.post('/', createBid);

// Bid actions (recruiter only)
router.put('/:id/accept', acceptBid);
router.put('/:id/reject', rejectBid);

module.exports = router;
