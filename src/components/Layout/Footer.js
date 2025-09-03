import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Vote className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Online Voting System</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Modern online voting system for creating and participating in polls. 
              Secure, transparent, and user-friendly polling platform.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-primary-600">
                <Github className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-primary-600">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-primary-600">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/polls" className="text-gray-600 hover:text-primary-600">
                  Browse Polls
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-600 hover:text-primary-600">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-gray-600 hover:text-primary-600">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-gray-600 hover:text-primary-600">
                  Terms of Service
                </button>
              </li>
              <li>
                <button className="text-gray-600 hover:text-primary-600">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Online Voting System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
