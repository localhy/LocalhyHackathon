import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader, AlertCircle, CheckCircle, Upload, DollarSign, Building, MapPin, Tag, FileText, Globe, Phone, Mail, CreditCard, Info } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { createReferralJobWithPayment, uploadFile, getUserCredits, REFERRAL_JOB_POSTING_COST } from '../lib/database'

// Payment confirmation modal component
const PaymentConfirmationModal = ({ 
  isVisible, 
  onClose, 
  onConfirm, 
  userCredits, 
  cost, 
  isProcessing 
}: { 
  isVisible: boolean
  onClose: () => void
  onConfirm: () => void
  userCredits: number
  cost: number
  isProcessing: boolean
}) => {
  if (!isVisible) return null

  const canAfford = userCredits >= cost

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Confirm Posting
          </h3>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-blue-800">Posting Fee</h4>
            </div>
            <p className="text-blue-700 text-sm">
              There is a fee of {cost} credits to post a referral job. This helps ensure quality listings and supports the platform.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Your Credits:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits} credits
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Posting Fee:</span>
              <span className="font-semibold text-gray-800">{cost} credits</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Remaining Balance:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits - cost} credits
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          {canAfford ? (
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay & Publish</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/dashboard/wallet?tab=purchase'}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Buy Credits</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CreatePost = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userCredits, setUserCredits] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Get post type from URL query parameter
  const searchParams = new URLSearchParams(location.search)
  const postType = searchParams.get('tab') || 'idea'

  // Form state for referral jobs
  const [formData, setFormData] = useState({
    title: '',
    business_name: '',
    description: '',
    commission: 0,
    commission_type: 'percentage' as 'percentage' | 'fixed',
    location: '',
    category: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    requirements: '',
    referral_type: '',
    logo_url: '',
    website: '',
    cta_text: '',
    terms: ''
  })

  // File upload states
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  useEffect(() => {
    // Load user credits when component mounts
    if (user) {
      loadUserCredits()
    }
  }, [user])

  const loadUserCredits = async () => {
    if (!user) return
    
    try {
      const credits = await getUserCredits(user.id)
      setUserCredits(credits)
    } catch (error) {
      console.error('Error loading user credits:', error)
    }
  }

  const handleNavigation = (page: string) => {
    setSidebarOpen(false)
    
    switch(page) {
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'ideas-vault':
        navigate('/dashboard/ideas-vault')
        break
      case 'referral-jobs':
        navigate('/dashboard/referral-jobs')
        break
      case 'starter-tools':
        navigate('/dashboard/starter-tools')
        break
      case 'create-new':
        // Stay on current page
        break
      case 'my-posts':
        navigate('/dashboard/my-posts')
        break
      case 'wallet':
        navigate('/dashboard/wallet')
        break
      case 'profile':
        navigate('/dashboard/profile')
        break
      case 'settings':
        navigate('/dashboard/settings')
        break
      default:
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commission' ? parseFloat(value) || 0 : value
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setError('')

    try {
      const logoUrl = await uploadFile(file, 'business-logos')
      if (logoUrl) {
        setFormData(prev => ({ ...prev, logo_url: logoUrl }))
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      setError(error.message || 'Failed to upload logo. Please try again.')
    } finally {
      setUploadingLogo(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const validateForm = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.business_name.trim()) {
      setError('Business name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (formData.commission <= 0) {
      setError('Commission must be greater than 0')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    // Show payment confirmation modal
    setShowPaymentModal(true)
  }

  const handlePaymentConfirm = async () => {
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (postType === 'referral') {
        const result = await createReferralJobWithPayment({
          user_id: user.id,
          title: formData.title.trim(),
          business_name: formData.business_name.trim(),
          description: formData.description.trim(),
          commission: formData.commission,
          commission_type: formData.commission_type,
          location: formData.location.trim(),
          category: formData.category,
          requirements: formData.requirements.trim() || undefined,
          referral_type: formData.referral_type.trim() || undefined,
          logo_url: formData.logo_url || undefined,
          website: formData.website.trim() || undefined,
          cta_text: formData.cta_text.trim() || undefined,
          terms: formData.terms.trim() || undefined
        })

        if (result) {
          setSuccess('Referral job created successfully!')
          // Update user credits
          await loadUserCredits()
          setTimeout(() => {
            navigate('/dashboard/my-posts')
          }, 2000)
        } else {
          throw new Error('Failed to create referral job')
        }
      } else {
        // For other post types (idea, tool), show placeholder message
        setError('This post type is not yet implemented. Please try creating a referral job instead.')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setLoading(false)
      setShowPaymentModal(false)
    }
  }

  const getPageTitle = () => {
    switch (postType) {
      case 'idea':
        return 'Post a Business Idea'
      case 'referral':
        return 'Create Referral Job'
      case 'tool':
        return 'Submit a Tool'
      default:
        return 'Create New Post'
    }
  }

  const getPageDescription = () => {
    switch (postType) {
      case 'idea':
        return 'Share your business idea with the community and earn when people read it'
      case 'referral':
        return 'Post a referral opportunity and let the community help you find customers'
      case 'tool':
        return 'Submit a useful tool or template to help the community'
      default:
        return 'Create and share content with the community'
    }
  }

  // Show placeholder for non-referral post types
  if (postType !== 'referral') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="create-new"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />

          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {getPageTitle()}
                </h1>
                <p 
                  className="text-gray-600 mt-1"
                  style={{ fontFamily: 'Inter' }}
                >
                  {getPageDescription()}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Coming Soon
                </h2>
                
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  {postType === 'idea' 
                    ? 'Idea posting functionality is coming soon. For now, you can create referral jobs.'
                    : 'Tool submission functionality is coming soon. For now, you can create referral jobs.'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/create-new?tab=referral')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Create Referral Job
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="create-new"
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                {getPageTitle()}
              </h1>
              <p 
                className="text-gray-600 mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                {getPageDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success/Error Messages */}
            {(error || success) && (
              <div className="mb-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{success}</p>
                  </div>
                )}
              </div>
            )}

            {/* Posting Fee Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1" style={{ fontFamily: 'Inter' }}>
                  Posting Fee: {REFERRAL_JOB_POSTING_COST} Credits
                </h3>
                <p className="text-blue-700 text-sm" style={{ fontFamily: 'Inter' }}>
                  There is a fee of {REFERRAL_JOB_POSTING_COST} credits to post a referral job. 
                  Your current balance: <span className="font-semibold">{userCredits} credits</span>
                </p>
                {userCredits < REFERRAL_JOB_POSTING_COST && (
                  <button 
                    onClick={() => navigate('/dashboard/wallet?tab=purchase')}
                    className="mt-2 text-blue-700 hover:text-blue-800 font-medium text-sm underline"
                  >
                    Buy more credits
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Basic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Refer customers to our restaurant"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mario's Italian Restaurant"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter' }}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., New York, NY"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe what you're looking for referrers to do..."
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              {/* Commission & Urgency */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Commission & Priority
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Commission Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="commission"
                        value={formData.commission}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Commission Type *
                    </label>
                    <select
                      name="commission_type"
                      value={formData.commission_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter' }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Urgency
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Additional Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Requirements (Optional)
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Any specific requirements for referrers..."
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Referral Type (Optional)
                      </label>
                      <input
                        type="text"
                        name="referral_type"
                        value={formData.referral_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Customer referral, Lead generation"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Call-to-Action Text (Optional)
                      </label>
                      <input
                        type="text"
                        name="cta_text"
                        value={formData.cta_text}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Apply Now, Get Started"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://yourwebsite.com"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Terms & Conditions (Optional)
                    </label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Any terms and conditions for this referral job..."
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                </div>
              </div>

              {/* Business Logo */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Business Logo (Optional)
                </h2>

                <div className="space-y-4">
                  {formData.logo_url ? (
                    <div className="flex items-center space-x-4">
                      <img
                        src={formData.logo_url}
                        alt="Business logo"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Logo uploaded successfully</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          {uploadingLogo ? 'Uploading...' : 'Upload business logo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  style={{ fontFamily: 'Inter' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center space-x-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create Referral Job</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        userCredits={userCredits}
        cost={REFERRAL_JOB_POSTING_COST}
        isProcessing={loading}
      />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CreatePost