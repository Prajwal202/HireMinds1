import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
  timeout: 10000 // 10 second timeout
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Making request to:', config.url);
    console.log('Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to headers');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Handle unauthorized access - remove token but don't redirect
        // Let the components handle the redirect logic
        localStorage.removeItem('token');
        console.log('401 Unauthorized - token removed, no redirect from interceptor');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      error.message = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await API.post('/v1/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/v1/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await API.get('/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await API.get('/v1/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

// Job API endpoints
export const jobAPI = {
  // Get all jobs
  getAllJobs: async () => {
    try {
      const response = await API.get('/v1/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Get single job by ID
  getJobById: async (id) => {
    try {
      const response = await API.get(`/v1/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  // Create new job
  createJob: async (jobData) => {
    try {
      const response = await API.post('/v1/jobs', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  // Update job
  updateJob: async (id, jobData) => {
    try {
      const response = await API.put(`/v1/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete job
  deleteJob: async (id) => {
    try {
      const response = await API.delete(`/v1/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Get recruiter's own jobs
  getMyJobs: async () => {
    try {
      const response = await API.get('/v1/jobs/my-jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      throw error;
    }
  }
};

// Recommendation API endpoints
export const recommendationAPI = {
  // Get job recommendations
  getRecommendations: async () => {
    try {
      const response = await API.get('/v1/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Add search query to user history
  addSearchQuery: async (query) => {
    try {
      const response = await API.post('/v1/recommendations/search', { query });
      return response.data;
    } catch (error) {
      console.error('Error adding search query:', error);
      throw error;
    }
  }
};

// Admin API endpoints
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await API.get('/v1/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get single user
  getUser: async (id) => {
    try {
      const response = await API.get(`/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await API.put(`/v1/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await API.delete(`/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get all jobs (admin view)
  getAllJobs: async () => {
    try {
      const response = await API.get('/v1/admin/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Update job
  updateJob: async (id, jobData) => {
    try {
      const response = await API.put(`/v1/admin/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete job
  deleteJob: async (id) => {
    try {
      const response = await API.delete(`/v1/admin/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await API.get('/v1/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

// Freelancer Profile API endpoints
export const freelancerAPI = {
  // Get freelancer profile
  getProfile: async () => {
    try {
      const response = await API.get('/v1/freelancer/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer profile:', error);
      throw error;
    }
  },

  // Update freelancer profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/v1/freelancer/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating freelancer profile:', error);
      throw error;
    }
  },

  // Upload resume
  uploadResume: async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await API.post('/v1/freelancer/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await API.post('/v1/freelancer/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Add skill
  addSkill: async (skillData) => {
    try {
      const response = await API.post('/v1/freelancer/skills', skillData);
      return response.data;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  },

  // Update skill
  updateSkill: async (skillId, skillData) => {
    try {
      const response = await API.put(`/v1/freelancer/skills/${skillId}`, skillData);
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  // Remove skill
  removeSkill: async (skillId) => {
    try {
      const response = await API.delete(`/v1/freelancer/skills/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing skill:', error);
      throw error;
    }
  },

  // Add project
  addProject: async (projectData) => {
    try {
      const response = await API.post('/v1/freelancer/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await API.put(`/v1/freelancer/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Remove project
  removeProject: async (projectId) => {
    try {
      const response = await API.delete(`/v1/freelancer/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing project:', error);
      throw error;
    }
  },

  // Get freelancer stats
  getStats: async () => {
    try {
      const response = await API.get('/v1/freelancer/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer stats:', error);
      throw error;
    }
  }
};

// Bid API
export const bidAPI = {
  // Get all bids for a recruiter
  getRecruiterBids: async () => {
    try {
      const response = await API.get('/v1/bids/recruiter');
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter bids:', error);
      throw error;
    }
  },

  // Get all bids for a specific job
  getJobBids: async (jobId) => {
    try {
      const response = await API.get(`/v1/bids/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job bids:', error);
      throw error;
    }
  },

  // Create a new bid
  createBid: async (bidData) => {
    try {
      const response = await API.post('/v1/bids', bidData);
      return response.data;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  },

  // Accept a bid
  acceptBid: async (bidId) => {
    try {
      const response = await API.put(`/v1/bids/${bidId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  },

  // Reject a bid
  rejectBid: async (bidId) => {
    try {
      const response = await API.put(`/v1/bids/${bidId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting bid:', error);
      throw error;
    }
  }
};

export default API;
