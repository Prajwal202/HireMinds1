const Job = require('../models/Job');
const Milestone = require('../models/Milestone');
const Payment = require('../models/Payment');
const ErrorResponse = require('../utils/errorResponse');

// Progress level mapping (same as projectController)
const progressLevels = {
  0: { status: 'Work Started', percentage: 0 },
  1: { status: 'Initial Development', percentage: 40 },
  2: { status: 'Midway Completed', percentage: 60 },
  3: { status: 'Almost Done', percentage: 80 },
  4: { status: 'Completed', percentage: 100 }
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
    const project = await Job.findById(projectId);
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

    // Check if payment already exists for this milestone
    const existingPayment = await Payment.findOne({ milestone: milestone._id });
    if (existingPayment) {
      return next(new ErrorResponse('Payment already created for this milestone', 400));
    }

    // Calculate payable amount
    const totalAmount = project.budget || project.acceptedBid?.bidAmount || 0;
    const payableAmount = (totalAmount * milestone.percentage) / 100;

    // Generate unique order ID
    const gatewayOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await Payment.create({
      project: projectId,
      milestone: milestone._id,
      recruiter: req.user.id,
      freelancer: project.allocatedTo,
      amount: payableAmount,
      gatewayOrderId: gatewayOrderId,
      transactionStatus: 'CREATED'
    });

    // Mock Razorpay order response
    const razorpayOrder = {
      id: gatewayOrderId,
      entity: 'order',
      amount: payableAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      status: 'created',
      notes: {
        projectId: projectId,
        milestoneLevel: milestoneLevel,
        paymentId: payment._id
      }
    };

    res.status(200).json({
      success: true,
      data: {
        payment: payment,
        razorpayOrder: razorpayOrder,
        milestone: milestone,
        project: {
          title: project.title,
          budget: project.budget || project.acceptedBid?.bidAmount || 0,
          currentLevel: project.progressLevel
        }
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    next(error);
  }
};

// @desc    Get payment status for a project
// @route   GET /api/v1/payments/project/:projectId
// @access  Private
exports.getProjectPayments = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // Get project details
    const project = await Job.findById(projectId);
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
          budget: project.budget || project.acceptedBid?.bidAmount || 0,
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

// @desc    Get payable amount for current milestone
// @route   GET /api/v1/payments/project/:projectId/payable-amount
// @access  Private (Recruiter only)
exports.getPayableAmount = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // Get project details
    const project = await Job.findById(projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the recruiter
    if (project.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view payable amount for this project', 403));
    }

    // Get current milestone
    const currentLevel = project.progressLevel;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 4) {
      return res.status(200).json({
        success: true,
        data: {
          isCompleted: true,
          message: 'Project is already completed'
        }
      });
    }

    const milestoneInfo = progressLevels[nextLevel];
    const totalAmount = project.budget || project.acceptedBid?.bidAmount || 0;
    const payableAmount = (totalAmount * milestoneInfo.percentage) / 100;

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      project: projectId,
      milestone: { $in: await Milestone.find({ project: projectId, level: nextLevel }).select('_id') }
    });

    res.status(200).json({
      success: true,
      data: {
        currentLevel: currentLevel,
        nextLevel: nextLevel,
        milestoneStatus: milestoneInfo.status,
        percentage: milestoneInfo.percentage,
        payableAmount: payableAmount,
        projectBudget: project.budget || project.acceptedBid?.bidAmount || 0,
        paymentExists: !!existingPayment,
        paymentStatus: existingPayment?.transactionStatus || null
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
