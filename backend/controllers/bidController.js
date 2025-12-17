const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all bids for a recruiter
// @route   GET /api/v1/bids/recruiter
// @access  Private (Recruiter only)
exports.getRecruiterBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ recruiter: req.user.id })
      .populate('job', 'title company description')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bids for a specific job
// @route   GET /api/v1/bids/job/:jobId
// @access  Private (Job owner only)
exports.getJobBids = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if user is the job owner
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view bids for this job', 401));
    }

    const bids = await Bid.find({ job: req.params.jobId })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new bid
// @route   POST /api/v1/bids
// @access  Private (Freelancer only)
exports.createBid = async (req, res, next) => {
  try {
    console.log('Creating bid:', { user: req.user.id, userRole: req.user.role, body: req.body });
    
    const { jobId, bidAmount, coverLetter } = req.body;

    // Validate user is freelancer
    if (req.user.role !== 'freelancer') {
      console.log('User is not a freelancer:', req.user.role);
      return next(new ErrorResponse('Only freelancers can place bids', 403));
    }

    // Validate job exists and is open for bidding
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.log('Job not found:', jobId);
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if freelancer already bid on this job
    const existingBid = await Bid.findOne({ job: jobId, freelancer: req.user.id });
    if (existingBid) {
      console.log('Freelancer already bid on this job');
      return next(new ErrorResponse('You have already placed a bid on this job', 400));
    }

    // Create bid
    const bid = await Bid.create({
      job: jobId,
      freelancer: req.user.id,
      recruiter: job.postedBy,
      bidAmount,
      coverLetter
    });

    console.log('Bid created successfully:', bid._id);

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancer', 'name email')
      .populate('job', 'title company');

    res.status(201).json({
      success: true,
      data: populatedBid
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    next(error);
  }
};

// @desc    Accept a bid (Recruiter only)
// @route   PUT /api/v1/bids/:id/accept
// @access  Private (Job owner only)
exports.acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return next(new ErrorResponse('Bid not found', 404));
    }

    const job = await Job.findById(bid.job);

    // Check if user is the job owner
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to accept bids for this job', 401));
    }

    // Update bid status
    bid.status = 'accepted';
    await bid.save();

    // Reject all other bids for this job
    await Bid.updateMany(
      { job: job._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancer', 'name email')
      .populate('job', 'title company');

    res.status(200).json({
      success: true,
      data: populatedBid
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a bid (Recruiter only)
// @route   PUT /api/v1/bids/:id/reject
// @access  Private (Job owner only)
exports.rejectBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return next(new ErrorResponse('Bid not found', 404));
    }

    const job = await Job.findById(bid.job);

    // Check if user is the job owner
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to reject bids for this job', 401));
    }

    // Update bid status
    bid.status = 'rejected';
    await bid.save();

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (error) {
    next(error);
  }
};
