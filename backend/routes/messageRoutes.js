const express = require('express');
const router = express.Router();
const {
  getConversations,
  getJobMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Get all conversations for the user
router.get('/conversations', getConversations);

// Get messages for a specific job
router.get('/job/:jobId', getJobMessages);

// Send a message (REST API fallback)
router.post('/send', sendMessage);

// Mark messages as read
router.put('/mark-read/:jobId', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

module.exports = router;
