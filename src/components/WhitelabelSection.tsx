import React from 'react';
import { Rocket, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhitelabelSection = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/auth');
  };

  const benefits = [
    {
      icon: Rocket,
      title: 'Your brand, our engine',
      emoji: '🚀'
    },
    {
      icon: DollarSign,
      title: 'Scale & monetize with ease',
      emoji: '💰'
    },
    {
      icon: CheckCircle,
      title: 'Fully managed, zero stress',
      emoji: '✅'
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            Want Your Own Branded Community Platform?
          </h2>
          <p 
            className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Inter' }}
          >
            White-label Localhy and run thriving communities under your own name with no coding required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg border border-gray-200">
                <span className="text-2xl sm:text-3xl">{benefit.emoji}</span>
              </div>
              <h3 
                className="text-base sm:text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                {benefit.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleLearnMore}
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group"
            style={{ fontFamily: 'Inter' }}
          >
            Learn About Whitelabel
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhitelabelSection;