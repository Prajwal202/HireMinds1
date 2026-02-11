const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ job: 1, timestamp: -1 });
messageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Virtual for checking if message is recently sent
messageSchema.virtual('isRecent').get(function() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return this.timestamp > fiveMinutesAgo;
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get conversation between two users for a specific job
messageSchema.statics.getConversation = async function(jobId, user1Id, user2Id, limit = 50, skip = 0) {
  return this.find({
    job: jobId,
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ],
    isDeleted: false
  })
  .populate('sender', 'name email')
  .populate('receiver', 'name email')
  .sort({ timestamp: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to mark all messages in a conversation as read
messageSchema.statics.markConversationAsRead = async function(jobId, userId, otherUserId) {
  return this.updateMany(
    {
      job: jobId,
      sender: otherUserId,
      receiver: userId,
      isRead: false,
      isDeleted: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

module.exports = mongoose.model('Message', messageSchema);
