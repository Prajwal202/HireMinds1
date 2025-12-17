const express = require('express');
const router = express.Router();
const {
  getFreelancerProfile,
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

// Stats route
router.get('/stats', getFreelancerStats);

// File upload routes
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/profile-image', upload.single('profileImage'), uploadProfileImage);

module.exports = router;
