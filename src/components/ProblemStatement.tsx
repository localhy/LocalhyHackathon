import React from 'react';
import { TrendingDown, Lightbulb, HandHeart } from 'lucide-react';

const ProblemStatement = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            The Local Economy Has Problems
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-red-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat' }}>
              For Businesses
            </h3>
            <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Inter' }}>
              Small businesses waste money on expensive ads with little return or get lost on noisy platforms.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat' }}>
              For Idea Creators
            </h3>
            <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Inter' }}>
              You have great business ideas inspired by your community, but no way to share them and earn from your local knowledge.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <HandHeart className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat' }}>
              For Referrers
            </h3>
            <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Inter' }}>
              You know local businesses that need customers, but there's no easy way to earn passive income by connecting them.
            </p>
          </div>
        </div>

        {/* Solution */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 rounded-2xl text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat' }}>
            Localhy Empowers Everyone
          </h3>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90" style={{ fontFamily: 'Inter' }}>
            Businesses promote affordably with clear results, idea creators monetize their insights, 
            and referrers earn by helping local shops thrive.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
              <span>Affordable promotions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
              <span>Hyper-local targeting</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
              <span>Detailed analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
              <span>Community earnings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;