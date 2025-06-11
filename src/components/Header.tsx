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

  const handleJoinBeta = () => {
    navigate('/auth');
  };

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
          
          {/* Join Beta button - hidden on mobile, visible on sm and up */}
          <button
            onClick={handleJoinBeta}
            className="hidden sm:block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Inter' }}
          >
            Join Beta
          </button>
          
          {/* Bolt.new Badge - visible on mobile, hidden on sm and up */}
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="block sm:hidden hover:scale-105 transition-transform duration-200"
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