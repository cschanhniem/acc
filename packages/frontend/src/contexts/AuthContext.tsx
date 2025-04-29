// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { authService } from "../services/auth";

interface AuthContextType {
  // Initiate Google OAuth login
  login: () => void;
  // Credentials-based login
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  // Credentials-based signup
  signup: (username: string, password: string) => Promise<void>;
  // Logout (clears store and tokens)
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Extract only the actions the store provides
  const { setLoading, setError, setUser } = useAuthStore();

  // --- Google OAuth login ---
  const login = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  // --- Credentials-based login ---
  const loginWithCredentials = async (
    username: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Store JWT in localStorage
      localStorage.setItem("token", data.token);
      // Update user in store; assume user object requires username
      setUser({ username });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Credentials-based signup ---
  const signup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // On successful signup, auto-login
      await loginWithCredentials(username, password);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // --- Logout ---
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout(); // clear server-side session if needed
    } catch {
      // ignore errors
    }
    // Clear client-side auth
    setUser(null);
    localStorage.removeItem("token");
    setLoading(false);
    navigate("/login");
  };

  // --- Initialize auth on app start ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally decode or verify token here
      // For now, setUser from stored token if needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, loginWithCredentials, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
