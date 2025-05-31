import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, use the Netlify dev server
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/.netlify/functions';
  }
  
  // In production, use relative path to Netlify functions
  return '/.netlify/functions';
};

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
  timeout: 10000, // 10 second timeout
});

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: any) => void> = [];

// Function to add requests to the queue while refreshing
const subscribeTokenRefresh = (cb: (token: any) => void) => {
  refreshSubscribers.push(cb);
};

// Function to process all queued requests after refresh
const onRefreshed = (token: any) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Add request interceptor for debugging and potential modifications
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if request was cancelled or has no config
    if (!originalRequest || error.code === 'ECONNABORTED') {
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if the failing request was already a refresh or auth request
      if (
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        // Clear auth state and redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.get(`${getBaseURL()}/auth/refresh`, {
          withCredentials: true,
          timeout: 5000,
        });

        if (refreshResponse.data.success) {
          // Refresh successful, retry all queued requests
          onRefreshed(true);
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect
        onRefreshed(false);
        isRefreshing = false;
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);