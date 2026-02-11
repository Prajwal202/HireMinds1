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

const http = require('http');

const socketIo = require('socket.io');







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

  max: 1000 // Increased from 100 to 1000 for testing

});

app.use(limiter);



// Prevent http param pollution

app.use(hpp());



// Enable CORS

const allowedOrigins = [

  'http://localhost:3000',

  'http://localhost:3001',

  'http://localhost:3005',

  process.env.FRONTEND_URL

].filter(Boolean);



app.use(cors({

  origin: function (origin, callback) {

    // Allow requests with no origin (like mobile apps or curl requests)

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {

      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';

      return callback(new Error(msg), false);

    }

    return callback(null, true);

  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],

  optionsSuccessStatus: 200 // Some legacy browsers choke on 204

}));



// Set static folder

app.use(express.static(path.join(__dirname, 'public')));



// Routes

app.use('/api/v1/auth', require('./routes/authRoutes'));

app.use('/api/v1/jobs', require('./routes/jobRoutes'));

app.use('/api/v1/recommendations', require('./routes/recommendationRoutes'));

app.use('/api/v1/admin', require('./routes/adminRoutes'));

app.use('/api/v1/freelancer', require('./routes/freelancerRoutes'));

app.use('/api/v1/bids', require('./routes/bidRoutes'));

app.use('/api/v1/projects', require('./routes/projectRoutes'));

app.use('/api/v1/messages', require('./routes/messageRoutes'));

app.use('/api/v1/payments', require('./routes/paymentRoutes'));



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



const server = http.createServer(app);



// Set up Socket.io

const io = socketIo(server, {

  cors: {

    origin: allowedOrigins,

    methods: ["GET", "POST"],

    credentials: true

  }

});



// Socket.io connection handling

io.on('connection', (socket) => {

  console.log('New client connected:', socket.id);

  let userId = null;



  // Join user to their personal room for direct messages

  socket.on('join', (id) => {

    userId = id;

    socket.join(userId);

    console.log(`User ${userId} joined their room`);

    

    // Broadcast user online status

    socket.broadcast.emit('userOnline', userId);

  });



  // Handle job allocation - enable messaging between recruiter and freelancer

  socket.on('jobAllocated', ({ jobId, recruiterId, freelancerId }) => {

    const room = `job_${jobId}`;

    socket.join(room);

    

    // Notify both parties that messaging is now enabled

    io.to(recruiterId).emit('messagingEnabled', { jobId, freelancerId });

    io.to(freelancerId).emit('messagingEnabled', { jobId, recruiterId });

  });



  // Handle typing indicators

  socket.on('typing', ({ jobId, receiverId }) => {

    io.to(receiverId).emit('userTyping', { jobId, senderId: userId });

  });



  socket.on('stopTyping', ({ jobId, receiverId }) => {

    io.to(receiverId).emit('userStoppedTyping', { jobId, senderId: userId });

  });



  // Handle disconnection

  socket.on('disconnect', () => {

    console.log('Client disconnected:', socket.id);

    if (userId) {

      // Broadcast user offline status

      socket.broadcast.emit('userOffline', userId);

    }

  });

});



// Make io accessible to our routes

app.set('io', io);



server.listen(PORT, () => {

  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

});

