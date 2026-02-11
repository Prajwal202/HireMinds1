const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  status: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'RELEASED'],
    default: 'PENDING'
  },
  paymentReleasedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate amount based on project budget or accepted bid
milestoneSchema.pre('save', async function(next) {
  if (this.isNew && !this.amount) {
    try {
      const Job = mongoose.model('Job');
      const project = await Job.findById(this.project);
      
      if (project) {
        // Use project budget if available, otherwise use accepted bid amount
        const totalAmount = project.budget || project.acceptedBid?.bidAmount || 0;
        this.amount = (totalAmount * this.percentage) / 100;
      }
    } catch (error) {
      console.error('Error calculating milestone amount:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Milestone', milestoneSchema);
