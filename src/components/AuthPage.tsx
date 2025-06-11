import React, { useState } from 'react'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ImageCarousel from './ImageCarousel'

const AuthPage = () => {
  const { signUp, signIn } = useAuth()
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    userType: '',
    newsletter: true
  })

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        name: signUpData.name,
        user_type: signUpData.userType,
        newsletter_opt_in: signUpData.newsletter
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(loginData.email, loginData.password)

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const switchToLogin = () => {
    setIsLogin(true)
    setError('')
  }

  const switchToSignUp = () => {
    setIsLogin(false)
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Header - Mobile Only */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          <span 
            className="text-xl sm:text-2xl font-bold text-green-500"
            style={{ fontFamily: 'Montserrat' }}
          >
            Localhy
          </span>
        </div>
      </header>

      {/* Left Column - Images */}
      <div className="lg:w-1/2 h-48 sm:h-64 lg:h-screen relative">
        <ImageCarousel />
      </div>

      {/* Right Column - Forms */}
      <div className="lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12 lg:px-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center space-x-2 mb-8 lg:mb-12">
            <MapPin className="h-8 w-8 lg:h-10 lg:w-10 text-green-500" />
            <span 
              className="text-2xl lg:text-3xl font-bold text-green-500 relative"
              style={{ fontFamily: 'Montserrat' }}
            >
              Localhy
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-yellow-400 rounded-full"></div>
            </span>
          </div>

          {/* Form Toggle Buttons */}
          <div className="flex mb-6 sm:mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={switchToSignUp}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${
                !isLogin 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              Sign Up
            </button>
            <button
              onClick={switchToLogin}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${
                isLogin 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              Login
            </button>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm" style={{ fontFamily: 'Inter' }}>
                {error}
              </p>
            </div>
          )}

          {/* Forms Container */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
            {/* Sign Up Form */}
            <div className={`transition-all duration-300 ${isLogin ? 'hidden' : 'block'}`}>
              <h2 
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center"
                style={{ fontFamily: 'Montserrat' }}
              >
                Join Localhy
              </h2>

              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                <div>
                  <label 
                    htmlFor="signup-name" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="signup-name"
                    required
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                    placeholder="Your full name"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="signup-email" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                    placeholder="your.email@example.com"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="signup-password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password"
                      required
                      minLength={8}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                      placeholder="Minimum 8 characters"
                      style={{ fontFamily: 'Inter' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="user-type" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    User Type *
                  </label>
                  <select
                    id="user-type"
                    required
                    value={signUpData.userType}
                    onChange={(e) => setSignUpData({ ...signUpData, userType: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value="">Select your role</option>
                    <option value="business-owner">Business Owner</option>
                    <option value="referrer">Referrer</option>
                    <option value="idea-creator">Idea Creator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={signUpData.newsletter}
                    onChange={(e) => setSignUpData({ ...signUpData, newsletter: e.target.checked })}
                    className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor="newsletter" 
                    className="ml-2 text-sm text-gray-700"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Subscribe to Localhy's newsletter for updates
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-yellow-400 text-white hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{ fontFamily: 'Inter' }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <p className="mt-3 sm:mt-4 text-center text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                Already have an account?{' '}
                <button
                  onClick={switchToLogin}
                  className="text-green-500 hover:text-green-600 font-medium"
                >
                  Login
                </button>
              </p>
            </div>

            {/* Login Form */}
            <div className={`transition-all duration-300 ${!isLogin ? 'hidden' : 'block'}`}>
              <h2 
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center"
                style={{ fontFamily: 'Montserrat' }}
              >
                Welcome Back
              </h2>

              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div>
                  <label 
                    htmlFor="login-email" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                    placeholder="your.email@example.com"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="login-password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                      placeholder="Your password"
                      style={{ fontFamily: 'Inter' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-yellow-400 text-white hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{ fontFamily: 'Inter' }}
                >
                  {loading ? 'Signing In...' : 'Login'}
                </button>
              </form>

              <div className="mt-3 sm:mt-4 text-center space-y-2">
                <button className="text-gray-600 hover:text-gray-800 text-sm" style={{ fontFamily: 'Inter' }}>
                  Forgot Password?
                </button>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                  New to Localhy?{' '}
                  <button
                    onClick={switchToSignUp}
                    className="text-green-500 hover:text-green-600 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage