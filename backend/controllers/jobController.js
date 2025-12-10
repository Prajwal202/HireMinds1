const Job = require('../models/Job');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Only show open/bidding jobs to public, or all if authenticated recruiter/admin
    if (!req.user || (req.user.role !== 'employer' && req.user.role !== 'admin')) {
      query.status = { $in: ['open', 'bidding'] };
      // Also filter out jobs past bidding deadline
      query.biddingDeadline = { $gt: new Date() };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job (Recruiter only)
// @route   POST /api/v1/jobs
// @access  Private/Recruiter
const addJob = async (req, res, next) => {
  try {
    const { 
      title, 
      company, 
      location, 
      description, 
      salary, 
      type,
      biddingDeadline,
      biddingDuration 
    } = req.body;

    // Validation
    if (!title || !company || !location || !description) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Validate bidding deadline
    let deadline;
    if (biddingDeadline) {
      deadline = new Date(biddingDeadline);
      if (isNaN(deadline.getTime()) || deadline <= new Date()) {
        return next(new ErrorResponse('Bidding deadline must be a valid future date', 400));
      }
    } else if (biddingDuration) {
      // Calculate deadline from duration (in hours)
      const duration = parseInt(biddingDuration);
      if (duration < 1 || duration > 720) {
        return next(new ErrorResponse('Bidding duration must be between 1 and 720 hours (30 days)', 400));
      }
      deadline = new Date();
      deadline.setHours(deadline.getHours() + duration);
    } else {
      // Default to 24 hours
      deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      salary: salary || 'Not specified',
      type: type || 'Full-time',
      postedBy: req.user.id,
      status: 'open',
      biddingDeadline: deadline,
      biddingDuration: biddingDuration || 24
    });

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job (Recruiter only - owner or admin)
// @route   PUT /api/v1/jobs/:id
// @access  Private/Recruiter
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this job', 403));
    }

    // Don't allow updating if job is closed or cancelled
    if (job.status === 'closed' || job.status === 'cancelled') {
      return next(new ErrorResponse('Cannot update a closed or cancelled job', 400));
    }

    // Handle bidding deadline update
    if (req.body.biddingDeadline) {
      const deadline = new Date(req.body.biddingDeadline);
      if (isNaN(deadline.getTime()) || deadline <= new Date()) {
        return next(new ErrorResponse('Bidding deadline must be a valid future date', 400));
      }
      req.body.biddingDeadline = deadline;
    } else if (req.body.biddingDuration) {
      const duration = parseInt(req.body.biddingDuration);
      if (duration < 1 || duration > 720) {
        return next(new ErrorResponse('Bidding duration must be between 1 and 720 hours (30 days)', 400));
      }
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + duration);
      req.body.biddingDeadline = deadline;
    }

    // Prevent changing postedBy
    delete req.body.postedBy;

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email');

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job (Recruiter only - owner or admin)
// @route   DELETE /api/v1/jobs/:id
// @access  Private/Recruiter
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this job', 403));
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/v1/jobs/my-jobs
// @access  Private/Recruiter
const getMyJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { postedBy: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
  getMyJobs,
};
