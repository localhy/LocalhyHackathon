import React from 'react';
import { MapPin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                Localhy
              </span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base" style={{ fontFamily: 'Inter' }}>
              Empowering local economies by connecting businesses, ideas, and referrals in hyper-local communities.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Mail className="h-4 w-4" />
              <a href="mailto:localhy@proton.me" className="hover:text-green-500 transition-colors text-sm sm:text-base">
                localhy@proton.me
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat' }}>
              Connect
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Inter' }}>
              <li>
                <a href="https://twitter.com/localhy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                  <span>X (Twitter)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://instagram.com/localhy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Inter' }}>
            © 2025 Localhy. Empowering local economies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;