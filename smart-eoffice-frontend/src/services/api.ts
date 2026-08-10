import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Centralized Axios instance for Smart E-Office Document Management System.
 * Configured with environment-based base URL and prepared for interceptors in future phases.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/* Request Interceptor Placeholder for Future JWT Authorization */
api.interceptors.request.use(
  (config) => {
    // Phase 2 will attach authorization headers here:
    // const token = localStorage.getItem('token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Response Interceptor Placeholder for Global Error Handling */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Phase 2+ global error interceptor placeholder
    return Promise.reject(error);
  }
);

export default api;
