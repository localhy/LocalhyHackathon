import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, DollarSign, MapPin, Tag, Save, Loader, AlertCircle, Check } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { createIdea, createReferralJob, createTool, uploadFile, type CreateIdeaData, type CreateReferralJobData, type CreateToolData } from '../lib/database'

const CreatePost = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'idea')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Common form states
  const [uploading, setUploading] = useState(false)

  // Idea form state
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    country: '',
    stateRegion: '',
    city: '',
    street: '',
    category: '',
    problemSummary: '',
    solutionOverview: '',
    description: '',
    coverImage: null as File | null,
    coverImageUrl: '',
    thumbnailImage: null as File | null,
    thumbnailImageUrl: '',
    tags: [] as string[],
    monetize: false,
    price: 1
  })

  // Referral job form state
  const [referralForm, setReferralForm] = useState({
    title: '',
    country: '',
    stateRegion: '',
    city: '',
    street: '',
    referralType: '',
    rewardType: 'percentage', // New field
    rewardValue: 10, // New field
    businessName: '',
    description: '',
    category: '',
    requirements: '',
    urgency: 'medium',
    coverImage: null as File | null,
    coverImageUrl: '',
    thumbnailImage: null as File | null,
    thumbnailImageUrl: '',
    tags: [] as string[]
  })

  // Tool form state
  const [toolForm, setToolForm] = useState({
    title: '',
    description: '',
    category: '',
    whoItsFor: '',
    toolType: '',
    type: 'free',
    price: 0,
    downloadUrl: ''
  })

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Italy', 'Spain',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Ireland', 'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia',
    'Croatia', 'Romania', 'Bulgaria', 'Lithuania', 'Latvia', 'Estonia', 'Malta', 'Cyprus',
    'Luxembourg', 'Iceland', 'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Hong Kong',
    'Taiwan', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'New Zealand',
    'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'South Africa', 'Nigeria',
    'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Russia', 'Ukraine', 'Turkey', 'Israel', 'UAE',
    'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'
  ].sort()

  const ideaCategories = [
    'Food & Beverage', 'Technology', 'Fashion', 'Health & Wellness', 'Education', 
    'Real Estate', 'Transportation', 'Entertainment', 'Professional Services', 'Retail', 'Other'
  ]

  const referralCategories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  const referralTypes = [
    'Product', 'Service', 'Event', 'Store Visit', 'App Download', 'Subscription', 'Consultation', 'Other'
  ]

  const toolCategories = [
    'Template', 'Software', 'Resource', 'Guide', 'Course', 'Tool', 'Other'
  ]

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
      case 'tool-submission':
        navigate('/dashboard/tool-submission')
        break
      case 'my-posts':
        navigate('/dashboard/my-posts')
        break
      case 'vault-stats':
        navigate('/dashboard/vault-stats')
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

  const handleImageUpload = async (file: File, type: 'cover' | 'thumbnail', formType: 'idea' | 'referral') => {
    setUploading(true)
    setError('')
    
    try {
      const bucket = type === 'cover' ? 'idea-covers' : 'idea-thumbnails'
      const imageUrl = await uploadFile(file, bucket)
      
      if (imageUrl) {
        if (formType === 'idea') {
          if (type === 'cover') {
            setIdeaForm(prev => ({ ...prev, coverImageUrl: imageUrl, coverImage: file }))
          } else {
            setIdeaForm(prev => ({ ...prev, thumbnailImageUrl: imageUrl, thumbnailImage: file }))
          }
        } else if (formType === 'referral') {
          if (type === 'cover') {
            setReferralForm(prev => ({ ...prev, coverImageUrl: imageUrl, coverImage: file }))
          } else {
            setReferralForm(prev => ({ ...prev, thumbnailImageUrl: imageUrl, thumbnailImage: file }))
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const addTag = (tag: string, formType: 'idea' | 'referral') => {
    if (formType === 'idea') {
      if (tag.trim() && !ideaForm.tags.includes(tag.trim())) {
        setIdeaForm(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
      }
    } else if (formType === 'referral') {
      if (tag.trim() && !referralForm.tags.includes(tag.trim())) {
        setReferralForm(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
      }
    }
  }

  const removeTag = (tagToRemove: string, formType: 'idea' | 'referral') => {
    if (formType === 'idea') {
      setIdeaForm(prev => ({ 
        ...prev, 
        tags: prev.tags.filter(tag => tag !== tagToRemove) 
      }))
    } else if (formType === 'referral') {
      setReferralForm(prev => ({ 
        ...prev, 
        tags: prev.tags.filter(tag => tag !== tagToRemove) 
      }))
    }
  }

  const handleSubmitIdea = async () => {
    if (!user) return

    // Validation
    if (!ideaForm.title.trim()) {
      setError('Title is required')
      return
    }
    if (!ideaForm.country) {
      setError('Country is required')
      return
    }
    if (!ideaForm.stateRegion.trim()) {
      setError('State/Region is required')
      return
    }
    if (!ideaForm.city.trim()) {
      setError('City is required')
      return
    }
    if (!ideaForm.street.trim()) {
      setError('Street is required')
      return
    }
    if (!ideaForm.category) {
      setError('Category is required')
      return
    }
    if (!ideaForm.problemSummary.trim()) {
      setError('Problem summary is required')
      return
    }
    if (!ideaForm.solutionOverview.trim()) {
      setError('Solution overview is required')
      return
    }
    if (!ideaForm.description.trim()) {
      setError('Description is required')
      return
    }
    if (!ideaForm.coverImageUrl) {
      setError('Cover image is required')
      return
    }
    if (!ideaForm.thumbnailImageUrl) {
      setError('Thumbnail image is required')
      return
    }
    if (ideaForm.tags.length === 0) {
      setError('At least one tag is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const location = `${ideaForm.street}, ${ideaForm.city}, ${ideaForm.stateRegion}, ${ideaForm.country}`
      
      const ideaData: CreateIdeaData = {
        user_id: user.id,
        title: ideaForm.title,
        description: ideaForm.description,
        category: ideaForm.category,
        price: ideaForm.monetize ? ideaForm.price : 0,
        location,
        problem_summary: ideaForm.problemSummary,
        solution_overview: ideaForm.solutionOverview,
        cover_image_url: ideaForm.coverImageUrl,
        thumbnail_url: ideaForm.thumbnailImageUrl,
        tags: ideaForm.tags
      }

      const result = await createIdea(ideaData)
      
      if (result) {
        setSuccess('Idea created successfully!')
        setTimeout(() => {
          navigate('/dashboard/ideas-vault')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create idea')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReferralJob = async () => {
    if (!user) return

    // Validation
    if (!referralForm.title.trim()) {
      setError('Job title is required')
      return
    }
    if (!referralForm.country) {
      setError('Country is required')
      return
    }
    if (!referralForm.stateRegion.trim()) {
      setError('State/Region is required')
      return
    }
    if (!referralForm.city.trim()) {
      setError('City is required')
      return
    }
    if (!referralForm.street.trim()) {
      setError('Street is required')
      return
    }
    if (!referralForm.referralType) {
      setError('Referral type is required')
      return
    }
    if (!referralForm.businessName.trim()) {
      setError('Business name is required')
      return
    }
    if (!referralForm.description.trim()) {
      setError('Description is required')
      return
    }
    if (!referralForm.category) {
      setError('Category is required')
      return
    }
    if (!referralForm.coverImageUrl) {
      setError('Cover image is required')
      return
    }
    if (!referralForm.thumbnailImageUrl) {
      setError('Thumbnail image is required')
      return
    }
    if (referralForm.tags.length === 0) {
      setError('At least one tag is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const location = `${referralForm.street}, ${referralForm.city}, ${referralForm.stateRegion}, ${referralForm.country}`
      
      const jobData: CreateReferralJobData = {
        user_id: user.id,
        title: referralForm.title,
        business_name: referralForm.businessName,
        description: referralForm.description,
        commission: referralForm.rewardValue,
        commission_type: referralForm.rewardType as 'percentage' | 'fixed',
        location,
        category: referralForm.category,
        requirements: referralForm.requirements,
        referral_type: referralForm.referralType
      }

      const result = await createReferralJob(jobData)
      
      if (result) {
        setSuccess('Referral job created successfully!')
        setTimeout(() => {
          navigate('/dashboard/referral-jobs')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create referral job')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTool = async () => {
    if (!user) return

    // Validation
    if (!toolForm.title.trim()) {
      setError('Title is required')
      return
    }
    if (!toolForm.description.trim()) {
      setError('Description is required')
      return
    }
    if (!toolForm.category) {
      setError('Category is required')
      return
    }
    if (!toolForm.whoItsFor.trim()) {
      setError('Who it\'s for is required')
      return
    }
    if (!toolForm.toolType.trim()) {
      setError('Tool type is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const toolData: CreateToolData = {
        user_id: user.id,
        title: toolForm.title,
        description: toolForm.description,
        category: toolForm.category,
        type: toolForm.type as 'free' | 'paid' | 'premium',
        price: toolForm.type === 'free' ? 0 : toolForm.price,
        download_url: toolForm.downloadUrl || null,
        who_its_for: toolForm.whoItsFor,
        tool_type: toolForm.toolType
      }

      const result = await createTool(toolData)
      
      if (result) {
        setSuccess('Tool submitted successfully!')
        setTimeout(() => {
          navigate('/dashboard/starter-tools')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit tool')
    } finally {
      setLoading(false)
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
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Create New Post
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <nav className="flex space-x-8">
              {[
                { id: 'idea', label: 'Business Idea', color: 'green' },
                { id: 'referral', label: 'Referral Job', color: 'blue' },
                { id: 'tool', label: 'Tool/Template', color: 'purple' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
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
                    <Check className="h-5 w-5 text-green-500" />
                    <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{success}</p>
                  </div>
                )}
              </div>
            )}

            {/* Idea Form */}
            {activeTab === 'idea' && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 
                  className="text-xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Share Your Business Idea
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idea Title *
                    </label>
                    <input
                      type="text"
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Local Food Delivery Service for Seniors"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={ideaForm.country}
                        onChange={(e) => setIdeaForm(prev => ({ ...prev, country: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={ideaForm.stateRegion}
                        onChange={(e) => setIdeaForm(prev => ({ ...prev, stateRegion: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="State/Region"
                      />
                      <input
                        type="text"
                        value={ideaForm.city}
                        onChange={(e) => setIdeaForm(prev => ({ ...prev, city: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={ideaForm.street}
                        onChange={(e) => setIdeaForm(prev => ({ ...prev, street: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Street/Area"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={ideaForm.category}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Category</option>
                      {ideaCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Problem Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Summary *
                    </label>
                    <textarea
                      value={ideaForm.problemSummary}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, problemSummary: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="What problem does this idea solve?"
                    />
                  </div>

                  {/* Solution Overview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solution Overview *
                    </label>
                    <textarea
                      value={ideaForm.solutionOverview}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, solutionOverview: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="How would this idea work?"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="Provide detailed information about your business idea..."
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {ideaForm.coverImageUrl ? (
                        <div className="relative">
                          <img
                            src={ideaForm.coverImageUrl}
                            alt="Cover"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => setIdeaForm(prev => ({ ...prev, coverImageUrl: '', coverImage: null }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-green-600 hover:text-green-700 font-medium">
                              {uploading ? 'Uploading...' : 'Upload cover image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'cover', 'idea')
                              }}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">For detail pages (16:9 recommended)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {ideaForm.thumbnailImageUrl ? (
                        <div className="relative">
                          <img
                            src={ideaForm.thumbnailImageUrl}
                            alt="Thumbnail"
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => setIdeaForm(prev => ({ ...prev, thumbnailImageUrl: '', thumbnailImage: null }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-green-600 hover:text-green-700 font-medium">
                              {uploading ? 'Uploading...' : 'Upload thumbnail'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'thumbnail', 'idea')
                              }}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">For card grids (16:9 recommended)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ideaForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag, 'idea')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.currentTarget.value, 'idea')
                          e.currentTarget.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Monetization */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="monetize"
                        checked={ideaForm.monetize}
                        onChange={(e) => setIdeaForm(prev => ({ ...prev, monetize: e.target.checked }))}
                        className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="monetize" className="text-sm font-medium text-gray-700">
                        Charge readers to view full idea?
                      </label>
                    </div>
                    
                    {ideaForm.monetize && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($1 - $10)
                        </label>
                        <div className="relative w-32">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={ideaForm.price}
                            onChange={(e) => setIdeaForm(prev => ({ ...prev, price: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitIdea}
                      disabled={loading || uploading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Publish Idea</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Job Form */}
            {activeTab === 'referral' && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 
                  className="text-xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Create a Referral Job
                </h2>

                <div className="space-y-6">
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={referralForm.title}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Refer Customers to Our Salon"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={referralForm.country}
                        onChange={(e) => setReferralForm(prev => ({ ...prev, country: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={referralForm.stateRegion}
                        onChange={(e) => setReferralForm(prev => ({ ...prev, stateRegion: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State/Region"
                      />
                      <input
                        type="text"
                        value={referralForm.city}
                        onChange={(e) => setReferralForm(prev => ({ ...prev, city: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={referralForm.street}
                        onChange={(e) => setReferralForm(prev => ({ ...prev, street: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Street/Area"
                      />
                    </div>
                  </div>

                  {/* Referral Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Type *
                    </label>
                    <select
                      value={referralForm.referralType}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, referralType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Referral Type</option>
                      {referralTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reward Type and Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Type *
                      </label>
                      <select
                        value={referralForm.rewardType}
                        onChange={(e) => setReferralForm(prev => ({ ...prev, rewardType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="percentage">% of sale</option>
                        <option value="fixed">Flat cash per referral</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Value *
                      </label>
                      <div className="relative">
                        {referralForm.rewardType === 'fixed' && (
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                        <input
                          type="number"
                          min="1"
                          value={referralForm.rewardValue}
                          onChange={(e) => setReferralForm(prev => ({ ...prev, rewardValue: parseInt(e.target.value) || 1 }))}
                          className={`w-full ${referralForm.rewardType === 'fixed' ? 'pl-8' : 'pl-3'} pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder={referralForm.rewardType === 'percentage' ? '20' : '10'}
                        />
                        {referralForm.rewardType === 'percentage' && (
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={referralForm.businessName}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your business name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={referralForm.description}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describe what you're looking for in referrers and what your business offers..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={referralForm.category}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {referralCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {referralForm.coverImageUrl ? (
                        <div className="relative">
                          <img
                            src={referralForm.coverImageUrl}
                            alt="Cover"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => setReferralForm(prev => ({ ...prev, coverImageUrl: '', coverImage: null }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">
                              {uploading ? 'Uploading...' : 'Upload cover image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'cover', 'referral')
                              }}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">For detail pages (16:9 recommended)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {referralForm.thumbnailImageUrl ? (
                        <div className="relative">
                          <img
                            src={referralForm.thumbnailImageUrl}
                            alt="Thumbnail"
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => setReferralForm(prev => ({ ...prev, thumbnailImageUrl: '', thumbnailImage: null }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">
                              {uploading ? 'Uploading...' : 'Upload thumbnail'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'thumbnail', 'referral')
                              }}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">For card grids (16:9 recommended)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {referralForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag, 'referral')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.currentTarget.value, 'referral')
                          e.currentTarget.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirements (Optional)
                    </label>
                    <textarea
                      value={referralForm.requirements}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Any specific requirements for referrers..."
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      value={referralForm.urgency}
                      onChange={(e) => setReferralForm(prev => ({ ...prev, urgency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReferralJob}
                      disabled={loading || uploading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Publish Referral Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tool Form */}
            {activeTab === 'tool' && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 
                  className="text-xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Submit a Tool or Template
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Title *
                    </label>
                    <input
                      type="text"
                      value={toolForm.title}
                      onChange={(e) => setToolForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Business Plan Template"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={toolForm.description}
                      onChange={(e) => setToolForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      placeholder="Describe what this tool does and how it helps..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={toolForm.category}
                      onChange={(e) => setToolForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select Category</option>
                      {toolCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Who It's For */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who It's For *
                    </label>
                    <input
                      type="text"
                      value={toolForm.whoItsFor}
                      onChange={(e) => setToolForm(prev => ({ ...prev, whoItsFor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Small business owners, Entrepreneurs, Freelancers"
                    />
                  </div>

                  {/* Tool Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Type *
                    </label>
                    <input
                      type="text"
                      value={toolForm.toolType}
                      onChange={(e) => setToolForm(prev => ({ ...prev, toolType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Excel Template, PDF Guide, Online Tool"
                    />
                  </div>

                  {/* Type and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={toolForm.type}
                        onChange={(e) => setToolForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    {toolForm.type !== 'free' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            min="1"
                            value={toolForm.price}
                            onChange={(e) => setToolForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Download URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={toolForm.downloadUrl}
                      onChange={(e) => setToolForm(prev => ({ ...prev, downloadUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="https://example.com/download"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitTool}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Submit Tool</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
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

export default CreatePost