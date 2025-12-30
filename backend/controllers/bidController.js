const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

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

// @desc    Get all bids for a freelancer
// @route   GET /api/v1/bids/freelancer
// @access  Private (Freelancer only)
exports.getFreelancerBids = async (req, res, next) => {
  try {
    // Validate user is freelancer
    if (req.user.role !== 'freelancer') {
      return next(new ErrorResponse('Only freelancers can view their bids', 403));
    }

    const bids = await Bid.find({ freelancer: req.user.id })
      .populate('job', 'title company salary status')
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

    // Check if job is still open for bidding
    if (job.status === 'closed' || job.status === 'cancelled') {
      console.log('Job is not open for bidding:', job.status);
      return next(new ErrorResponse('This job is no longer accepting bids', 400));
    }

    // Check if bidding deadline has passed
    const now = new Date();
    if (now > job.biddingDeadline) {
      console.log('Bidding deadline has passed:', job.biddingDeadline);
      return next(new ErrorResponse('Bidding deadline has passed for this job', 400));
    }

    // Check if job is already allocated
    if (job.allocatedTo) {
      console.log('Job is already allocated:', job.allocatedTo);
      return next(new ErrorResponse('This job has already been allocated to a freelancer', 400));
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
      message: "Bid submitted successfully",
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

    // Check if job is already allocated
    if (job.allocatedTo) {
      return next(new ErrorResponse('Job has already been allocated to a freelancer', 400));
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update bid status to accepted
      bid.status = 'accepted';
      await bid.save({ session });

      // Reject all other bids for this job
      await Bid.updateMany(
        { job: job._id, _id: { $ne: bid._id } },
        { status: 'rejected' },
        { session }
      );

      // Allocate the job to the freelancer
      job.allocatedTo = bid.freelancer;
      job.allocatedAt = new Date();
      job.acceptedBid = bid._id;
      job.status = 'closed';
      job.closedAt = new Date();
      await job.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      console.log(`Job ${job._id} allocated to freelancer ${bid.freelancer}`);

      const populatedBid = await Bid.findById(bid._id)
        .populate('freelancer', 'name email')
        .populate('job', 'title company');

      res.status(200).json({
        success: true,
        message: 'Bid accepted and job allocated successfully',
        data: populatedBid
      });
    } catch (transactionError) {
      // Abort the transaction if something goes wrong
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error) {
    console.error('Error accepting bid:', error);
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

// @desc    Get allocated jobs for a freelancer
// @route   GET /api/v1/bids/allocated
// @access  Private (Freelancer only)
exports.getAllocatedJobs = async (req, res, next) => {
  try {
    // Validate user is freelancer
    if (req.user.role !== 'freelancer') {
      return next(new ErrorResponse('Only freelancers can view their allocated jobs', 403));
    }

    // Find accepted bids for this freelancer
    const acceptedBids = await Bid.find({ 
      freelancer: req.user.id, 
      status: 'accepted' 
    })
      .populate({
        path: 'job',
        populate: {
          path: 'postedBy',
          select: 'name email'
        }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: acceptedBids.length,
      data: acceptedBids
    });
  } catch (error) {
    console.error('Error fetching allocated jobs:', error);
    next(error);
  }
};

module.exports = {
  getRecruiterBids: exports.getRecruiterBids,
  getJobBids: exports.getJobBids,
  getFreelancerBids: exports.getFreelancerBids,
  createBid: exports.createBid,
  acceptBid: exports.acceptBid,
  rejectBid: exports.rejectBid,
  getAllocatedJobs: exports.getAllocatedJobs
};
