const Job = require('../models/Job');
const Milestone = require('../models/Milestone');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendTransactionSubmissionEmailToRecruiter, sendTransactionAcceptanceEmailToFreelancer, sendTransactionRejectionEmailToFreelancer } = require('../utils/emailService');

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ErrorResponse('Razorpay API keys are not configured', 500);
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Progress level mapping (same as projectController)
const progressLevels = {
  0: { status: 'Work Started', percentage: 0 },
  1: { status: 'Initial Development', percentage: 40 },
  2: { status: 'Midway Completed', percentage: 60 },
  3: { status: 'Almost Done', percentage: 80 },
  4: { status: 'Completed', percentage: 100 }
};

const getProjectAmount = (project) => {
  return Number(
    project.budget ||
      project.budgetAmount ||
      project.salary ||
      project.acceptedBid?.bidAmount ||
      project.acceptedBid?.amount ||
      0
  );
};

// @desc    Create payment order for milestone
// @route   POST /api/v1/payments/create-order
// @access  Private (Recruiter only)
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { projectId, milestoneLevel } = req.body;

    // Validate inputs
    if (!projectId || milestoneLevel === undefined) {
      return next(new ErrorResponse('Project ID and milestone level are required', 400));
    }

    if (milestoneLevel < 0 || milestoneLevel > 4) {
      return next(new ErrorResponse('Invalid milestone level', 400));
    }

    // Get project details
    const project = await Job.findById(projectId).populate('acceptedBid', 'bidAmount amount');
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the recruiter who posted the project
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to create payment for this project', 403));
    }

    // Check if project is allocated
    if (!project.allocatedTo) {
      return next(new ErrorResponse('Project is not allocated to any freelancer', 400));
    }

    // Get or create milestone
    let milestone = await Milestone.findOne({ project: projectId, level: milestoneLevel });
    if (!milestone) {
      milestone = await Milestone.create({
        project: projectId,
        level: milestoneLevel,
        status: progressLevels[milestoneLevel].status,
        percentage: progressLevels[milestoneLevel].percentage
      });
    }

    // Check existing payment for this milestone
    const existingPayment = await Payment.findOne({ milestone: milestone._id });
    if (existingPayment && existingPayment.transactionStatus === 'PAID') {
      return next(new ErrorResponse('Payment already completed for this milestone', 400));
    }

    // Calculate payable amount
    const totalAmount = getProjectAmount(project);
    const payableAmount = Math.round((totalAmount * milestone.percentage) / 100);

    if (payableAmount <= 0) {
      return next(new ErrorResponse('Payable amount must be greater than 0', 400));
    }

    const razorpay = getRazorpayClient();

    const shortProjectId = String(projectId).slice(-8);
    const shortTs = String(Date.now()).slice(-6);
    const receipt = `rcpt_${shortProjectId}_${milestoneLevel}_${shortTs}`;

    const order = await razorpay.orders.create({
      amount: payableAmount * 100, // paise
      currency: 'INR',
      receipt,
      notes: {
        projectId: String(projectId),
        milestoneLevel: String(milestoneLevel)
      }
    });

    let payment;
    if (existingPayment) {
      // Retry flow after cancel/failure: refresh order and keep same record.
      existingPayment.amount = payableAmount;
      existingPayment.currency = 'INR';
      existingPayment.gateway = 'razorpay';
      existingPayment.gatewayOrderId = order.id;
      existingPayment.transactionId = order.id;
      existingPayment.gatewayPaymentId = null;
      existingPayment.gatewaySignature = null;
      existingPayment.transactionStatus = 'CREATED';
      existingPayment.paidAt = null;
      payment = await existingPayment.save();
    } else {
      payment = await Payment.create({
        project: projectId,
        milestone: milestone._id,
        recruiter: req.user.id,
        freelancer: project.allocatedTo,
        amount: payableAmount,
        currency: 'INR',
        gateway: 'razorpay',
        gatewayOrderId: order.id,
        transactionId: order.id,
        transactionStatus: 'CREATED'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment: payment,
        razorpayOrder: order,
        milestone: milestone,
        project: {
          title: project.title,
          budget: totalAmount,
          currentLevel: project.progressLevel
        }
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    next(error);
  }
};

// @desc    Get Razorpay key id for frontend checkout
// @route   GET /api/v1/payments/razorpay-key
// @access  Private
exports.getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      keyId: process.env.RAZORPAY_KEY_ID || ''
    }
  });
};

// @desc    Verify Razorpay payment signature and mark as PAID
// @route   POST /api/v1/payments/verify
// @access  Private (Recruiter only)
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new ErrorResponse('Missing Razorpay verification fields', 400));
    }

    const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
    if (!payment) {
      return next(new ErrorResponse('Payment record not found for this order', 404));
    }

    // Only the recruiter who created the payment can verify it (or admin)
    const isOwner = payment.recruiter.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized to verify this payment', 403));
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      payment.transactionStatus = 'FAILED';
      payment.gatewayPaymentId = razorpay_payment_id;
      payment.gatewaySignature = razorpay_signature;
      await payment.save();
      return next(new ErrorResponse('Invalid payment signature', 400));
    }

    payment.transactionStatus = 'PAID';
    payment.transactionId = razorpay_payment_id;
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.gatewaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    return res.status(200).json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return next(error);
  }
};

// @desc    Get payment status for a project
// @route   GET /api/v1/payments/project/:projectId
// @access  Private
exports.getProjectPayments = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // Get project details
    const project = await Job.findById(projectId).populate('acceptedBid', 'bidAmount amount');
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check authorization
    const isRecruiter = project.postedBy.toString() === req.user.id;
    const isFreelancer = project.allocatedTo?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isFreelancer && !isAdmin) {
      return next(new ErrorResponse('Not authorized to view payments for this project', 403));
    }

    // Get all milestones for this project
    const milestones = await Milestone.find({ project: projectId }).sort({ level: 1 });

    // Get all payments for this project
    const payments = await Payment.find({ project: projectId })
      .populate('milestone')
      .populate('recruiter', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id,
          title: project.title,
          budget: getProjectAmount(project),
          currentLevel: project.progressLevel,
          status: project.projectStatus
        },
        milestones: milestones,
        payments: payments
      }
    });
  } catch (error) {
    console.error('Error getting project payments:', error);
    next(error);
  }
};

// @desc    Get payments received by logged-in freelancer
// @route   GET /api/v1/payments/freelancer/me
// @access  Private (Freelancer/Admin)
exports.getFreelancerPayments = async (req, res, next) => {
  try {
    if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Only freelancers can view this payment list', 403));
    }

    // Get all payments for this freelancer (both paid and pending)
    const payments = await Payment.find({
      freelancer: req.user.id
    })
      .populate('project', 'title company')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    const totalReceived = payments
      .filter(p => p.transactionStatus === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalReceived,
        count: payments.length,
        payments
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get payable amount for current milestone
// @route   GET /api/v1/payments/project/:projectId/payable-amount
// @access  Private (Recruiter only)
exports.getPayableAmount = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // Get project details
    const project = await Job.findById(projectId).populate('acceptedBid', 'bidAmount amount');
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the recruiter
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view payable amount for this project', 403));
    }

    // Pay for current milestone shown in UI.
    const currentLevel = project.progressLevel || 0;
    if (currentLevel <= 0) {
      return res.status(200).json({
        success: true,
        data: {
          currentLevel: 0,
          currentMilestoneStatus: 'Work Started',
          currentPercentage: 0,
          milestoneStatus: 'Work Started',
          percentage: 0,
          payableAmount: 0,
          projectBudget: getProjectAmount(project),
          paymentExists: false,
          paymentStatus: null,
          isCompleted: false,
          message: 'No payment required'
        }
      });
    }

    if (currentLevel > 4) {
      return res.status(200).json({
        success: true,
        data: {
          isCompleted: true,
          message: 'Project is already completed'
        }
      });
    }

    const milestoneInfo = progressLevels[currentLevel];
    const totalAmount = getProjectAmount(project);
    const payableAmount = Math.round((totalAmount * milestoneInfo.percentage) / 100);

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      project: projectId,
      milestone: { $in: await Milestone.find({ project: projectId, level: currentLevel }).select('_id') }
    });

    const isPaymentCompleted = existingPayment?.transactionStatus === 'PAID';

    res.status(200).json({
      success: true,
      data: {
        currentLevel: currentLevel,
        nextLevel: currentLevel + 1,
        currentMilestoneStatus: milestoneInfo.status,
        currentPercentage: milestoneInfo.percentage,
        milestoneStatus: milestoneInfo.status,
        percentage: milestoneInfo.percentage,
        payableAmount: payableAmount,
        projectBudget: totalAmount,
        paymentExists: !!existingPayment && isPaymentCompleted,
        paymentStatus: existingPayment?.transactionStatus || null,
        isCompleted: currentLevel >= 4,
        message: currentLevel >= 4 ? 'Project is completed' : `Payment due for ${milestoneInfo.status}`
      }
    });
  } catch (error) {
    console.error('Error getting payable amount:', error);
    next(error);
  }
};

// @desc    Initialize milestones for a project
// @route   POST /api/v1/payments/initialize-milestones/:projectId
// @access  Private (Recruiter only)
exports.initializeMilestones = async (req, res, next) => {
  try {
    console.log('=== INITIALIZE MILESTONES DEBUG ===');
    console.log('Request params:', req.params);
    console.log('User:', req.user);
    
    const { projectId } = req.params;

    // Get project details
    const project = await Job.findById(projectId);
    console.log('Found project:', project);
    
    if (!project) {
      console.log('Project not found');
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the recruiter who posted the project
    if (project.postedBy.toString() !== req.user.id) {
      console.log('User not authorized - postedBy:', project.postedBy, 'userId:', req.user.id);
      return next(new ErrorResponse('Not authorized to initialize milestones for this project', 403));
    }

    // Check if milestones already exist
    const existingMilestones = await Milestone.find({ project: projectId });
    console.log('Existing milestones:', existingMilestones);
    
    if (existingMilestones.length > 0) {
      console.log('Milestones already exist');
      return next(new ErrorResponse('Milestones already exist for this project', 400));
    }

    // Create milestones for all levels
    const milestones = [];
    console.log('Creating milestones for levels:', Object.keys(progressLevels));
    
    for (const [level, data] of Object.entries(progressLevels)) {
      console.log(`Creating milestone ${level}:`, data);
      
      const milestone = await Milestone.create({
        project: projectId,
        level: parseInt(level),
        status: data.status,
        percentage: data.percentage
      });
      
      console.log(`Created milestone:`, milestone);
      milestones.push(milestone);
    }

    console.log('All milestones created successfully:', milestones);

    res.status(200).json({
      success: true,
      data: {
        message: 'Milestones initialized successfully',
        milestones: milestones
      }
    });
  } catch (error) {
    console.error('Error initializing milestones:', error);
    next(error);
  }
};

// @desc    Record direct UPI payment (when freelancer confirms payment received)
// @route   POST /api/v1/payments/record-upi-payment
// @access  Private (Freelancer only)
exports.recordUPIPayment = async (req, res, next) => {
  try {
    const { projectId, amount, milestoneLevel, paymentReference } = req.body;

    if (!projectId || !amount) {
      return next(new ErrorResponse('Project ID and amount are required', 400));
    }

    // Get project details
    const project = await Job.findById(projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the freelancer allocated to this project
    if (project.allocatedTo?.toString() !== req.user.id) {
      return next(new ErrorResponse('Only the allocated freelancer can record payment', 403));
    }

    // Get or create milestone
    let milestone = await Milestone.findOne({ project: projectId, level: milestoneLevel || 0 });
    if (!milestone) {
      milestone = await Milestone.create({
        project: projectId,
        level: milestoneLevel || 0,
        status: progressLevels[milestoneLevel || 0].status,
        percentage: progressLevels[milestoneLevel || 0].percentage
      });
    }

    // Check if payment already exists for this milestone
    const existingPayment = await Payment.findOne({ milestone: milestone._id });
    if (existingPayment && existingPayment.transactionStatus === 'PAID') {
      return next(new ErrorResponse('Payment already recorded for this milestone', 400));
    }

    // Create payment record
    const payment = await Payment.create({
      project: projectId,
      milestone: milestone._id,
      recruiter: project.postedBy,
      freelancer: req.user.id,
      amount: Number(amount),
      currency: 'INR',
      gateway: 'UPI_DIRECT',
      gatewayOrderId: `UPI_${Date.now()}`,
      transactionId: paymentReference || `UPI_TXN_${Date.now()}`,
      transactionStatus: 'PAID',
      paidAt: new Date(),
      notes: 'Direct UPI payment confirmed by freelancer'
    });

    // Send email notification to recruiter about transaction submission
    try {
      const recruiter = await User.findById(project.postedBy);
      const milestoneInfo = progressLevels[milestoneLevel || 0];

      if (recruiter) {
        await sendTransactionSubmissionEmailToRecruiter(
          recruiter.email,
          recruiter.name,
          req.user.name, // Freelancer name
          project.title,
          Number(amount),
          payment.transactionId,
          milestoneInfo.status
        );

        console.log('Transaction submission email sent to recruiter');
      }
    } catch (emailError) {
      console.error('Error sending transaction submission email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'UPI payment recorded successfully'
      }
    });
  } catch (error) {
    console.error('Error recording UPI payment:', error);
    next(error);
  }
};

// @desc    Submit transaction details by recruiter
// @route   POST /api/v1/payments/submit-transaction
// @access  Private (Recruiter only)
exports.submitTransaction = async (req, res, next) => {
  try {
    const { projectId, amount, milestoneLevel, transactionId, freelancerUpiId } = req.body;

    if (!projectId || !amount || !transactionId) {
      return next(new ErrorResponse('Project ID, amount, and transaction ID are required', 400));
    }

    // Get project details
    const project = await Job.findById(projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the recruiter who posted the project
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Only the recruiter who posted this project can submit transaction details', 403));
    }

    // Check if project is allocated to a freelancer
    if (!project.allocatedTo) {
      return next(new ErrorResponse('Project is not allocated to any freelancer', 400));
    }

    // Get or create milestone
    let milestone = await Milestone.findOne({ project: projectId, level: milestoneLevel || 1 });
    if (!milestone) {
      milestone = await Milestone.create({
        project: projectId,
        level: milestoneLevel || 1,
        status: progressLevels[milestoneLevel || 1].status,
        percentage: progressLevels[milestoneLevel || 1].percentage
      });
    }

    // Check if payment already exists for this milestone
    const existingPayment = await Payment.findOne({ milestone: milestone._id });
    if (existingPayment && existingPayment.transactionStatus === 'PAID' && existingPayment.verified) {
      return next(new ErrorResponse('Payment has already been processed for this milestone', 400));
    }

    // Create or update payment record
    let payment;
    if (existingPayment) {
      // Update existing payment
      existingPayment.amount = Number(amount);
      existingPayment.transactionId = transactionId;
      existingPayment.gatewayOrderId = `RECRUITER_${Date.now()}`;
      existingPayment.transactionStatus = 'CREATED';
      existingPayment.paidAt = null;
      existingPayment.verified = false;
      existingPayment.verifiedAt = null;
      existingPayment.verifiedBy = null;
      existingPayment.rejectionReason = null;
      existingPayment.rejectedAt = null;
      existingPayment.rejectedBy = null;
      payment = await existingPayment.save();
    } else {
      // Create new payment record
      payment = await Payment.create({
        project: projectId,
        milestone: milestone._id,
        recruiter: req.user.id,
        freelancer: project.allocatedTo,
        amount: Number(amount),
        currency: 'INR',
        gateway: 'RECRUITER_SUBMITTED',
        gatewayOrderId: `RECRUITER_${Date.now()}`,
        transactionId: transactionId,
        transactionStatus: 'CREATED',
        paidAt: null,
        verified: false,
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        notes: `Transaction submitted by recruiter. Freelancer UPI: ${freelancerUpiId || 'Not provided'}`
      });
    }

    // Send email notification to freelancer about transaction submission
    try {
      const freelancer = await User.findById(project.allocatedTo);
      const recruiter = await User.findById(project.postedBy);
      const milestoneInfo = progressLevels[milestoneLevel || 1];

      if (freelancer && recruiter) {
        await sendTransactionSubmissionEmailToRecruiter(
          recruiter.email,
          recruiter.name,
          freelancer.name,
          project.title,
          Number(amount),
          transactionId,
          milestoneInfo.status
        );

        console.log('Transaction submission email sent to recruiter');
      }
    } catch (emailError) {
      console.error('Error sending transaction submission email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'Transaction details submitted successfully. Waiting for freelancer verification.'
      }
    });
  } catch (error) {
    console.error('Error submitting transaction details:', error);
    next(error);
  }
};
// @route   POST /api/v1/payments/accept-transaction
// @access  Private (Recruiter only)
exports.acceptTransaction = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return next(new ErrorResponse('Payment ID is required', 400));
    }

    // Get payment details
    const payment = await Payment.findById(paymentId).populate('project').populate('freelancer');
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check if user is the recruiter who posted the project
    const project = await Job.findById(payment.project);
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to accept this transaction', 403));
    }

    // Check if payment is already processed
    if (payment.transactionStatus === 'PAID' && payment.verified) {
      return next(new ErrorResponse('Transaction is already accepted', 400));
    }

    // Update payment status to verified
    payment.verified = true;
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user.id;
    await payment.save();

    // Send email notification to freelancer
    try {
      const recruiter = await User.findById(project.postedBy);
      const milestone = await Milestone.findById(payment.milestone);
      const milestoneInfo = progressLevels[milestone.level];

      if (recruiter && payment.freelancer) {
        await sendTransactionAcceptanceEmailToFreelancer(
          payment.freelancer.email,
          payment.freelancer.name,
          project.title,
          project.company || 'Company',
          payment.amount,
          payment.transactionId,
          milestoneInfo.status
        );

        console.log('Transaction acceptance email sent to freelancer');
      }
    } catch (emailError) {
      console.error('Error sending transaction acceptance email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'Transaction accepted successfully'
      }
    });
  } catch (error) {
    console.error('Error accepting transaction:', error);
    next(error);
  }
};

// @desc    Reject transaction ID submitted by freelancer
// @route   POST /api/v1/payments/reject-transaction
// @access  Private (Recruiter only)
exports.rejectTransaction = async (req, res, next) => {
  try {
    const { paymentId, rejectionReason } = req.body;

    if (!paymentId) {
      return next(new ErrorResponse('Payment ID is required', 400));
    }

    // Get payment details
    const payment = await Payment.findById(paymentId).populate('project').populate('freelancer');
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check if user is the recruiter who posted the project
    const project = await Job.findById(payment.project);
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to reject this transaction', 403));
    }

    // Check if payment is already processed
    if (payment.transactionStatus === 'PAID' && payment.verified) {
      return next(new ErrorResponse('Transaction is already accepted', 400));
    }

    // Update payment status to rejected
    payment.transactionStatus = 'REJECTED';
    payment.rejectionReason = rejectionReason || 'Invalid transaction details';
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user.id;
    await payment.save();

    // Send email notification to freelancer
    try {
      const recruiter = await User.findById(project.postedBy);
      const milestone = await Milestone.findById(payment.milestone);
      const milestoneInfo = progressLevels[milestone.level];

      if (recruiter && payment.freelancer) {
        await sendTransactionRejectionEmailToFreelancer(
          payment.freelancer.email,
          payment.freelancer.name,
          project.title,
          project.company || 'Company',
          payment.amount,
          payment.transactionId,
          milestoneInfo.status,
          payment.rejectionReason
        );

        console.log('Transaction rejection email sent to freelancer');
      }
    } catch (emailError) {
      console.error('Error sending transaction rejection email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'Transaction rejected successfully'
      }
    });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    next(error);
  }
};

// @desc    Verify transaction as freelancer (accept payment)
// @route   POST /api/v1/payments/verify-transaction
// @access  Private (Freelancer only)
exports.verifyTransaction = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return next(new ErrorResponse('Payment ID is required', 400));
    }

    // Get payment details
    const payment = await Payment.findById(paymentId).populate('project').populate('freelancer');
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check if user is the freelancer assigned to this payment
    if (payment.freelancer._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Only the assigned freelancer can verify this transaction', 403));
    }

    // Check if payment is already processed
    if (payment.transactionStatus === 'PAID' && payment.verified) {
      return next(new ErrorResponse('Transaction is already verified', 400));
    }

    // Update payment status to verified
    payment.transactionStatus = 'PAID';
    payment.verified = true;
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user.id;
    payment.paidAt = new Date();
    await payment.save();

    // Send email notification to freelancer
    try {
      const recruiter = await User.findById(payment.project.postedBy);
      const milestone = await Milestone.findById(payment.milestone);
      const milestoneInfo = progressLevels[milestone.level];

      if (recruiter && payment.freelancer) {
        await sendTransactionAcceptanceEmailToFreelancer(
          payment.freelancer.email,
          payment.freelancer.name,
          payment.project.title,
          payment.project.company || 'Company',
          payment.amount,
          payment.transactionId,
          milestoneInfo.status
        );

        console.log('Transaction acceptance email sent to freelancer');
      }
    } catch (emailError) {
      console.error('Error sending transaction acceptance email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'Transaction verified successfully'
      }
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    next(error);
  }
};

// @desc    Reject transaction as freelancer
// @route   POST /api/v1/payments/reject-transaction-freelancer
// @access  Private (Freelancer only)
exports.rejectTransactionAsFreelancer = async (req, res, next) => {
  try {
    const { paymentId, rejectionReason } = req.body;

    if (!paymentId) {
      return next(new ErrorResponse('Payment ID is required', 400));
    }

    // Get payment details
    const payment = await Payment.findById(paymentId).populate('project').populate('freelancer');
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Check if user is the freelancer assigned to this payment
    if (payment.freelancer._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Only the assigned freelancer can reject this transaction', 403));
    }

    // Check if payment is already processed
    if (payment.transactionStatus === 'PAID' && payment.verified) {
      return next(new ErrorResponse('Transaction is already verified', 400));
    }

    // Update payment status to rejected
    payment.transactionStatus = 'REJECTED';
    payment.rejectionReason = rejectionReason || 'Transaction details could not be verified';
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user.id;
    await payment.save();

    // Send email notification to freelancer
    try {
      const recruiter = await User.findById(payment.project.postedBy);
      const milestone = await Milestone.findById(payment.milestone);
      const milestoneInfo = progressLevels[milestone.level];

      if (recruiter && payment.freelancer) {
        await sendTransactionRejectionEmailToFreelancer(
          payment.freelancer.email,
          payment.freelancer.name,
          payment.project.title,
          payment.project.company || 'Company',
          payment.amount,
          payment.transactionId,
          milestoneInfo.status,
          payment.rejectionReason
        );

        console.log('Transaction rejection email sent to freelancer');
      }
    } catch (emailError) {
      console.error('Error sending transaction rejection email:', emailError);
      // Continue with the response even if email fails
    }

    return res.status(200).json({
      success: true,
      data: {
        payment,
        message: 'Transaction rejected successfully'
      }
    });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    next(error);
  }
};
