import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LegalDisclaimer from "../../components/common/LegalDisclaimer";

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Contract Check</h2>
          <p className="text-text-secondary">Sign in to continue your journey to digital wellness</p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={login}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 border border-gray-300 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Add Legal Disclaimer */}
        <div className="mt-6">
          <LegalDisclaimer className="text-tiny" />
        </div>

        <div className="mt-4 text-center text-sm">
          <p className="text-text-secondary">
            By continuing, you also agree to our{" "}
            <a href="/terms" className="text-primary hover:text-primary/90">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:text-primary/90">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
