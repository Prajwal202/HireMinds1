// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/.env' });

// Verify required environment variables are set
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Export configuration
module.exports = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30,
  
  // MongoDB configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100
};
