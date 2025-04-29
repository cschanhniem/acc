import { AuthResponse, GoogleAuthResponse } from "@peaceflow/shared";
import { useAuthStore } from "../stores/auth";
import api from "./api";

export const authService = {
  // Login with email and password
  emailLogin: async (email: string, password: string) => {
    const { setUser, setAccessToken, setError } = useAuthStore.getState();

    try {
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      setUser(data.user);
      setAccessToken(data.tokens.accessToken);

      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed");
      throw error;
    }
  },

  // Register with email, password and name
  signup: async (email: string, password: string, name: string) => {
    const { setUser, setAccessToken, setError } = useAuthStore.getState();
    try {
      const { data } = await api.post<AuthResponse>("/auth/signup", {
        email,
        password,
        name
      })
  
      setUser(data.user);
      setAccessToken(data.tokens.accessToken);
  
      return data
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed");
      throw error;
    }
  },

  // Generate Google OAuth URL
  getGoogleAuthUrl: () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: import.meta.env.VITE_AUTH_REDIRECT_URL,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (response: GoogleAuthResponse) => {
    const { setUser, setAccessToken, setError } = useAuthStore.getState();

    try {
      const { data } = await api.post<AuthResponse>("/api/v1/auth/google", {
        code: response.code,
      });

      setUser(data.user);
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);

      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed");
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      const { data } = await api.post<AuthResponse>("/api/v1/auth/refresh", {
        refreshToken,
      });

      const { setUser, setAccessToken } = useAuthStore.getState();
      setUser(data.user);
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);

      return data;
    } catch (error) {
      // If refresh fails, log out the user
      authService.logout();
      throw error;
    }
  },

  // Logout
  logout: async () => {
    const { logout } = useAuthStore.getState();
    localStorage.removeItem("refreshToken");
    logout();
    await api.post("/api/v1/auth/logout");
  },
};
