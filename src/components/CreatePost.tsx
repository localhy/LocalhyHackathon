import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader, AlertCircle, CheckCircle, Upload, DollarSign, Building, MapPin, Tag, FileText, Globe, Phone, Mail, CreditCard, Info, Download, Wrench, Lightbulb } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { createReferralJobWithPayment, createIdea, createTool, uploadFile, getUserCredits, REFERRAL_JOB_POSTING_COST } from '../lib/database'

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
  const [referralFormData, setReferralFormData] = useState({
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

  // Form state for ideas
  const [ideaFormData, setIdeaFormData] = useState({
    title: '',
    description: '',
    category: '',
    problem_summary: '',
    solution_overview: '',
    price: 0,
    monetize: false,
    tags: [] as string[],
    location: '',
    cover_image_url: '',
    thumbnail_url: ''
  })

  // Form state for tools
  const [toolFormData, setToolFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'free' as 'free' | 'paid' | 'premium',
    price: 0,
    download_url: '',
    tags: [] as string[],
    location: ''
  })

  // File upload states
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingTool, setUploadingTool] = useState(false)

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
      setUserCredits(credits.cashCredits + credits.freeCredits)
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
      case 'business-pages':
        navigate('/dashboard/business-pages')
        break
      case 'community':
        navigate('/dashboard/community')
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

  const handleReferralInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setReferralFormData(prev => ({
      ...prev,
      [name]: name === 'commission' ? parseFloat(value) || 0 : value
    }))
  }

  const handleIdeaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setIdeaFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setToolFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
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
        setReferralFormData(prev => ({ ...prev, logo_url: logoUrl }))
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

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    try {
      const imageUrl = await uploadFile(file, 'idea-covers')
      if (imageUrl) {
        setIdeaFormData(prev => ({ ...prev, cover_image_url: imageUrl }))
      }
    } catch (error: any) {
      console.error('Error uploading cover image:', error)
      setError(error.message || 'Failed to upload cover image. Please try again.')
    } finally {
      setUploadingCover(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    setError('')

    try {
      const imageUrl = await uploadFile(file, 'idea-thumbnails')
      if (imageUrl) {
        setIdeaFormData(prev => ({ ...prev, thumbnail_url: imageUrl }))
      }
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error)
      setError(error.message || 'Failed to upload thumbnail. Please try again.')
    } finally {
      setUploadingThumbnail(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleToolFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingTool(true)
    setError('')

    try {
      const fileUrl = await uploadFile(file, 'tools')
      if (fileUrl) {
        setToolFormData(prev => ({ ...prev, download_url: fileUrl }))
      }
    } catch (error: any) {
      console.error('Error uploading tool file:', error)
      setError(error.message || 'Failed to upload tool file. Please try again.')
    } finally {
      setUploadingTool(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const addIdeaTag = (tag: string) => {
    if (tag.trim() && !ideaFormData.tags.includes(tag.trim())) {
      setIdeaFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeIdeaTag = (tagToRemove: string) => {
    setIdeaFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const addToolTag = (tag: string) => {
    if (tag.trim() && !toolFormData.tags.includes(tag.trim())) {
      setToolFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeToolTag = (tagToRemove: string) => {
    setToolFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const validateReferralForm = () => {
    // Validate required fields
    if (!referralFormData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!referralFormData.business_name.trim()) {
      setError('Business name is required')
      return false
    }
    if (!referralFormData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!referralFormData.location.trim()) {
      setError('Location is required')
      return false
    }
    if (!referralFormData.category) {
      setError('Category is required')
      return false
    }
    if (referralFormData.commission <= 0) {
      setError('Commission must be greater than 0')
      return false
    }
    
    return true
  }

  const validateIdeaForm = () => {
    // Validate required fields
    if (!ideaFormData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!ideaFormData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!ideaFormData.category) {
      setError('Category is required')
      return false
    }
    if (ideaFormData.monetize && (ideaFormData.price <= 0 || ideaFormData.price > 10)) {
      setError('Price must be between $1 and $10')
      return false
    }
    
    return true
  }

  const validateToolForm = () => {
    // Validate required fields
    if (!toolFormData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!toolFormData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!toolFormData.category) {
      setError('Category is required')
      return false
    }
    if (!toolFormData.download_url) {
      setError('Tool file is required')
      return false
    }
    if (toolFormData.type !== 'free' && (toolFormData.price <= 0 || toolFormData.price > 50)) {
      setError('Price must be between $1 and $50')
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

    // Validate form based on post type
    let isValid = false
    if (postType === 'referral') {
      isValid = validateReferralForm()
    } else if (postType === 'idea') {
      isValid = validateIdeaForm()
    } else if (postType === 'tool') {
      isValid = validateToolForm()
    }

    if (!isValid) {
      return
    }

    // For referral jobs, show payment confirmation modal
    if (postType === 'referral') {
      setShowPaymentModal(true)
    } else {
      // For ideas and tools, proceed directly
      handleCreatePost()
    }
  }

  const handlePaymentConfirm = async () => {
    setShowPaymentModal(false)
    handleCreatePost()
  }

  const handleCreatePost = async () => {
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
          title: referralFormData.title.trim(),
          business_name: referralFormData.business_name.trim(),
          description: referralFormData.description.trim(),
          commission: referralFormData.commission,
          commission_type: referralFormData.commission_type,
          location: referralFormData.location.trim(),
          category: referralFormData.category,
          requirements: referralFormData.requirements.trim() || undefined,
          referral_type: referralFormData.referral_type.trim() || undefined,
          logo_url: referralFormData.logo_url || undefined,
          website: referralFormData.website.trim() || undefined,
          cta_text: referralFormData.cta_text.trim() || undefined,
          terms: referralFormData.terms.trim() || undefined
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
      } else if (postType === 'idea') {
        const result = await createIdea({
          user_id: user.id,
          title: ideaFormData.title.trim(),
          description: ideaFormData.description.trim(),
          category: ideaFormData.category,
          problem_summary: ideaFormData.problem_summary.trim() || undefined,
          solution_overview: ideaFormData.solution_overview.trim() || undefined,
          price: ideaFormData.monetize ? ideaFormData.price : 0,
          tags: ideaFormData.tags.length > 0 ? ideaFormData.tags : undefined,
          location: ideaFormData.location.trim() || undefined,
          cover_image_url: ideaFormData.cover_image_url || undefined,
          thumbnail_url: ideaFormData.thumbnail_url || undefined
        })

        if (result) {
          setSuccess('Idea created successfully!')
          setTimeout(() => {
            navigate('/dashboard/my-posts')
          }, 2000)
        } else {
          throw new Error('Failed to create idea')
        }
      } else if (postType === 'tool') {
        const result = await createTool({
          user_id: user.id,
          title: toolFormData.title.trim(),
          description: toolFormData.description.trim(),
          category: toolFormData.category,
          type: toolFormData.type,
          price: toolFormData.type !== 'free' ? toolFormData.price : 0,
          download_url: toolFormData.download_url,
          tags: toolFormData.tags.length > 0 ? toolFormData.tags : undefined,
          location: toolFormData.location.trim() || undefined
        })

        if (result) {
          setSuccess('Tool created successfully!')
          setTimeout(() => {
            navigate('/dashboard/my-posts')
          }, 2000)
        } else {
          throw new Error('Failed to create tool')
        }
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setLoading(false)
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

  // Render form based on post type
  const renderForm = () => {
    if (postType === 'referral') {
      return (
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
                  value={referralFormData.title}
                  onChange={handleReferralInputChange}
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
                  value={referralFormData.business_name}
                  onChange={handleReferralInputChange}
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
                  value={referralFormData.category}
                  onChange={handleReferralInputChange}
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
                    value={referralFormData.location}
                    onChange={handleReferralInputChange}
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
                value={referralFormData.description}
                onChange={handleReferralInputChange}
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
                    value={referralFormData.commission}
                    onChange={handleReferralInputChange}
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
                  value={referralFormData.commission_type}
                  onChange={handleReferralInputChange}
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
                  value={referralFormData.urgency}
                  onChange={handleReferralInputChange}
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
                  value={referralFormData.requirements}
                  onChange={handleReferralInputChange}
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
                    value={referralFormData.referral_type}
                    onChange={handleReferralInputChange}
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
                    value={referralFormData.cta_text}
                    onChange={handleReferralInputChange}
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
                    value={referralFormData.website}
                    onChange={handleReferralInputChange}
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
                  value={referralFormData.terms}
                  onChange={handleReferralInputChange}
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
              {referralFormData.logo_url ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={referralFormData.logo_url}
                    alt="Business logo"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Logo uploaded successfully</p>
                    <button
                      type="button"
                      onClick={() => setReferralFormData(prev => ({ ...prev, logo_url: '' }))}
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
      )
    } else if (postType === 'idea') {
      return (
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
                  Idea Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={ideaFormData.title}
                  onChange={handleIdeaInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Mobile Coffee Cart for Local Events"
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
                  value={ideaFormData.category}
                  onChange={handleIdeaInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={ideaFormData.location}
                    onChange={handleIdeaInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Chicago, IL"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Pricing
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="monetize"
                      checked={ideaFormData.monetize}
                      onChange={(e) => setIdeaFormData(prev => ({ ...prev, monetize: e.target.checked }))}
                      className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="monetize" className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter' }}>
                      Charge readers to view full idea?
                    </label>
                  </div>
                  
                  {ideaFormData.monetize && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                        Price ($1 - $10)
                      </label>
                      <div className="relative w-32">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          min="1"
                          max="10"
                          value={ideaFormData.price}
                          onChange={handleIdeaInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ fontFamily: 'Inter' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Problem & Solution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Problem & Solution
            </h2>

            <div className="space-y-6">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Problem Summary
                </label>
                <textarea
                  name="problem_summary"
                  value={ideaFormData.problem_summary}
                  onChange={handleIdeaInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="What problem does this business idea solve?"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Solution Overview
                </label>
                <textarea
                  name="solution_overview"
                  value={ideaFormData.solution_overview}
                  onChange={handleIdeaInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="How does your idea solve this problem?"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Detailed Description *
            </h2>

            <div>
              <textarea
                name="description"
                value={ideaFormData.description}
                onChange={handleIdeaInputChange}
                rows={8}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Provide a detailed description of your business idea..."
                style={{ fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Tags (Optional)
            </h2>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {ideaFormData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeIdeaTag(tag)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addIdeaTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add tags (press Enter)"]') as HTMLInputElement
                    if (input && input.value) {
                      addIdeaTag(input.value)
                      input.value = ''
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
              
              <p className="text-xs text-gray-500">
                Tags help others discover your idea. Examples: #startup, #lowcost, #sustainable
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Images (Optional)
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Cover Image
                </label>
                {ideaFormData.cover_image_url ? (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      src={ideaFormData.cover_image_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setIdeaFormData(prev => ({ ...prev, cover_image_url: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-48 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-green-600 hover:text-green-700 font-medium">
                        {uploadingCover ? 'Uploading...' : 'Upload cover image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={uploadingCover}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">For hero section (16:9 recommended)</p>
                  </div>
                )}
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Thumbnail
                </label>
                {ideaFormData.thumbnail_url ? (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      src={ideaFormData.thumbnail_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setIdeaFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-48 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-green-600 hover:text-green-700 font-medium">
                        {uploadingThumbnail ? 'Uploading...' : 'Upload thumbnail'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">For card grids (1:1 recommended)</p>
                  </div>
                )}
              </div>
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
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  <span>Post Business Idea</span>
                </>
              )}
            </button>
          </div>
        </form>
      )
    } else if (postType === 'tool') {
      return (
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
                  Tool Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={toolFormData.title}
                  onChange={handleToolInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Business Plan Template"
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
                  value={toolFormData.category}
                  onChange={handleToolInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  Tool Type *
                </label>
                <select
                  name="type"
                  value={toolFormData.type}
                  onChange={handleToolInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  style={{ fontFamily: 'Inter' }}
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={toolFormData.location}
                    onChange={handleToolInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Global or specific location"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              {toolFormData.type !== 'free' && (
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Price (Credits) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={toolFormData.price}
                      onChange={handleToolInputChange}
                      required
                      min="1"
                      max="50"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 5"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Set a price between 1-50 credits. Users will pay this amount to download your tool.
                  </p>
                </div>
              )}
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
                value={toolFormData.description}
                onChange={handleToolInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                placeholder="Describe your tool, what it does, and how it helps users..."
                style={{ fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Tags (Optional)
            </h2>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {toolFormData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeToolTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToolTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add tags (press Enter)"]') as HTMLInputElement
                    if (input && input.value) {
                      addToolTag(input.value)
                      input.value = ''
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
              
              <p className="text-xs text-gray-500">
                Tags help others discover your tool. Examples: #template, #marketing, #finance
              </p>
            </div>
          </div>

          {/* Tool File Upload */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 
              className="text-lg font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Montserrat' }}
            >
              Tool File *
            </h2>

            <div className="space-y-4">
              {toolFormData.download_url ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">File uploaded successfully</p>
                    <p className="text-xs text-gray-500 truncate">{toolFormData.download_url.split('/').pop()}</p>
                    <button
                      type="button"
                      onClick={() => setToolFormData(prev => ({ ...prev, download_url: '' }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-purple-600 hover:text-purple-700 font-medium">
                      {uploadingTool ? 'Uploading...' : 'Upload your tool file'}
                    </span>
                    <input
                      type="file"
                      onChange={handleToolFileUpload}
                      disabled={uploadingTool}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOCX, XLSX, ZIP, etc. up to 50MB</p>
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
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4" />
                  <span>Submit Tool</span>
                </>
              )}
            </button>
          </div>
        </form>
      )
    }
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

            {/* Posting Fee Notice - Only for referral jobs */}
            {postType === 'referral' && (
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
            )}

            {/* Form */}
            {renderForm()}
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