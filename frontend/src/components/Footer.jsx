import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">HM</span>
              </div>
              <span className="text-xl font-bold text-white">HireMinds</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connect with top freelancers and find your dream projects. HireMinds makes hiring smarter and easier.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="mailto:contact@hireminds.com"
                className="text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} HireMinds. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> for freelancers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
