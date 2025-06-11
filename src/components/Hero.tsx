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
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: 'Montserrat' }}
          >
            Grow Your Business Locally.<br />
            <span className="text-green-500">Earn from Your Neighborhood.</span>
          </h1>
          
          <p 
            className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            style={{ fontFamily: 'Inter' }}
          >
            Localhy connects local businesses, ideas, and referrals in one hyper-local platform. 
            Join our beta to promote, earn, and grow smarter.
          </p>
          
          <button
            onClick={handleJoinBeta}
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group"
            style={{ fontFamily: 'Inter' }}
          >
            Join the Beta
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;