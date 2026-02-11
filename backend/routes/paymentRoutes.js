const express = require('express');
const {
  createPaymentOrder,
  getProjectPayments,
  getPayableAmount,
  initializeMilestones
} = require('../controllers/paymentControllerSimple');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Recruiter routes
router.post('/create-order', createPaymentOrder);
router.post('/initialize-milestones/:projectId', initializeMilestones);
router.get('/project/:projectId/payable-amount', getPayableAmount);

// Project payments (accessible by recruiter, freelancer, and admin)
router.get('/project/:projectId', getProjectPayments);

module.exports = router;
