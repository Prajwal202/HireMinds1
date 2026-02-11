const Message = require('../models/Message');
const Job = require('../models/Job');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get conversations for a user (only for allocated jobs)
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find all jobs where the user is either the recruiter or allocated freelancer
    const jobs = await Job.find({
      $or: [
        { postedBy: userId, allocatedTo: { $exists: true, $ne: null } },
        { allocatedTo: userId }
      ]
    })
    .populate('postedBy', 'name email')
    .populate('allocatedTo', 'name email')
    .populate('acceptedBid', 'bidAmount')
    .sort({ updatedAt: -1 });

    // Get latest message for each conversation
    const conversations = await Promise.all(
      jobs.map(async (job) => {
        const otherUserId = job.postedBy._id.toString() === userId 
          ? job.allocatedTo._id.toString() 
          : job.postedBy._id.toString();

        const latestMessage = await Message.findOne({
          job: job._id,
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ],
          isDeleted: false
        })
        .populate('sender', 'name email')
        .sort({ timestamp: -1 });

        const unreadCount = await Message.countDocuments({
          job: job._id,
          sender: otherUserId,
          receiver: userId,
          isRead: false,
          isDeleted: false
        });

        const otherUser = job.postedBy._id.toString() === userId ? job.allocatedTo : job.postedBy;

        return {
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email
          },
          latestMessage: latestMessage || null,
          unreadCount,
          allocatedAt: job.allocatedAt,
          bidAmount: job.acceptedBid?.bidAmount || null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a specific job conversation
// @route   GET /api/v1/messages/job/:jobId
// @access  Private
exports.getJobMessages = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    // Verify job exists and user is part of it
    const job = await Job.findById(jobId);
    
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if user is authorized (recruiter or allocated freelancer)
    const isRecruiter = job.postedBy.toString() === userId;
    const isFreelancer = job.allocatedTo?.toString() === userId;

    if (!isRecruiter && !isFreelancer) {
      return next(new ErrorResponse('Not authorized to view messages for this job', 403));
    }

    // Check if job is allocated
    if (!job.allocatedTo) {
      return next(new ErrorResponse('Messaging is only available after job allocation', 400));
    }

    const otherUserId = isRecruiter ? job.allocatedTo.toString() : job.postedBy.toString();

    const messages = await Message.getConversation(jobId, userId, otherUserId, parseInt(limit), parseInt(skip));

    // Mark messages as read
    await Message.markConversationAsRead(jobId, userId, otherUserId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.reverse() // Show oldest first
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (REST API fallback)
// @route   POST /api/v1/messages/send
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { jobId, receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    // Verify job exists and user is part of it
    const job = await Job.findById(jobId);
    
    if (!job || !job.allocatedTo) {
      return next(new ErrorResponse('Job not found or not allocated', 404));
    }

    // Verify the participants
    const isRecruiter = job.postedBy.toString() === senderId;
    const isFreelancer = job.allocatedTo.toString() === senderId;
    
    if (!isRecruiter && !isFreelancer) {
      return next(new ErrorResponse('Not authorized to message for this job', 403));
    }

    // Verify receiver is the other party
    const otherUserId = isRecruiter ? job.allocatedTo.toString() : job.postedBy.toString();
    if (receiverId !== otherUserId) {
      return next(new ErrorResponse('Can only message the other party in this job', 400));
    }

    // Create message
    const message = await Message.create({
      job: jobId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    await message.populate('sender', 'name email');

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', message);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/v1/messages/mark-read/:jobId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Verify job exists and user is part of it
    const job = await Job.findById(jobId);
    
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if user is authorized
    const isRecruiter = job.postedBy.toString() === userId;
    const isFreelancer = job.allocatedTo?.toString() === userId;

    if (!isRecruiter && !isFreelancer) {
      return next(new ErrorResponse('Not authorized for this job', 403));
    }

    const otherUserId = isRecruiter ? job.allocatedTo.toString() : job.postedBy.toString();

    const result = await Message.markConversationAsRead(jobId, userId, otherUserId);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Message.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations: exports.getConversations,
  getJobMessages: exports.getJobMessages,
  sendMessage: exports.sendMessage,
  markAsRead: exports.markAsRead,
  getUnreadCount: exports.getUnreadCount
};
