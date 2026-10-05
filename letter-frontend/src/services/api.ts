import axios from 'axios';

/**
 * Normalizes the API base URL to ensure:
 * 1. Protocol prefix (https://) is added if omitted (e.g. "my-app.up.railway.app" -> "https://my-app.up.railway.app")
 * 2. Trailing slashes are stripped
 * 3. Path "/api" is appended if missing
 */
export const normalizeApiBaseUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) {
    return 'http://localhost:5000/api';
  }
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');

  // If provided as a domain without scheme (e.g. "domain.up.railway.app")
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  // Ensure trailing /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

export const baseURL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
);

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
