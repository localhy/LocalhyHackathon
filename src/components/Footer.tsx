import React from 'react';
import { MapPin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                Localhy
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md" style={{ fontFamily: 'Inter' }}>
              Empowering local economies by connecting businesses, ideas, and referrals in hyper-local communities.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Mail className="h-4 w-4" />
              <a href="mailto:localhy@proton.me" className="hover:text-green-500 transition-colors">
                localhy@proton.me
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat' }}>
              Company
            </h3>
            <ul className="space-y-3 text-gray-400" style={{ fontFamily: 'Inter' }}>
              <li><a href="#" className="hover:text-green-500 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat' }}>
              Connect
            </h3>
            <ul className="space-y-3 text-gray-400" style={{ fontFamily: 'Inter' }}>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                  <span>X (Twitter)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Inter' }}>
            © 2025 Localhy. Empowering local economies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;