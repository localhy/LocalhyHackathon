import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, Save, X, Upload, MapPin, Mail, Phone, Globe, Clock, DollarSign, Percent, Camera, Plus, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { createBusinessProfile, uploadFile, type CreateBusinessProfileData } from '../lib/database'

const BusinessPageForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // File upload refs
  const thumbnailRef = useRef<HTMLInputElement>(null)
  const coverPhotoRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const certificationsRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState<CreateBusinessProfileData>({
    user_id: '',
    business_name: '',
    category: '',
    description: '',
    email: '',
    thumbnail_url: '',
    city: '',
    state: '',
    country: '',
    address: '',
    phone: '',
    website: '',
    cover_photo_url: '',
    gallery_urls: [],
    youtube_video_url: '',
    referral_reward_amount: 0,
    referral_reward_type: 'percentage',
    referral_cta_link: '',
    promo_tagline: '',
    years_in_business: 0,
    certifications_urls: [],
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    enable_referrals: true,
    display_earnings_publicly: false,
    enable_questions_comments: true,
    operating_hours: {}
  })

  // File upload states
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingCertifications, setUploadingCertifications] = useState(false)

  // Categories
  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  // Days of the week for operating hours
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Initialize operating hours
  useEffect(() => {
    const initialHours: Record<string, { open: string; close: string }> = {}
    daysOfWeek.forEach(day => {
      initialHours[day] = { open: '09:00', close: '17:00' }
    })
    
    setFormData(prev => ({
      ...prev,
      operating_hours: initialHours
    }))
  }, [])

  // Set user_id when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        user_id: user.id,
        email: user.email || ''
      }))
    }
  }, [user])

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
        navigate('/dashboard/create-new')
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
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value
        }
      }
    }))
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    setError('')

    try {
      const url = await uploadFile(file, 'business-thumbnails')
      if (url) {
        setFormData(prev => ({ ...prev, thumbnail_url: url }))
      }
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error)
      setError(error.message || 'Failed to upload thumbnail. Please try again.')
    } finally {
      setUploadingThumbnail(false)
      // Reset the input
      if (thumbnailRef.current) thumbnailRef.current.value = ''
    }
  }

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    try {
      const url = await uploadFile(file, 'business-covers')
      if (url) {
        setFormData(prev => ({ ...prev, cover_photo_url: url }))
      }
    } catch (error: any) {
      console.error('Error uploading cover photo:', error)
      setError(error.message || 'Failed to upload cover photo. Please try again.')
    } finally {
      setUploadingCover(false)
      // Reset the input
      if (coverPhotoRef.current) coverPhotoRef.current.value = ''
    }
  }

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingGallery(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file, 'business-gallery'))
      const urls = await Promise.all(uploadPromises)
      
      setFormData(prev => ({
        ...prev,
        gallery_urls: [...prev.gallery_urls, ...urls.filter(Boolean)]
      }))
    } catch (error: any) {
      console.error('Error uploading gallery images:', error)
      setError(error.message || 'Failed to upload gallery images. Please try again.')
    } finally {
      setUploadingGallery(false)
      // Reset the input
      if (galleryRef.current) galleryRef.current.value = ''
    }
  }

  const handleCertificationsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingCertifications(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file, 'business-certifications'))
      const urls = await Promise.all(uploadPromises)
      
      setFormData(prev => ({
        ...prev,
        certifications_urls: [...prev.certifications_urls, ...urls.filter(Boolean)]
      }))
    } catch (error: any) {
      console.error('Error uploading certifications:', error)
      setError(error.message || 'Failed to upload certifications. Please try again.')
    } finally {
      setUploadingCertifications(false)
      // Reset the input
      if (certificationsRef.current) certificationsRef.current.value = ''
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_, i) => i !== index)
    }))
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications_urls: prev.certifications_urls.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    // Required fields
    if (!formData.business_name.trim()) {
      setError('Business name is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.thumbnail_url) {
      setError('Business logo is required')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await createBusinessProfile(formData)
      
      if (result) {
        setSuccess('Business page created successfully!')
        setTimeout(() => {
          navigate(`/dashboard/business/${result.id}`)
        }, 2000)
      } else {
        throw new Error('Failed to create business page')
      }
    } catch (error: any) {
      console.error('Error creating business page:', error)
      setError(error.message || 'Failed to create business page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="business-pages"
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
              onClick={() => navigate('/dashboard/business-pages')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Create Business Page
              </h1>
              <p 
                className="text-gray-600 mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                Showcase your business and manage referrals
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
                    <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
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
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Sunshine Cafe"
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
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="business@example.com"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(123) 456-7890"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://yourbusiness.com"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="years_in_business"
                      value={formData.years_in_business}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5"
                      style={{ fontFamily: 'Inter' }}
                    />
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
                    placeholder="Describe your business, products, services, and what makes you unique..."
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Location
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., New York"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., NY"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., USA"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Full Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="e.g., 123 Main St, Suite 101, New York, NY 10001"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Operating Hours
                </h2>

                <div className="space-y-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24 font-medium text-gray-700">{day}</div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={formData.operating_hours[day]?.open || '09:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={formData.operating_hours[day]?.close || '17:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Media
                </h2>

                <div className="space-y-6">
                  {/* Business Logo */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Business Logo * (Square image recommended)
                    </label>
                    {formData.thumbnail_url ? (
                      <div className="flex items-center space-x-4">
                        <img
                          src={formData.thumbnail_url}
                          alt="Business logo"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Logo uploaded successfully</p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
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
                            {uploadingThumbnail ? 'Uploading...' : 'Upload business logo'}
                          </span>
                          <input
                            ref={thumbnailRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            disabled={uploadingThumbnail}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Cover Photo (16:9 ratio recommended)
                    </label>
                    {formData.cover_photo_url ? (
                      <div className="space-y-2">
                        <img
                          src={formData.cover_photo_url}
                          alt="Cover photo"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, cover_photo_url: '' }))}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove cover photo
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            {uploadingCover ? 'Uploading...' : 'Upload cover photo'}
                          </span>
                          <input
                            ref={coverPhotoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverPhotoUpload}
                            disabled={uploadingCover}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Gallery Images (Up to 10 images)
                    </label>
                    <div className="space-y-4">
                      {formData.gallery_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.gallery_urls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {formData.gallery_urls.length < 10 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">
                              {uploadingGallery ? 'Uploading...' : 'Add gallery images'}
                            </span>
                            <input
                              ref={galleryRef}
                              type="file"
                              accept="image/*"
                              onChange={handleGalleryUpload}
                              disabled={uploadingGallery || formData.gallery_urls.length >= 10}
                              multiple
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* YouTube Video */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      name="youtube_video_url"
                      value={formData.youtube_video_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://www.youtube.com/watch?v=abcdefghijk"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Certifications & Licenses
                    </label>
                    <div className="space-y-4">
                      {formData.certifications_urls.length > 0 && (
                        <div className="space-y-2">
                          {formData.certifications_urls.map((url, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-700">Certification {index + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCertification(index)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            {uploadingCertifications ? 'Uploading...' : 'Upload certifications'}
                          </span>
                          <input
                            ref={certificationsRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleCertificationsUpload}
                            disabled={uploadingCertifications}
                            multiple
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Program */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Referral Program
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable_referrals"
                      checked={formData.enable_referrals}
                      onChange={handleCheckboxChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Enable</span>
                  </label>
                </div>

                {formData.enable_referrals && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          className="block text-sm font-medium text-gray-700 mb-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Reward Amount
                        </label>
                        <div className="relative">
                          {formData.referral_reward_type === 'fixed' ? (
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          ) : (
                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          )}
                          <input
                            type="number"
                            name="referral_reward_amount"
                            value={formData.referral_reward_amount}
                            onChange={handleInputChange}
                            min="0"
                            step={formData.referral_reward_type === 'fixed' ? '0.01' : '1'}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={formData.referral_reward_type === 'fixed' ? '25.00' : '10'}
                            style={{ fontFamily: 'Inter' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium text-gray-700 mb-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Reward Type
                        </label>
                        <select
                          name="referral_reward_type"
                          value={formData.referral_reward_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{ fontFamily: 'Inter' }}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Promotional Tagline
                      </label>
                      <input
                        type="text"
                        name="promo_tagline"
                        value={formData.promo_tagline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Refer a friend and earn 10% commission!"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Call-to-Action Link
                      </label>
                      <input
                        type="url"
                        name="referral_cta_link"
                        value={formData.referral_cta_link}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., https://yourbusiness.com/referral"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="display_earnings_publicly"
                          checked={formData.display_earnings_publicly}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Inter' }}>
                          Display referral earnings publicly (helps attract referrers)
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Social Media
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://linkedin.com/company/yourbusiness"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://twitter.com/yourbusiness"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://facebook.com/yourbusiness"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://instagram.com/yourbusiness"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 
                  className="text-lg font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Additional Settings
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_questions_comments"
                      checked={formData.enable_questions_comments}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Inter' }}>
                      Enable questions and comments on your business page
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/business-pages')}
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
                      <span>Create Business Page</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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

export default BusinessPageForm