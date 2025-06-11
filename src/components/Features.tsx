import React from 'react';
import { Megaphone, Handshake, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();

  const handleJoinBeta = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: Megaphone,
      title: 'Promoted Posts',
      description: 'Boost your business with hyper-local posts that reach the right people in your neighborhood.',
    },
    {
      icon: Handshake,
      title: 'Refer & Earn',
      description: 'Earn cash by referring customers to local businesses. Turn your network into income.',
    },
    {
      icon: Lightbulb,
      title: 'Share Ideas',
      description: 'Post local business ideas and earn when others unlock them. Inspire and profit.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            What You Can Do with Localhy
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-500 transition-colors">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 group-hover:text-white transition-colors" />
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: 'Montserrat' }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-sm sm:text-base text-gray-600"
                style={{ fontFamily: 'Inter' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
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

export default Features;