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

// @desc    Get freelancer profile by ID
// @route   GET /api/v1/freelancer/profile/:id
// @access  Private
exports.getFreelancerProfileById = async (req, res, next) => {
  try {
    console.log('=== BACKEND: GETTING FREELANCER PROFILE BY ID ===');
    console.log('Freelancer ID from params:', req.params.id);
    
    const profile = await FreelancerProfile.findOne({ user: req.params.id })
      .populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    console.log('Found freelancer profile:', profile);
    console.log('UPI ID in profile:', profile.personalInfo?.upiId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting freelancer profile by ID:', error);
    next(error);
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/v1/freelancer/profile
// @access  Private
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    console.log('=== BACKEND: UPDATING FREELANCER PROFILE ===');
    console.log('Request body:', req.body);
    console.log('UPI ID in request body:', req.body?.personalInfo?.upiId);
    console.log('User ID:', req.user.id);
    
    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = new FreelancerProfile({ user: req.user.id });
    }

    console.log('Existing profile:', profile);
    console.log('Existing profile UPI ID:', profile.personalInfo?.upiId);

    // Update profile fields
    const {
      personalInfo,
      professionalInfo,
      skills,
      projects,
      stats
    } = req.body;

    console.log('Personal info from request:', personalInfo);
    console.log('UPI ID from personal info:', personalInfo?.upiId);

    if (personalInfo) {
      console.log('Updating personalInfo field...');
      console.log('Before update - profile.personalInfo:', profile.personalInfo);
      profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
      console.log('After update - profile.personalInfo:', profile.personalInfo);
      console.log('UPI ID after update:', profile.personalInfo.upiId);
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

    console.log('Profile before save:', profile);
    console.log('UPI ID before save:', profile.personalInfo?.upiId);

    await profile.save();

    console.log('Profile after save:', profile);
    console.log('UPI ID after save:', profile.personalInfo?.upiId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Backend error updating profile:', error);
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
