import React from 'react';
import { GraduationCap, Briefcase, Smartphone, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UseCases = () => {
  const navigate = useNavigate();

  const handleJoinBeta = () => {
    navigate('/auth');
  };

  const useCases = [
    {
      icon: GraduationCap,
      role: 'Side Hustler',
      story: 'Shared a delivery idea and earned from reads',
      avatar: 'https://images.pexels.com/photos/3765114/pexels-photo-3765114.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face'
    },
    {
      icon: Briefcase,
      role: 'Local Business Owner',
      story: 'Posted a referral job, got 3 new customers',
      avatar: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face'
    },
    {
      icon: Smartphone,
      role: 'Connector',
      story: 'Made $200 last month just referring gigs',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face'
    },
    {
      icon: Brain,
      role: 'Creator',
      story: 'Posted paid business templates, got downloads',
      avatar: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face'
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
            Real Stories from Beta Users
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="relative mb-3 sm:mb-4">
                <img
                  src={useCase.avatar}
                  alt={useCase.role}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto object-cover"
                />
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <useCase.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
              <h3 
                className="text-base sm:text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {useCase.role}
              </h3>
              <p 
                className="text-xs sm:text-sm text-gray-600"
                style={{ fontFamily: 'Inter' }}
              >
                "{useCase.story}"
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

export default UseCases;