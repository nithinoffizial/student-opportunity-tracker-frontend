import axios from 'axios';

// In development, route requests through the local Vite proxy (/api) to avoid browser CORS restrictions.
// In production, use the live backend base URL: https://student-opportunity-tracker-1-0.onrender.com/api
const baseURL = import.meta.env.DEV
  ? '/api'
  : `${(import.meta.env.VITE_API_BASE_URL || 'https://student-opportunity-tracker-1-0.onrender.com').replace(/\/+$/, '')}/api`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for Render free tier cold starts
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'Request timed out waiting for server. The backend may be waking up — please try again in a few seconds.';
    } else if (error.code === 'ERR_NETWORK') {
      error.userMessage = 'Unable to connect to the server. It may be waking up — please try again in a moment.';
    } else if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        error.userMessage = (typeof data === 'string' ? data : data?.message) || 'Invalid request. Please check your input.';
      } else if (status === 404) {
        error.userMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        error.userMessage = 'Server error. Please try again later.';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
