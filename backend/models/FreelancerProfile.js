const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: false, // Made optional to avoid validation errors
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      default: ''
    },
    title: {
      type: String,
      default: 'Freelancer',
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    upiId: {
      type: String,
      default: '',
      trim: true
    }
  },
  professionalInfo: {
    experience: {
      type: String,
      default: ''
    },
    hourlyRate: {
      type: String,
      default: ''
    },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'unavailable'],
      default: 'full-time'
    },
    languages: [{
      type: String
    }],
    education: {
      type: String,
      default: ''
    },
    portfolio: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    }
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: [{
      type: String
    }],
    link: {
      type: String,
      default: ''
    },
    completedAt: {
      type: String,
      default: ''
    }
  }],
  stats: {
    completedProjects: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    totalClients: {
      type: Number,
      default: 0
    }
  },
  resume: {
    name: String,
    size: Number,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  profileImage: {
    name: String,
    size: Number,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
