import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Get auth token from localStorage
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const messageAPI = {
  // Get all conversations for the user
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/conversations`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get messages for a specific job
  getJobMessages: async (jobId, limit = 50, skip = 0) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/job/${jobId}?limit=${limit}&skip=${skip}`, 
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send a message (REST API fallback)
  sendMessage: async (jobId, receiverId, content, messageType = 'text') => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        { jobId, receiverId, content, messageType },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark messages as read
  markAsRead: async (jobId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/messages/mark-read/${jobId}`,
        {},
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default messageAPI;
