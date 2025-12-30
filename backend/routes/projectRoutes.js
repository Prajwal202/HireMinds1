const express = require('express');
const {
  getFreelancerActiveProjects,
  getFreelancerRecentProjects,
  getProjectDetails,
  updateProjectProgress,
  getRecruiterActiveProjects,
  getProgressLevels
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Progress levels endpoint
router.get('/progress-levels', getProgressLevels);

// Freelancer routes
router.get('/freelancer/active', getFreelancerActiveProjects);
router.get('/freelancer/recent', getFreelancerRecentProjects);

// Recruiter routes
router.get('/recruiter/active', getRecruiterActiveProjects);

// Project specific routes
router.get('/:id', getProjectDetails);
router.put('/:id/progress', updateProjectProgress);

module.exports = router;
