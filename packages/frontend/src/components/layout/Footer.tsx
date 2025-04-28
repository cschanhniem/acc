import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PeaceFlow</h3>
            <p className="text-text-secondary text-sm">
              Your journey to digital wellness starts here.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/sounds" className="text-text-secondary hover:text-primary text-sm">
                  Ambient Sounds
                </Link>
              </li>
              <li>
                <Link to="/whispers" className="text-text-secondary hover:text-primary text-sm">
                  Whispers
                </Link>
              </li>
              <li>
                <Link to="/themes" className="text-text-secondary hover:text-primary text-sm">
                  Themes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-text-secondary hover:text-primary text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-text-secondary hover:text-primary text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-secondary hover:text-primary text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-text-secondary hover:text-primary text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-secondary hover:text-primary text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-text-secondary text-sm">
            © {year}AI Contract Check. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
