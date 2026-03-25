const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    gateway: {
      type: String,
      default: 'razorpay'
    },
    gatewayOrderId: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    gatewayPaymentId: {
      type: String,
      default: null
    },
    gatewaySignature: {
      type: String,
      default: null
    },
    transactionStatus: {
      type: String,
      enum: ['CREATED', 'PAID', 'FAILED', 'REJECTED'],
      default: 'CREATED'
    },
    paidAt: {
      type: Date,
      default: null
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

paymentSchema.index({ project: 1, milestone: 1 }, { unique: true });
paymentSchema.index({ recruiter: 1, createdAt: -1 });
paymentSchema.index({ freelancer: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

