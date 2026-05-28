import axios from 'axios';
import { API_URL } from './constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rideflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An error occurred';
    console.error('API Error:', message);

    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('rideflow_token');
      localStorage.removeItem('rideflow_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
