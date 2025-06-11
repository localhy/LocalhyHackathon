import React from 'react';
import { UserPlus, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleJoinBeta = () => {
    navigate('/auth');
  };

  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Join our beta for free and set up your profile as a business, referrer, or idea creator.',
    },
    {
      icon: Zap,
      title: 'Engage',
      description: 'Promote your business, share ideas, or refer clients.',
    },
    {
      icon: TrendingUp,
      title: 'Earn & Grow',
      description: 'Track results with detailed analytics and earn from referrals or ideas.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            How Localhy Works for You
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 relative mb-8 sm:mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform">
                  <step.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-gray-900">
                  {index + 1}
                </div>
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: 'Montserrat' }}
              >
                {step.title}
              </h3>
              <p 
                className="text-sm sm:text-base text-gray-600"
                style={{ fontFamily: 'Inter' }}
              >
                {step.description}
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
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;