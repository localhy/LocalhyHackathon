import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Save, X, Check, AlertCircle, Loader, MapPin, DollarSign, Building, Globe, FileText } from 'lucide-react'
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
    business_name: '',
    description: '',
    commission: 0,
    commission_type: 'percentage' as 'percentage' | 'fixed',
    location: '',
    category: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    requirements: '',
    referral_type: '',
    website: '',
    cta_text: '',
    terms: ''
  })
  
  // File upload
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
            business_name: fetchedJob.business_name,
            description: fetchedJob.description,
            commission: fetchedJob.commission,
            commission_type: fetchedJob.commission_type,
            location: fetchedJob.location,
            category: fetchedJob.category,
            urgency: fetchedJob.urgency,
            requirements: fetchedJob.requirements || '',
            referral_type: fetchedJob.referral_type || '',
            website: fetchedJob.website || '',
            cta_text: fetchedJob.cta_text || '',
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
        business_name: job.business_name,
        description: job.description,
        commission: job.commission,
        commission_type: job.commission_type,
        location: job.location,
        category: job.category,
        urgency: job.urgency,
        requirements: job.requirements || '',
        referral_type: job.referral_type || '',
        website: job.website || '',
        cta_text: job.cta_text || '',
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
        case 'business_name':
          updates.business_name = editData.business_name
          break
        case 'description':
          updates.description = editData.description
          break
        case 'commission':
          updates.commission = editData.commission
          updates.commission_type = editData.commission_type
          break
        case 'location':
          updates.location = editData.location
          break
        case 'category':
          updates.category = editData.category
          break
        case 'urgency':
          updates.urgency = editData.urgency
          break
        case 'requirements':
          updates.requirements = editData.requirements
          break
        case 'referral_type':
          updates.referral_type = editData.referral_type
          break
        case 'website':
          updates.website = editData.website
          break
        case 'cta_text':
          updates.cta_text = editData.cta_text
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
      // Reset the input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

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
                {error || 'Referral job not found'}
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

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/my-posts')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Edit Referral Job
              </h1>
              <p 
                className="text-gray-600 mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                Update your referral job details
              </p>
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

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 
                      className="text-xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Basic Information
                    </h2>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      {editingSection === 'title' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('title')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('title')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'title' ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{job.title}</p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Business Name</label>
                      {editingSection === 'business_name' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('business_name')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('business_name')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'business_name' ? (
                      <input
                        type="text"
                        value={editData.business_name}
                        onChange={(e) => setEditData({ ...editData, business_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{job.business_name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      {editingSection === 'category' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('category')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('category')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'category' ? (
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{job.category}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      {editingSection === 'location' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('location')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('location')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'location' ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter location"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-gray-900">{job.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      {editingSection === 'description' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('description')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('description')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'description' ? (
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {job.description.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Commission & Urgency */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 
                      className="text-xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Commission & Priority
                    </h2>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Commission</label>
                      {editingSection === 'commission' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('commission')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('commission')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'commission' ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={editData.commission}
                            onChange={(e) => setEditData({ ...editData, commission: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <select
                          value={editData.commission_type}
                          onChange={(e) => setEditData({ ...editData, commission_type: e.target.value as 'percentage' | 'fixed' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                        <p className="text-gray-900 font-medium">
                          {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Urgency</label>
                      {editingSection === 'urgency' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('urgency')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('urgency')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'urgency' ? (
                      <select
                        value={editData.urgency}
                        onChange={(e) => setEditData({ ...editData, urgency: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        job.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        job.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 
                      className="text-xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Additional Details
                    </h2>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Requirements</label>
                      {editingSection === 'requirements' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('requirements')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('requirements')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'requirements' ? (
                      <textarea
                        value={editData.requirements}
                        onChange={(e) => setEditData({ ...editData, requirements: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Any specific requirements for referrers..."
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {job.requirements ? (
                          job.requirements.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-2 text-gray-700">
                              {paragraph}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No requirements specified</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Referral Type */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Referral Type</label>
                      {editingSection === 'referral_type' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('referral_type')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('referral_type')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'referral_type' ? (
                      <input
                        type="text"
                        value={editData.referral_type}
                        onChange={(e) => setEditData({ ...editData, referral_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Customer referral, Lead generation"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {job.referral_type || <span className="text-gray-500 italic">Not specified</span>}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      {editingSection === 'website' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('website')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('website')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'website' ? (
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={editData.website}
                          onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {job.website ? (
                          <>
                            <Globe className="h-4 w-4 text-gray-500 mr-2" />
                            <a 
                              href={job.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {job.website}
                            </a>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">No website specified</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Text */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Call-to-Action Text</label>
                      {editingSection === 'cta_text' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('cta_text')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('cta_text')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'cta_text' ? (
                      <input
                        type="text"
                        value={editData.cta_text}
                        onChange={(e) => setEditData({ ...editData, cta_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Apply Now, Get Started"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {job.cta_text || <span className="text-gray-500 italic">Default: "Apply Now"</span>}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Terms & Conditions</label>
                      {editingSection === 'terms' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('terms')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing('terms')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingSection === 'terms' ? (
                      <textarea
                        value={editData.terms}
                        onChange={(e) => setEditData({ ...editData, terms: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Any terms and conditions for this referral job..."
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {job.terms ? (
                          job.terms.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-2 text-gray-700">
                              {paragraph}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No terms specified</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Logo Management */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Business Logo
                  </h3>
                  <div className="space-y-4">
                    {job.logo_url ? (
                      <div className="relative">
                        <img
                          src={job.logo_url}
                          alt="Business Logo"
                          className="w-full h-32 object-contain rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          {uploadingLogo ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Edit className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">For branding (1:1 recommended)</p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Applicants</span>
                      <span className="font-semibold text-gray-900">{job.applicants_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">{job.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/dashboard/referral-jobs/${job.id}`)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      View Public Page
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/my-posts')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
                    >
                      Back to My Posts
                    </button>
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