import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, X, Upload, DollarSign, Check, AlertCircle, Loader, Building, Globe, MapPin, Clock, Users, Star } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getReferralJobById, updateReferralJob, uploadFile, type ReferralJob, type UpdateReferralJobData } from '../lib/database'

const EditReferralJobDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [job, setJob] = useState<ReferralJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit states for each section
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    title: '',
    businessName: '',
    category: '',
    description: '',
    commission: 0,
    commissionType: 'percentage' as 'percentage' | 'fixed',
    location: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    requirements: '',
    referralType: '',
    website: '',
    ctaText: '',
    terms: ''
  })
  
  // File upload
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Invalid job ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedJob = await getReferralJobById(id)
        if (fetchedJob) {
          // Check if user owns this job
          if (fetchedJob.user_id !== user?.id) {
            setError('You can only edit your own referral jobs')
            setLoading(false)
            return
          }
          
          setJob(fetchedJob)
          // Pre-populate edit data with existing content
          setEditData({
            title: fetchedJob.title,
            businessName: fetchedJob.business_name,
            category: fetchedJob.category,
            description: fetchedJob.description,
            commission: fetchedJob.commission,
            commissionType: fetchedJob.commission_type,
            location: fetchedJob.location,
            urgency: fetchedJob.urgency,
            requirements: fetchedJob.requirements || '',
            referralType: fetchedJob.referral_type || '',
            website: fetchedJob.website || '',
            ctaText: fetchedJob.cta_text || '',
            terms: fetchedJob.terms || ''
          })
        } else {
          setError('Referral job not found')
        }
      } catch (err) {
        console.error('Error loading job:', err)
        setError('Failed to load referral job. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id, user])

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

  const startEditing = (section: string) => {
    setEditingSection(section)
    setError('')
    setSuccess('')
  }

  const cancelEditing = () => {
    setEditingSection(null)
    // Reset edit data to original values
    if (job) {
      setEditData({
        title: job.title,
        businessName: job.business_name,
        category: job.category,
        description: job.description,
        commission: job.commission,
        commissionType: job.commission_type,
        location: job.location,
        urgency: job.urgency,
        requirements: job.requirements || '',
        referralType: job.referral_type || '',
        website: job.website || '',
        ctaText: job.cta_text || '',
        terms: job.terms || ''
      })
    }
  }

  const saveSection = async (section: string) => {
    if (!job || !user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let updates: UpdateReferralJobData = {}

      switch (section) {
        case 'title':
          updates.title = editData.title
          break
        case 'business':
          updates.business_name = editData.businessName
          break
        case 'category':
          updates.category = editData.category
          break
        case 'description':
          updates.description = editData.description
          break
        case 'commission':
          updates.commission = editData.commission
          updates.commission_type = editData.commissionType
          break
        case 'location':
          updates.location = editData.location
          break
        case 'urgency':
          updates.urgency = editData.urgency
          break
        case 'requirements':
          updates.requirements = editData.requirements
          break
        case 'details':
          updates.referral_type = editData.referralType
          updates.website = editData.website
          updates.cta_text = editData.ctaText
          break
        case 'terms':
          updates.terms = editData.terms
          break
      }

      const updatedJob = await updateReferralJob(job.id, updates)
      
      if (updatedJob) {
        setJob(updatedJob)
        setEditingSection(null)
        setSuccess('Changes saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update referral job')
      }
    } catch (error: any) {
      console.error('Error saving section:', error)
      setError(error.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !job) return

    setUploadingLogo(true)
    setError('')
    setSuccess('')

    try {
      const logoUrl = await uploadFile(file, 'business-logos')
      
      if (logoUrl) {
        const updatedJob = await updateReferralJob(job.id, { logo_url: logoUrl })
        
        if (updatedJob) {
          setJob(updatedJob)
          setSuccess('Logo updated successfully!')
          setTimeout(() => setSuccess(''), 3000)
        }
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      setError(error.message || 'Failed to upload logo. Please try again.')
    } finally {
      setUploadingLogo(false)
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  const referralTypes = [
    'Product Purchase', 'Service Booking', 'Store Visit', 'App Download', 'Event Attendance',
    'Subscription Sign-up', 'Lead Generation', 'Consultation Booking', 'Other'
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="my-posts"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="my-posts"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error}
              </h2>
              <button
                onClick={() => navigate('/dashboard/my-posts')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to My Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="my-posts"
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Hero Section */}
        <div className="relative">
          {/* Header Background */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/my-posts')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Commission badge */}
            <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold">
              {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
            </div>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              {/* Category */}
              <div className="mb-2">
                {editingSection === 'category' ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                      className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-3 py-1 text-sm"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="text-gray-900">
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => saveSection('category')}
                      disabled={saving}
                      className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600"
                    >
                      {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                      {job.urgency} Priority
                    </span>
                    <button
                      onClick={() => startEditing('category')}
                      className="bg-white/20 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Title */}
              {editingSection === 'title' ? (
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-3xl md:text-4xl font-bold flex-1"
                    style={{ fontFamily: 'Montserrat' }}
                  />
                  <button
                    onClick={() => saveSection('title')}
                    disabled={saving}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                  >
                    {saving ? <Loader className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="group relative">
                  <h1 
                    className="text-3xl md:text-4xl font-bold text-white mb-2 cursor-pointer hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors"
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => startEditing('title')}
                  >
                    {job.title}
                  </h1>
                  <button
                    onClick={() => startEditing('title')}
                    className="absolute top-2 right-2 bg-white/20 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Business Name */}
              {editingSection === 'business' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editData.businessName}
                    onChange={(e) => setEditData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-xl font-medium flex-1"
                    style={{ fontFamily: 'Inter' }}
                  />
                  <button
                    onClick={() => saveSection('business')}
                    disabled={saving}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                  >
                    {saving ? <Loader className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="group relative">
                  <p 
                    className="text-xl text-blue-100 font-medium cursor-pointer hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors"
                    style={{ fontFamily: 'Inter' }}
                    onClick={() => startEditing('business')}
                  >
                    {job.business_name}
                  </p>
                  <button
                    onClick={() => startEditing('business')}
                    className="absolute top-2 right-2 bg-white/20 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <Check className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{success}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'description' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Job Description
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('description')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Describe the referral job in detail..."
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Job Description
                        </h2>
                        <button
                          onClick={() => startEditing('description')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="prose prose-gray max-w-none cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        style={{ fontFamily: 'Inter' }}
                        onClick={() => startEditing('description')}
                      >
                        {job.description.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'requirements' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Requirements
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('requirements')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editData.requirements}
                        onChange={(e) => setEditData(prev => ({ ...prev, requirements: e.target.value }))}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="List the requirements for this referral job..."
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Requirements
                        </h2>
                        <button
                          onClick={() => startEditing('requirements')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        style={{ fontFamily: 'Inter' }}
                        onClick={() => startEditing('requirements')}
                      >
                        {job.requirements ? (
                          job.requirements.split('\n').map((requirement, index) => (
                            <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                              • {requirement}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Click to add requirements...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'terms' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Terms & Conditions
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('terms')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editData.terms}
                        onChange={(e) => setEditData(prev => ({ ...prev, terms: e.target.value }))}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Add terms and conditions for this referral job..."
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Terms & Conditions
                        </h2>
                        <button
                          onClick={() => startEditing('terms')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        style={{ fontFamily: 'Inter' }}
                        onClick={() => startEditing('terms')}
                      >
                        {job.terms ? (
                          job.terms.split('\n').map((term, index) => (
                            <p key={index} className="mb-2 text-gray-700 leading-relaxed text-sm">
                              {term}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Click to add terms and conditions...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Logo Management */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Business Logo
                  </h3>
                  <div className="space-y-4">
                    {job.logo_url ? (
                      <div className="relative">
                        <img
                          src={job.logo_url}
                          alt="Business Logo"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => logoRef.current?.click()}
                          disabled={uploadingLogo}
                          className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          {uploadingLogo ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Edit3 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <button
                          onClick={() => logoRef.current?.click()}
                          disabled={uploadingLogo}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">For business branding</p>
                      </div>
                    )}
                    
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Commission & Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  {editingSection === 'commission' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Commission
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('commission')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
                          <select
                            value={editData.commissionType}
                            onChange={(e) => setEditData(prev => ({ ...prev, commissionType: e.target.value as 'percentage' | 'fixed' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Commission {editData.commissionType === 'percentage' ? '(%)' : '($)'}
                          </label>
                          <div className="relative">
                            {editData.commissionType === 'fixed' && (
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            )}
                            <input
                              type="number"
                              min="0"
                              max={editData.commissionType === 'percentage' ? "100" : undefined}
                              value={editData.commission}
                              onChange={(e) => setEditData(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                              className={`w-full ${editData.commissionType === 'fixed' ? 'pl-8' : ''} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {editData.commissionType === 'percentage' && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Commission
                        </h3>
                        <button
                          onClick={() => startEditing('commission')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('commission')}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600 text-xl">
                            {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                          </span>
                          <span className="text-sm text-gray-500">
                            {job.commission_type === 'percentage' ? 'of sale' : 'per referral'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Urgency */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  {editingSection === 'location' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Location & Urgency
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('location')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={editData.location}
                            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                          <select
                            value={editData.urgency}
                            onChange={(e) => setEditData(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Location & Urgency
                        </h3>
                        <button
                          onClick={() => startEditing('location')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="space-y-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('location')}
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                            {job.urgency} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  {editingSection === 'details' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Additional Details
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('details')}
                            disabled={saving}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Referral Type</label>
                          <select
                            value={editData.referralType}
                            onChange={(e) => setEditData(prev => ({ ...prev, referralType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select type</option>
                            {referralTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Website/Social Media</label>
                          <input
                            type="url"
                            value={editData.website}
                            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Call-to-Action Text</label>
                          <input
                            type="text"
                            value={editData.ctaText}
                            onChange={(e) => setEditData(prev => ({ ...prev, ctaText: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Apply Now"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Additional Details
                        </h3>
                        <button
                          onClick={() => startEditing('details')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="space-y-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('details')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Type</span>
                          <span className="text-sm font-medium">{job.referral_type || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Website</span>
                          <span className="text-sm font-medium">{job.website ? 'Added' : 'Not added'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">CTA Text</span>
                          <span className="text-sm font-medium">{job.cta_text || 'Apply Now'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Applicants</span>
                      <span className="font-semibold text-gray-900">{job.applicants_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="font-semibold text-blue-600">{job.status}</span>
                    </div>
                  </div>
                </div>
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

export default EditReferralJobDetail