import axios from 'axios';

// const api = axios.create({
//  baseURL: '/api',
//  headers: {
//    'Content-Type': 'application/json',
//  },
//  withCredentials: true
// });

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5005/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});


// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    
    // Always include user ID if available (for assessment linking)
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    // Include email if available
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      config.headers['x-email'] = userEmail;
    }
    
    // Include current assessment ID if available
    const assessmentId = localStorage.getItem('assessmentId');
    if (assessmentId) {
      config.headers['x-assessment-id'] = assessmentId;
    }
    
    // Log headers for debugging
    console.log('Request headers for:', config.url, config.headers);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    // Log failed responses for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default api;
