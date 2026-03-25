const express = require('express');
const {
  createPaymentOrder,
  getProjectPayments,
  getFreelancerPayments,
  getPayableAmount,
  initializeMilestones,
  getRazorpayKey,
  verifyRazorpayPayment,
  recordUPIPayment,
  submitTransaction,
  acceptTransaction,
  rejectTransaction,
  verifyTransaction,
  rejectTransactionAsFreelancer
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
router.post('/submit-transaction', submitTransaction);
router.post('/accept-transaction', acceptTransaction);
router.post('/reject-transaction', rejectTransaction);

// Freelancer routes
router.post('/record-upi-payment', recordUPIPayment);
router.post('/verify-transaction', verifyTransaction);
router.post('/reject-transaction-freelancer', rejectTransactionAsFreelancer);
router.get('/freelancer/me', getFreelancerPayments);

// Project payments (accessible by recruiter, freelancer, and admin)
router.get('/project/:projectId', getProjectPayments);

module.exports = router;
