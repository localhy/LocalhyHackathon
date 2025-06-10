import React from 'react';
import { UserPlus, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const scrollToNewsletter = () => {
    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            How Localhy Works for You
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                  {index + 1}
                </div>
              </div>
              <h3 
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Montserrat' }}
              >
                {step.title}
              </h3>
              <p 
                className="text-gray-600"
                style={{ fontFamily: 'Inter' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={scrollToNewsletter}
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group"
            style={{ fontFamily: 'Inter' }}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;