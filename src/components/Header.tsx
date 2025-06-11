import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Localhy
            </span>
          </div>
          
          {/* Bolt.new Badge - visible on all screen sizes */}
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/black_circle_360x360 (1).png"
              alt="Powered by Bolt.new"
              className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;