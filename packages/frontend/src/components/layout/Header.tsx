import { Link } from "react-router-dom";
import { useState } from "react";
import MobileMenu from "./MobileMenu";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthStore } from "../../stores/auth";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { login, logout } = useAuth();
  const { isAuthenticated, user } = useAuthStore();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };
  return (
    <header className="bg-surface shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/90">
             AI Contract Check
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/sounds" className="text-text-secondary hover:text-primary">
                Sounds
              </Link>
              <Link to="/whispers" className="text-text-secondary hover:text-primary">
                Whispers
              </Link>
              {isAuthenticated && (
                <Link to="/whispers/new" className="text-text-secondary hover:text-primary">
                  + Create
                </Link>
              )}
              <Link to="/themes" className="text-text-secondary hover:text-primary">
                Themes
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-text-secondary mr-4 hidden md:inline-block">
                  Hello, {user?.name}
                </span>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={login} className="btn-secondary">
                  Login
                </button>
                <button onClick={login} className="btn-primary hidden md:block">
                  Get Started
                </button>
              </>
            )}
            <button 
              className="md:hidden text-text-primary"
              onClick={toggleMobileMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
