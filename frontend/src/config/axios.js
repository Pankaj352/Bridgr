import axios from 'axios';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: 'https://bridgr.onrender.com',
  timeout: 15000, // 15 seconds timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for common configurations
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      toast.error('Request timed out. Please check your connection and try again.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;