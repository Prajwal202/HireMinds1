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

      console.log('=== API: GETTING FREELANCER PROFILE ===');
      
      const response = await API.get('/v1/freelancer/profile');
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      console.log('UPI ID in response:', response.data?.data?.personalInfo?.upiId || response.data?.personalInfo?.upiId);
      
      return response.data;

    } catch (error) {

      console.error('Error fetching freelancer profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      throw error;

    }

  },

  // Get freelancer profile by ID
  getProfileById: async (freelancerId) => {

    try {

      console.log('=== API: GETTING FREELANCER PROFILE BY ID ===');
      console.log('Freelancer ID:', freelancerId);
      
      const response = await API.get(`/v1/freelancer/profile/${freelancerId}`);
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      console.log('UPI ID in response:', response.data?.data?.personalInfo?.upiId || response.data?.personalInfo?.upiId);
      
      return response.data;

    } catch (error) {

      console.error('Error fetching freelancer profile by ID:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      throw error;

    }

  },



  // Update freelancer profile

  updateProfile: async (profileData) => {

    try {

      console.log('=== API: UPDATING FREELANCER PROFILE ===');
      console.log('Profile data being sent:', profileData);
      console.log('UPI ID in profile data:', profileData.personalInfo?.upiId);
      
      const response = await API.put('/v1/freelancer/profile', profileData);
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      console.log('API response headers:', response.headers);
      
      return response.data;

    } catch (error) {

      console.error('Error updating freelancer profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

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



  // Get all bids for a freelancer

  getFreelancerBids: async () => {

    try {

      const response = await API.get('/v1/bids/freelancer');

      return response.data;

    } catch (error) {

      console.error('Error fetching freelancer bids:', error);

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

  },



  // Get allocated jobs for freelancer

  getAllocatedJobs: async () => {

    try {

      const response = await API.get('/v1/bids/allocated');

      return response.data;

    } catch (error) {

      console.error('Error fetching allocated jobs:', error);

      throw error;

    }

  }

};



// Project API

export const projectAPI = {

  // Get freelancer's active projects

  getFreelancerActiveProjects: async () => {

    try {

      const response = await API.get('/v1/projects/freelancer/active');

      return response.data;

    } catch (error) {

      console.error('Error fetching freelancer active projects:', error);

      throw error;

    }

  },



  // Get freelancer's recent projects

  getFreelancerRecentProjects: async () => {

    try {

      const response = await API.get('/v1/projects/freelancer/recent');

      return response.data;

    } catch (error) {

      console.error('Error fetching freelancer recent projects:', error);

      throw error;

    }

  },



  // Get project details

  getProjectDetails: async (projectId) => {

    try {

      const response = await API.get(`/v1/projects/${projectId}`);

      return response.data;

    } catch (error) {

      console.error('Error fetching project details:', error);

      throw error;

    }

  },



  // Update project progress

  updateProjectProgress: async (projectId, progressLevel) => {

    try {

      const response = await API.put(`/v1/projects/${projectId}/progress`, { progressLevel });

      return response.data;

    } catch (error) {

      console.error('Error updating project progress:', error);

      throw error;

    }

  },



  // Get recruiter's active projects

  getRecruiterActiveProjects: async () => {

    try {

      const response = await API.get('/v1/projects/recruiter/active');

      return response.data;

    } catch (error) {

      console.error('Error fetching recruiter active projects:', error);

      throw error;

    }

  },



  // Get progress levels

  getProgressLevels: async () => {

    try {

      const response = await API.get('/v1/projects/progress-levels');

      return response.data;

    } catch (error) {

      console.error('Error fetching progress levels:', error);

      throw error;

    }

  }

};



// Payment API
export const paymentAPI = {
  // Create payment order
  createPaymentOrder: async (projectId, milestoneLevel) => {
    try {
      const response = await API.post('/v1/payments/create-order', { projectId, milestoneLevel });
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  // Initialize milestones for a project
  initializeMilestones: async (projectId) => {
    try {
      const response = await API.post(`/v1/payments/initialize-milestones/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error initializing milestones:', error);
      throw error;
    }
  },

  // Get project payments
  getProjectPayments: async (projectId) => {
    try {
      const response = await API.get(`/v1/payments/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project payments:', error);
      throw error;
    }
  },

  // Get payable amount for current milestone
  getPayableAmount: async (projectId) => {
    try {
      const response = await API.get(`/v1/payments/project/${projectId}/payable-amount`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payable amount:', error);
      throw error;
    }
  }
};


export default API;

// Test export to check if exports are working
export const testExport = 'test';
