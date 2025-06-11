import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleJoinBeta = () => {
    navigate('/auth');
  };

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white/80 z-10"></div>
        <img
          src="https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Local neighborhood street with shops"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bolt.new Badge - Top Right */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 hover:scale-105 transition-transform duration-200"
      >
        <img
          src="/black_circle_360x360 (1).png"
          alt="Powered by Bolt.new"
          className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: 'Montserrat' }}
          >
            Grow Your Business Locally.<br />
            <span className="text-green-500">Earn from Your Neighborhood.</span>
          </h1>
          
          <p 
            className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Inter' }}
          >
            Localhy connects local businesses, ideas, and referrals in one hyper-local platform. 
            Join our beta to promote, earn, and grow smarter.
          </p>
          
          <button
            onClick={handleJoinBeta}
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group"
            style={{ fontFamily: 'Inter' }}
          >
            Join the Beta
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;