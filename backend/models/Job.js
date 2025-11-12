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
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
