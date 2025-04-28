import { create } from "zustand";
import { UserProfile } from "@peaceflow/shared";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setAccessToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  setUser: (user) => 
    set({
      user,
      isAuthenticated: !!user,
    }),
  
  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),
  
  setError: (error) =>
    set({ error }),
  
  setLoading: (isLoading) =>
    set({ isLoading }),
  
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    }),
}));
