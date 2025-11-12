const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecommendations,
  addSearchQuery
} = require('../controllers/recommendationController');

// Protected routes (require authentication)
router.use(protect);

router.get('/', getRecommendations);
router.post('/search', addSearchQuery);

module.exports = router;
