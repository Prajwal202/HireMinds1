const dotenv = require('dotenv');

dotenv.config();

// Fallback defaults, while allowing .env / process env overrides.
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI:
    process.env.MONGO_URI ||
    'mongodb+srv://prajwal:prajwal123@cluster0.tdu0l1a.mongodb.net/hireminds?retryWrites=true&w=majority',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    '4f8d5e3a9c2b7f1e6d0c9a8b7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAYX_ACCOUNT_NUMBER: process.env.RAZORPAYX_ACCOUNT_NUMBER || ''
};

Object.keys(env).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = String(env[key]);
  }
});

module.exports = env;
