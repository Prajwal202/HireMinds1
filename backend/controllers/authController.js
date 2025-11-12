const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  console.log('Register request received:', { body: req.body });
  
  const { name, email, password, role = 'freelancer' } = req.body;

  // Validate input
  if (!name || !email || !password) {
    console.error('Validation failed: Missing required fields');
    return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Registration failed: Email already in use');
      return next(new ErrorResponse('Email already in use', 400));
    }

    console.log('Creating new user...');
    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    });

    console.log('User created successfully, sending token response...');
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    
    // Handle duplicate key error (email)
    if (err.code === 11000) {
      return next(new ErrorResponse('Email already in use', 400));
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return next(new ErrorResponse(messages, 400));
    }
    
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};
