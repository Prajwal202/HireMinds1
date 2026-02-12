const express = require('express');
const router = express.Router();
const {
  getFreelancerProfile,
  getFreelancerProfileById,
  updateFreelancerProfile,
  uploadResume,
  uploadProfileImage,
  getFreelancerStats
} = require('../controllers/freelancerController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply protection to all routes
router.use(protect);

// Profile routes
router
  .route('/profile')
  .get(getFreelancerProfile)
  .put(updateFreelancerProfile);

// Get freelancer profile by ID (for payment system)
router.get('/profile/:id', getFreelancerProfileById);

// Stats route
router.get('/stats', getFreelancerStats);

// File upload routes
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/profile-image', upload.single('profileImage'), uploadProfileImage);

module.exports = router;
