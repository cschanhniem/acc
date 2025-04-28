import axios, { AxiosError, AxiosResponse, AxiosInstance } from "axios";
import { AuthResponse } from "@peaceflow/shared";
import { useAuthStore } from "../stores/auth";

// Create a single axios instance for all API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Store any requests that come in while refreshing
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to process any queued requests after a successful refresh
const processQueue = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is 401 and we're not already refreshing
    if (error.response?.status === 401 && !isRefreshing && originalRequest) {
      isRefreshing = true;

      try {
        // Create a new axios instance specifically for token refresh to avoid infinite loop
        const refreshApi = axios.create({
          baseURL: import.meta.env.VITE_API_URL,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        // Try to refresh the token
        const { data } = await refreshApi.post<AuthResponse>(
          "/api/v1/auth/refresh",
          {
            refreshToken: localStorage.getItem("refreshToken"),
          }
        );

        // Update auth store with new tokens and user data
        const { setUser, setAccessToken } = useAuthStore.getState();
        setUser(data.user);
        setAccessToken(data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
        
        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        
        // Process any queued requests
        processQueue(data.tokens.accessToken);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state
        localStorage.removeItem("refreshToken");
        useAuthStore.getState().logout();
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If we're currently refreshing, queue this request
    if (error.response?.status === 401 && isRefreshing && originalRequest) {
      return new Promise((resolve) => {
        refreshSubscribers.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// Export the instance with its type
const typedApi: AxiosInstance = api;
export default typedApi;

// Export types for use in other files
export type { AxiosInstance, AxiosError, AxiosResponse };
