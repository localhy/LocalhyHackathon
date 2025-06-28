import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Building, 
  MapPin, 
  Tag, 
  DollarSign, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Calendar, 
  FileText, 
  Youtube, 
  Image, 
  MessageCircle, 
  Loader, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react'
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
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  // Form state
  const [formData, setFormData] = useState<Partial<CreateBusinessProfileData>>({
    business_name: '',
    category: '',
    city: '',
    state: '',
    country: '',
    description: '',
    address: '',
    operating_hours: {},
    thumbnail_url: '',
    cover_photo_url: '',
    gallery_urls: [],
    youtube_video_url: '',
    referral_reward_amount: 0,
    referral_reward_type: 'percentage',
    referral_cta_link: '',
    promo_tagline: '',
    email: user?.email || '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    years_in_business: 0,
    certifications_urls: [],
    customer_reviews: [],
    enable_referrals: true,
    display_earnings_publicly: false,
    enable_questions_comments: true,
    status: 'pending'
  })

  // File upload states
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingCertification, setUploadingCertification] = useState(false)

  // Categories for dropdown
  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  // Days of week for operating hours
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  useEffect(() => {
    // Pre-populate email from user if available
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }))
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
    
    // Handle numeric inputs
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
    setFormData(prev => {
      const currentHours = prev.operating_hours || {}
      const dayHours = currentHours[day] || { open: '', close: '' }
      
      return {
        ...prev,
        operating_hours: {
          ...currentHours,
          [day]: {
            ...dayHours,
            [field]: value
          }
        }
      }
    })
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    setError('')

    try {
      const imageUrl = await uploadFile(file, 'business-page-media')
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnail_url: imageUrl }))
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

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    try {
      const imageUrl = await uploadFile(file, 'business-page-media')
      if (imageUrl) {
        setFormData(prev => ({ ...prev, cover_photo_url: imageUrl }))
      }
    } catch (error: any) {
      console.error('Error uploading cover photo:', error)
      setError(error.message || 'Failed to upload cover photo. Please try again.')
    } finally {
      setUploadingCover(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingGallery(true)
    setError('')

    try {
      const currentGallery = formData.gallery_urls || []
      
      // Check if adding these files would exceed the limit
      if (currentGallery.length + files.length > 5) {
        setError('You can only upload a maximum of 5 gallery images.')
        setUploadingGallery(false)
        event.target.value = ''
        return
      }

      const uploadPromises = Array.from(files).map(file => 
        uploadFile(file, 'business-page-media')
      )

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter(url => url !== null) as string[]

      setFormData(prev => ({
        ...prev,
        gallery_urls: [...(prev.gallery_urls || []), ...validUrls]
      }))
    } catch (error: any) {
      console.error('Error uploading gallery images:', error)
      setError(error.message || 'Failed to upload gallery images. Please try again.')
    } finally {
      setUploadingGallery(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleCertificationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingCertification(true)
    setError('')

    try {
      const currentCertifications = formData.certifications_urls || []
      
      // Check if adding these files would exceed the limit
      if (currentCertifications.length + files.length > 3) {
        setError('You can only upload a maximum of 3 certification files.')
        setUploadingCertification(false)
        event.target.value = ''
        return
      }

      const uploadPromises = Array.from(files).map(file => 
        uploadFile(file, 'business-page-media')
      )

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter(url => url !== null) as string[]

      setFormData(prev => ({
        ...prev,
        certifications_urls: [...(prev.certifications_urls || []), ...validUrls]
      }))
    } catch (error: any) {
      console.error('Error uploading certification files:', error)
      setError(error.message || 'Failed to upload certification files. Please try again.')
    } finally {
      setUploadingCertification(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const updatedGallery = [...(prev.gallery_urls || [])]
      updatedGallery.splice(index, 1)
      return { ...prev, gallery_urls: updatedGallery }
    })
  }

  const removeCertification = (index: number) => {
    setFormData(prev => {
      const updatedCertifications = [...(prev.certifications_urls || [])]
      updatedCertifications.splice(index, 1)
      return { ...prev, certifications_urls: updatedCertifications }
    })
  }

  const handleAddReview = () => {
    setFormData(prev => {
      const currentReviews = prev.customer_reviews || []
      return {
        ...prev,
        customer_reviews: [
          ...currentReviews,
          { name: '', rating: 5, text: '', date: new Date().toISOString() }
        ]
      }
    })
  }

  const handleReviewChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedReviews = [...(prev.customer_reviews || [])]
      updatedReviews[index] = {
        ...updatedReviews[index],
        [field]: value
      }
      return { ...prev, customer_reviews: updatedReviews }
    })
  }

  const removeReview = (index: number) => {
    setFormData(prev => {
      const updatedReviews = [...(prev.customer_reviews || [])]
      updatedReviews.splice(index, 1)
      return { ...prev, customer_reviews: updatedReviews }
    })
  }

  const validateStep = (step: number): boolean => {
    setError('')
    
    switch (step) {
      case 1: // Business Info
        if (!formData.business_name?.trim()) {
          setError('Business name is required')
          return false
        }
        if (!formData.category) {
          setError('Category is required')
          return false
        }
        if (!formData.description?.trim()) {
          setError('Description is required')
          return false
        }
        return true
        
      case 2: // Brand Media
        if (!formData.thumbnail_url) {
          setError('Thumbnail image is required')
          return false
        }
        return true
        
      case 3: // Offers & Promotions
        // This section is optional
        return true
        
      case 4: // Contact & Socials
        if (!formData.email?.trim()) {
          setError('Email address is required')
          return false
        }
        return true
        
      case 5: // Trust & Credibility
        // This section is optional
        return true
        
      case 6: // Business Settings
        // This section has default values
        return true
        
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create a business page')
      return
    }

    // Validate final step if not saving as draft
    if (!saveAsDraft && !validateStep(currentStep)) {
      return
    }

    // Validate required fields regardless of draft status
    if (!formData.business_name?.trim()) {
      setError('Business name is required')
      return
    }
    if (!formData.category) {
      setError('Category is required')
      return
    }
    if (!formData.description?.trim()) {
      setError('Description is required')
      return
    }
    if (!formData.thumbnail_url) {
      setError('Thumbnail image is required')
      return
    }
    if (!formData.email?.trim()) {
      setError('Email address is required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const businessProfileData: CreateBusinessProfileData = {
        user_id: user.id,
        business_name: formData.business_name!,
        category: formData.category!,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        description: formData.description!,
        address: formData.address,
        operating_hours: formData.operating_hours,
        thumbnail_url: formData.thumbnail_url!,
        cover_photo_url: formData.cover_photo_url,
        gallery_urls: formData.gallery_urls,
        youtube_video_url: formData.youtube_video_url,
        referral_reward_amount: formData.referral_reward_amount,
        referral_reward_type: formData.referral_reward_type as 'percentage' | 'fixed',
        referral_cta_link: formData.referral_cta_link,
        promo_tagline: formData.promo_tagline,
        email: formData.email!,
        phone: formData.phone,
        website: formData.website,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        facebook: formData.facebook,
        instagram: formData.instagram,
        years_in_business: formData.years_in_business,
        certifications_urls: formData.certifications_urls,
        customer_reviews: formData.customer_reviews,
        enable_referrals: formData.enable_referrals,
        display_earnings_publicly: formData.display_earnings_publicly,
        enable_questions_comments: formData.enable_questions_comments,
        status: saveAsDraft ? 'pending' : 'active'
      }

      const result = await createBusinessProfile(businessProfileData)

      if (result) {
        setSuccess(saveAsDraft 
          ? 'Business page saved as draft successfully!' 
          : 'Business page published successfully!'
        )
        
        // Redirect after a short delay
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Business Information
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
                  placeholder="e.g., Mario's Italian Restaurant"
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
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

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
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., NY"
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
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Business Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe your business, products, services, and what makes you unique..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Full Address (Optional)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="e.g., 123 Main St, Suite 101, New York, NY 10001"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Operating Hours (Optional)
              </label>
              <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-medium">{day}</div>
                    <div>
                      <input
                        type="time"
                        value={(formData.operating_hours?.[day]?.open || '')}
                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="mx-2">to</span>
                      <input
                        type="time"
                        value={(formData.operating_hours?.[day]?.close || '')}
                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Brand Media
            </h2>

            {/* Thumbnail Image (Required) */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Thumbnail Image * (1:1 ratio recommended)
              </label>
              {formData.thumbnail_url ? (
                <div className="relative w-32 h-32 mb-2">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      {uploadingThumbnail ? 'Uploading...' : 'Upload thumbnail image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB (Square image recommended)</p>
                </div>
              )}
            </div>

            {/* Cover Photo (Optional) */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Cover Photo (Optional, 16:9 ratio recommended)
              </label>
              {formData.cover_photo_url ? (
                <div className="relative w-full h-48 mb-2">
                  <img
                    src={formData.cover_photo_url}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cover_photo_url: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      {uploadingCover ? 'Uploading...' : 'Upload cover photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB (16:9 ratio recommended)</p>
                </div>
              )}
            </div>

            {/* Gallery Images (Optional) */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Gallery Images (Optional, max 5)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {formData.gallery_urls?.map((url, index) => (
                  <div key={index} className="relative h-24">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(formData.gallery_urls?.length || 0) < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-24 flex flex-col items-center justify-center">
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        {uploadingGallery ? 'Uploading...' : 'Add'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                        className="hidden"
                        multiple
                      />
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {(formData.gallery_urls?.length || 0)}/5 images uploaded
              </p>
            </div>

            {/* YouTube Video (Optional) */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                YouTube Video URL (Optional)
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      name="youtube_video_url"
                      value={formData.youtube_video_url}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>
              {formData.youtube_video_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={formData.youtube_video_url.replace('watch?v=', 'embed/')}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Offers & Promotions
            </h2>

            {/* Referral Reward */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Referral Reward
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="referral_reward_amount"
                    value={formData.referral_reward_amount}
                    onChange={handleInputChange}
                    min="0"
                    step={formData.referral_reward_type === 'percentage' ? '1' : '0.01'}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
                <select
                  name="referral_reward_type"
                  value={formData.referral_reward_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                How much will you pay for successful referrals?
              </p>
            </div>

            {/* Referral CTA Link */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Referral CTA Link (Optional)
              </label>
              <input
                type="url"
                name="referral_cta_link"
                value={formData.referral_cta_link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-booking-link.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Where should referrers send potential customers?
              </p>
            </div>

            {/* Promo Tagline */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Promotional Tagline (Optional)
              </label>
              <input
                type="text"
                name="promo_tagline"
                value={formData.promo_tagline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10% off for local customers"
              />
              <p className="text-sm text-gray-500 mt-1">
                A short promotional message to attract customers
              </p>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Contact & Social Media
            </h2>

            {/* Email */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Email Address *
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
                  placeholder="contact@yourbusiness.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Website */}
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
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  LinkedIn (Optional)
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.linkedin.com/company/..."
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Twitter (Optional)
                </label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Facebook (Optional)
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.facebook.com/..."
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Instagram (Optional)
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.instagram.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Trust & Credibility
            </h2>

            {/* Years in Business */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Years in Business
              </label>
              <div className="relative w-32">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="years_in_business"
                  value={formData.years_in_business}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter' }}
              >
                Certifications (Optional, max 3)
              </label>
              <div className="space-y-2 mb-4">
                {formData.certifications_urls?.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Certification {index + 1}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {(formData.certifications_urls?.length || 0) < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      {uploadingCertification ? 'Uploading...' : 'Upload certification'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleCertificationUpload}
                      disabled={uploadingCertification}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Inter' }}
                >
                  Customer Reviews (Optional, max 3)
                </label>
                {(formData.customer_reviews?.length || 0) < 3 && (
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Review
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {formData.customer_reviews?.map((review, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Review {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeReview(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={review.name}
                          onChange={(e) => handleReviewChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
                        <select
                          value={review.rating}
                          onChange={(e) => handleReviewChange(index, 'rating', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Review Text</label>
                        <textarea
                          value={review.text}
                          onChange={(e) => handleReviewChange(index, 'text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Write the customer's review here..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(formData.customer_reviews?.length || 0) === 0 && (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No reviews added yet</p>
                    <button
                      type="button"
                      onClick={handleAddReview}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Your First Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Business Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable_referrals"
                  name="enable_referrals"
                  checked={formData.enable_referrals}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="enable_referrals" 
                  className="ml-2 block text-sm text-gray-900"
                  style={{ fontFamily: 'Inter' }}
                >
                  Enable Referrals for This Business
                </label>
              </div>
              <p className="text-sm text-gray-500 pl-6">
                Allow users to refer customers to your business and earn commissions
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="display_earnings_publicly"
                  name="display_earnings_publicly"
                  checked={formData.display_earnings_publicly}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="display_earnings_publicly" 
                  className="ml-2 block text-sm text-gray-900"
                  style={{ fontFamily: 'Inter' }}
                >
                  Display Referral Earnings Publicly
                </label>
              </div>
              <p className="text-sm text-gray-500 pl-6">
                Show how much referrers have earned from your business (encourages more referrals)
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable_questions_comments"
                  name="enable_questions_comments"
                  checked={formData.enable_questions_comments}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="enable_questions_comments" 
                  className="ml-2 block text-sm text-gray-900"
                  style={{ fontFamily: 'Inter' }}
                >
                  Enable Questions/Comments Section
                </label>
              </div>
              <p className="text-sm text-gray-500 pl-6">
                Allow users to ask questions and leave comments on your business page
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-800 font-medium mb-2">Ready to publish?</h3>
              <p className="text-blue-700 text-sm">
                Your business page will be visible to all Localhy users once published. You can also save it as a draft to complete later.
              </p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="profile"
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
                Create Your Business Page
              </h1>
              <p 
                className="text-gray-600 mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                Share your business with the local community and start getting referrals
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Error/Success Messages */}
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

            {/* Form */}
            <form onSubmit={(e) => handleSubmit(e, false)}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  {currentStep === totalSteps ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Save as Draft
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center space-x-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {loading ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Publish Profile</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Next
                    </button>
                  )}
                </div>
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