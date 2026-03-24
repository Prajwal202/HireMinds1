const express = require('express');
const {
  createPaymentOrder,
  getProjectPayments,
  getFreelancerPayments,
  getPayableAmount,
  initializeMilestones,
  getRazorpayKey,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Recruiter routes
router.post('/create-order', createPaymentOrder);
router.get('/razorpay-key', getRazorpayKey);
router.post('/verify', verifyRazorpayPayment);
router.post('/initialize-milestones/:projectId', initializeMilestones);
router.get('/project/:projectId/payable-amount', getPayableAmount);
router.get('/freelancer/me', getFreelancerPayments);

// Project payments (accessible by recruiter, freelancer, and admin)
router.get('/project/:projectId', getProjectPayments);

module.exports = router;
