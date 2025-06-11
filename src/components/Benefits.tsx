import React from 'react';
import { Lightbulb, RefreshCw, Megaphone, Wrench, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Benefits = () => {
  const navigate = useNavigate();

  const handleJoinBeta = () => {
    navigate('/auth');
  };

  const benefits = [
    {
      icon: Lightbulb,
      title: 'Share Ideas, Earn Money',
      description: 'Post community business ideas. Get paid per view.',
    },
    {
      icon: RefreshCw,
      title: 'Refer and Get Paid',
      description: 'Earn cash by referring others to local services or ideas.',
    },
    {
      icon: Megaphone,
      title: 'Promote Your Business',
      description: 'Post your business with a reward. Let others bring you real clients. You only pay them for results.',
    },
    {
      icon: Wrench,
      title: 'Use Smart Tools',
      description: 'Templates, business registration help, pitch decks, and marketing tools: all inside Localhy.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            Top Benefits by User Type
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 group-hover:bg-green-600">
                <benefit.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 
                className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: 'Montserrat' }}
              >
                {benefit.title}
              </h3>
              <p 
                className="text-sm sm:text-base text-gray-600"
                style={{ fontFamily: 'Inter' }}
              >
                {benefit.description}
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
            Join Now and Explore
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Benefits;