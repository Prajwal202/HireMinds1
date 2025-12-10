const express = require('express');
const router = express.Router();
const {
  register,
  login,
  loginWithRole,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Role-specific login routes (optional convenience routes)
router.post('/login/freelancer', loginWithRole);
router.post('/login/recruiter', loginWithRole);
router.post('/login/employer', loginWithRole);
router.post('/login/admin', loginWithRole);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
