import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Centralized Axios instance for Smart E-Office Document Management System.
 * Configured with token authorization interceptor and automatic 401 error handling.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/* Request Interceptor: Attach JWT Token */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sita_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Response Interceptor: Handle Authentication Failures */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized handling
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sita_auth_token');
      localStorage.removeItem('sita_auth_user');

      // Only redirect if not already on the login page to avoid infinite redirect loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
