const Job = require('../models/Job');
const ErrorResponse = require('../utils/errorResponse');

// Progress level mapping
const progressLevels = {
  0: { status: 'Not Started', percentage: 0 },
  1: { status: 'Work Started', percentage: 20 },
  2: { status: 'Initial Development', percentage: 40 },
  3: { status: 'Midway Completed', percentage: 60 },
  4: { status: 'Almost Done', percentage: 80 },
  5: { status: 'Completed', percentage: 100 }
};

// @desc    Get freelancer's active projects
// @route   GET /api/v1/projects/freelancer/active
// @access  Private (Freelancer only)
exports.getFreelancerActiveProjects = async (req, res, next) => {
  try {
    const activeProjects = await Job.find({
      allocatedTo: req.user.id,
      status: 'closed',
      progressLevel: { $lt: 5 }
    })
    .populate('postedBy', 'name email')
    .populate('acceptedBid')
    .sort({ allocatedAt: -1 });

    res.status(200).json({
      success: true,
      count: activeProjects.length,
      data: activeProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get freelancer's recent projects
// @route   GET /api/v1/projects/freelancer/recent
// @access  Private (Freelancer only)
exports.getFreelancerRecentProjects = async (req, res, next) => {
  try {
    const recentProjects = await Job.find({
      allocatedTo: req.user.id,
      status: 'closed'
    })
    .populate('postedBy', 'name email')
    .populate('acceptedBid')
    .sort({ allocatedAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      count: recentProjects.length,
      data: recentProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project details
// @route   GET /api/v1/projects/:id
// @access  Private
exports.getProjectDetails = async (req, res, next) => {
  try {
    const project = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('allocatedTo', 'name email')
      .populate('acceptedBid');

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Debug logging
    console.log('Project access check:');
    console.log('Project ID:', project._id);
    console.log('Posted by:', project.postedBy._id);
    console.log('Allocated to:', project.allocatedTo?._id);
    console.log('Req user ID:', req.user.id);
    console.log('Req user role:', req.user.role);

    // Check if user is authorized to view this project
    if (
      project.postedBy._id.toString() !== req.user.id &&
      project.allocatedTo?._id?.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to view this project', 403));
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error getting project details:', error);
    next(error);
  }
};

// @desc    Update project progress
// @route   PUT /api/v1/projects/:id/progress
// @access  Private (Freelancer only)
exports.updateProjectProgress = async (req, res, next) => {
  try {
    const { progressLevel } = req.body;

    // Validate progress level
    if (!progressLevels[progressLevel]) {
      return next(new ErrorResponse('Invalid progress level', 400));
    }

    const project = await Job.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Debug logging
    console.log('Project allocation check:');
    console.log('Project allocatedTo:', project.allocatedTo);
    console.log('Req user ID:', req.user.id);
    console.log('User role:', req.user.role);

    // Check if project is allocated to this freelancer
    if (!project.allocatedTo) {
      return next(new ErrorResponse('Project is not allocated to any freelancer', 403));
    }

    if (project.allocatedTo.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this project. This project is allocated to another freelancer.', 403));
    }

    // Check if project is completed
    if (project.progressLevel >= 5) {
      return next(new ErrorResponse('Project is already completed', 400));
    }

    // Prevent going backwards in progress
    if (progressLevel <= project.progressLevel) {
      return next(new ErrorResponse('Cannot move backwards in progress', 400));
    }

    // Update project progress
    project.progressLevel = progressLevel;
    project.completionPercentage = progressLevels[progressLevel].percentage;
    project.projectStatus = progressLevels[progressLevel].status;

    await project.save();

    console.log('Project updated successfully:');
    console.log('New progress level:', project.progressLevel);
    console.log('New completion percentage:', project.completionPercentage);
    console.log('New project status:', project.projectStatus);

    const responseData = {
      success: true,
      progressLevel: project.progressLevel,
      completionPercentage: project.completionPercentage,
      projectStatus: project.projectStatus,
      message: progressLevel === 5 ? 
        'Project completed successfully! 🎉' : 
        'Project progress updated successfully'
    };

    console.log('Sending response:', responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error updating project progress:', error);
    next(error);
  }
};

// @desc    Get recruiter's projects with progress
// @route   GET /api/v1/projects/recruiter/active
// @access  Private (Recruiter only)
exports.getRecruiterActiveProjects = async (req, res, next) => {
  try {
    const activeProjects = await Job.find({
      postedBy: req.user.id,
      status: 'closed',
      allocatedTo: { $exists: true },
      progressLevel: { $lt: 5 }
    })
    .populate('allocatedTo', 'name email')
    .populate('acceptedBid')
    .sort({ allocatedAt: -1 });

    res.status(200).json({
      success: true,
      count: activeProjects.length,
      data: activeProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available progress levels
// @route   GET /api/v1/projects/progress-levels
// @access  Private
exports.getProgressLevels = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: progressLevels
    });
  } catch (error) {
    next(error);
  }
};
