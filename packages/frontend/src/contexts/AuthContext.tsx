import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuthStore } from "../stores/auth";
import { authService } from "../services/auth";

interface AuthContextType {
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, setError, setLoading } = useAuthStore();

  // Handle login with Google
  const login = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      // Only attempt refresh if there's a token AND we don't already have user data in the store
      if (refreshToken && !user) {
        setLoading(true);
        try {
          console.log("Attempting token refresh on initial load...");
          await authService.refreshToken();
          console.log("Token refresh successful.");
        } catch (error) {
          console.error("Token refresh failed on initial load:", error);
          // No need to set error here, failed refresh logs out anyway
          // setError(error instanceof Error ? error.message : "Authentication failed");
        } finally {
          setLoading(false);
        }
      } else {
        // If no refresh token, ensure loading is false
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const value = {
    login,
    logout: authService.logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
