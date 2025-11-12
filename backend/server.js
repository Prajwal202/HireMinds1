const express = require('express');
require('./config/env');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const connectDB = require('./config/db').default;
const errorHandler = require('./middleware/error');

// Log environment variables
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/jobs', require('./routes/jobRoutes'));
app.use('/api/v1/recommendations', require('./routes/recommendationRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend connected to MongoDB successfully',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to HireMinds API',
    version: '1.0.0',
    documentation: '/api-docs' // If you add API documentation later
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
