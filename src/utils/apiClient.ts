import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import { sessionManager } from './sessionManager';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;
let onAuthStateCleared: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Register callback for auth state clearing
export const setAuthStateCallback = (callback: () => void) => {
  onAuthStateCleared = callback;
};

// Function to clear auth state (used in 401 error handling)
const clearAuthState = () => {
  setAuthToken(null);
  if (onAuthStateCleared) {
    onAuthStateCleared();
  }
};

// Request interceptor to add session headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get session headers for cart persistence
      const sessionHeaders = await sessionManager.getSessionHeaders();
      
      // Add session headers to request
      Object.keys(sessionHeaders).forEach(key => {
        config.headers[key] = sessionHeaders[key];
      });
      
      // Add auth token if available
      const token = await getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Failed to add session headers:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const newToken = await refreshAuthToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login or handle auth failure
        console.error('Token refresh failed:', refreshError);
        await handleAuthFailure();
      }
    }
    
    // Handle session-related errors
    if (error.response?.status === 400 && error.response?.data?.error === 'INVALID_SESSION') {
      try {
        // Reset session and retry
        await sessionManager.resetSession();
        const sessionHeaders = await sessionManager.getSessionHeaders();
        originalRequest.headers = {
          ...originalRequest.headers,
          ...sessionHeaders,
        };
        return apiClient(originalRequest);
      } catch (sessionError) {
        console.error('Session reset failed:', sessionError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    // Get token from auth store
    const { useAuthStore } = require('../store/authStore');
    const token = useAuthStore.getState().token;
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Helper function to refresh auth token
async function refreshAuthToken(): Promise<string | null> {
  try {
    // Get auth service and try to refresh
    const { authService } = require('../services/authService');
    const response = await authService.refreshToken();
    
    // Update auth store with new token
    const { useAuthStore } = require('../store/authStore');
    useAuthStore.getState().setToken(response.token);
    
    return response.token;
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
    return null;
  }
}

// Helper function to handle auth failure
async function handleAuthFailure(): Promise<void> {
  try {
    // Clear auth state and logout
    const { useAuthStore } = require('../store/authStore');
    await useAuthStore.getState().logout();
    
    console.log('Authentication failed, user logged out');
  } catch (error) {
    console.error('Failed to handle auth failure:', error);
  }
}

// API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// Generic API methods
export const api = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`API GET error for ${url}:`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`API POST error for ${url}:`, error);
      throw error;
    }
  },

  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`API PUT error for ${url}:`, error);
      throw error;
    }
  },

  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`API PATCH error for ${url}:`, error);
      throw error;
    }
  },

  delete: async <T>(url: string, config?: any): Promise<T> => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error;
    }
  },
};

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default apiClient; 