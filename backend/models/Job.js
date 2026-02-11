const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    salary: {
      type: String,
      default: 'Not specified',
    },
    budget: {
      type: Number,
      required: false,
      min: [0, 'Budget must be a positive number']
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'bidding', 'closed', 'cancelled'],
      default: 'open'
    },
    biddingDeadline: {
      type: Date,
      required: [true, 'Please provide a bidding deadline']
    },
    biddingDuration: {
      type: Number, // Duration in hours
      default: 24,
      min: 1,
      max: 720 // Max 30 days
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    allocatedAt: {
      type: Date
    },
    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid'
    },
    progressLevel: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    projectStatus: {
      type: String,
      enum: ['Work Started', 'Initial Development', 'Midway Completed', 'Almost Done', 'Completed'],
      default: 'Work Started'
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ status: 1, biddingDeadline: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ allocatedTo: 1 });

// Virtual to check if bidding is still open
jobSchema.virtual('isBiddingOpen').get(function() {
  const now = new Date();
  return (this.status === 'open' || this.status === 'bidding') && now < this.biddingDeadline;
});

// Virtual to check if job is allocated
jobSchema.virtual('isAllocated').get(function() {
  return this.allocatedTo && this.status === 'closed';
});

module.exports = mongoose.model('Job', jobSchema);
