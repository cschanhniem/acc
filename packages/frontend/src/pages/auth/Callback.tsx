import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { authService } from "../../services/auth";

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setError } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setError(error);
        navigate("/login");
        return;
      }

      if (!code) {
        setError("No authorization code received");
        navigate("/login");
        return;
      }

      try {
        await authService.handleGoogleCallback({ code, state: "" });
        navigate("/");
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, searchParams, setError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
