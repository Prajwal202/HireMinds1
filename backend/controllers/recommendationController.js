const Job = require('../models/Job');
const User = require('../models/User');
const natural = require('natural');
const TfIdf = natural.TfIdf;
const { protect } = require('../middleware/auth');

// Initialize TF-IDF
const tfidf = new TfIdf();

// @desc    Get job recommendations for a user
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('appliedJobs savedJobs');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get all jobs except those already applied to or saved by the user
    const excludedJobIds = [
      ...user.appliedJobs.map(job => job._id),
      ...user.savedJobs.map(job => job._id)
    ];

    const jobs = await Job.find({
      _id: { $nin: excludedJobIds }
    });

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Get user's search history and job interactions
    const userInterests = [
      ...user.searchHistory.map(entry => entry.query),
      ...user.appliedJobs.map(job => job.title + ' ' + job.description),
      ...user.savedJobs.map(job => job.title + ' ' + job.description)
    ].join(' ');

    // If no user interests, return random jobs
    if (!userInterests.trim()) {
      const randomJobs = jobs.sort(() => 0.5 - Math.random()).slice(0, 5);
      return res.status(200).json({
        success: true,
        count: randomJobs.length,
        data: randomJobs
      });
    }

    // Create TF-IDF model
    const tfidf = new TfIdf();
    
    // Add user interests as a document
    tfidf.addDocument(userInterests);
    
    // Add job descriptions as documents
    const jobDocs = [];
    jobs.forEach(job => {
      const jobText = `${job.title} ${job.description} ${job.skills.join(' ')}`;
      tfidf.addDocument(jobText);
      jobDocs.push({
        job,
        text: jobText,
        score: 0
      });
    });

    // Calculate similarity scores
    const userTerms = {};
    tfidf.listTerms(0 /* user interests doc */).forEach(item => {
      userTerms[item.term] = item.tfidf;
    });

    jobDocs.forEach((jobDoc, idx) => {
      let score = 0;
      tfidf.listTerms(idx + 1).forEach(item => {
        if (userTerms[item.term]) {
          score += userTerms[item.term] * item.tfidf;
        }
      });
      jobDoc.score = score;
    });

    // Sort by score and get top 5
    const recommendedJobs = jobDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.job);

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      data: recommendedJobs
    });

  } catch (err) {
    console.error('Error in getRecommendations:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Add a search query to user's search history
// @route   POST /api/recommendations/search
// @access  Private
exports.addSearchQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $push: {
        searchHistory: { query }
      }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error in addSearchQuery:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};
