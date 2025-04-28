import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthStore } from "../../stores/auth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { login, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      {/* Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-surface shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <nav className="mt-8">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/sounds"
                  className="block text-text-secondary hover:text-primary py-2"
                  onClick={onClose}
                >
                  Sounds
                </Link>
              </li>
              <li>
                <Link
                  to="/whispers"
                  className="block text-text-secondary hover:text-primary py-2"
                  onClick={onClose}
                >
                  Whispers
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    to="/whispers/new"
                    className="block text-text-secondary hover:text-primary py-2"
                    onClick={onClose}
                  >
                    + Create Whisper
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/themes"
                  className="block text-text-secondary hover:text-primary py-2"
                  onClick={onClose}
                >
                  Themes
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-8 space-y-4">
            {isAuthenticated ? (
              <button 
                onClick={async () => {
                  await logout();
                  onClose();
                }} 
                className="btn-secondary w-full"
              >
                Logout
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    login();
                    onClose();
                  }} 
                  className="btn-secondary w-full"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    login();
                    onClose();
                  }} 
                  className="btn-primary w-full"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
