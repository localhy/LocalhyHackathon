import React, { useState } from 'react';
import { Mail, Gift, Shield } from 'lucide-react';

const Newsletter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
    challenge: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <section id="newsletter\" className="py-20 bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Community map"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-green-500" />
            </div>
            <h2 
              className="text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Montserrat' }}
            >
              Welcome to Localhy Beta!
            </h2>
            <p 
              className="text-xl text-white/90 mb-6"
              style={{ fontFamily: 'Inter' }}
            >
              Thank you for joining! We'll send you your 50 free credits and beta access details shortly.
            </p>
            <p 
              className="text-white/80"
              style={{ fontFamily: 'Inter' }}
            >
              Check your email for next steps and exclusive updates.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="newsletter" className="py-20 bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Community map"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: 'Montserrat' }}
          >
            Join the Localhy Beta & Newsletter
          </h2>
          <p 
            className="text-xl text-white/90 mb-8"
            style={{ fontFamily: 'Inter' }}
          >
            Be the first to try Localhy. Get 50 free credits and stay updated on local business opportunities.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter' }}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter' }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter' }}>
                User Type *
              </label>
              <select
                id="userType"
                name="userType"
                required
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
              >
                <option value="" className="text-gray-900">Select your primary role</option>
                <option value="business-owner" className="text-gray-900">Business Owner</option>
                <option value="referrer" className="text-gray-900">Referrer</option>
                <option value="idea-creator" className="text-gray-900">Idea Creator</option>
                <option value="other" className="text-gray-900">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="challenge" className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter' }}>
                What's your biggest challenge with local business growth? (Optional)
              </label>
              <textarea
                id="challenge"
                name="challenge"
                rows={3}
                value={formData.challenge}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm resize-none"
                placeholder="Tell us about your challenges..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ fontFamily: 'Inter' }}
            >
              Join the Beta - Get 50 Free Credits
            </button>
          </form>

          {/* Incentives */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-white/90">
              <Gift className="h-5 w-5 text-yellow-400" />
              <span style={{ fontFamily: 'Inter' }}>Get 50 free credits to try promoted posts or referrals</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <Mail className="h-5 w-5 text-yellow-400" />
              <span style={{ fontFamily: 'Inter' }}>Exclusive updates via our newsletter</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <Shield className="h-5 w-5 text-yellow-400" />
              <span style={{ fontFamily: 'Inter' }}>We'll never share your info</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;