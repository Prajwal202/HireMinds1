const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get freelancer profile
// @route   GET /api/v1/freelancer/profile
// @access  Private
exports.getFreelancerProfile = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a default profile if none exists
      const user = await User.findById(req.user.id);
      profile = await FreelancerProfile.create({
        user: req.user.id,
        personalInfo: {
          name: user.name,
          email: user.email
        }
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/v1/freelancer/profile
// @access  Private
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = new FreelancerProfile({ user: req.user.id });
    }

    // Update profile fields
    const {
      personalInfo,
      professionalInfo,
      skills,
      projects,
      stats
    } = req.body;

    if (personalInfo) {
      profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    }

    if (professionalInfo) {
      profile.professionalInfo = { ...profile.professionalInfo, ...professionalInfo };
    }

    if (skills) {
      profile.skills = skills;
    }

    if (projects) {
      profile.projects = projects;
    }

    if (stats) {
      profile.stats = { ...profile.stats, ...stats };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/v1/freelancer/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new FreelancerProfile({ user: req.user.id });
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Store file info
    profile.resume = {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile.resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image
// @route   POST /api/v1/freelancer/profile-image
// @access  Private
exports.uploadProfileImage = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new FreelancerProfile({ user: req.user.id });
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Store file info
    profile.profileImage = {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: `/uploads/profile-images/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile.profileImage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get freelancer stats
// @route   GET /api/v1/freelancer/stats
// @access  Private
exports.getFreelancerStats = async (req, res, next) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          completedProjects: 0,
          totalEarnings: 0,
          successRate: 0,
          totalClients: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: profile.stats
    });
  } catch (error) {
    next(error);
  }
};
