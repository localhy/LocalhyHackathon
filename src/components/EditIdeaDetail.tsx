import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, X, Upload, Tag, DollarSign, Check, AlertCircle, Loader } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getIdeaById, updateIdea, uploadFile, type Idea, type UpdateIdeaData } from '../lib/database'

const EditIdeaDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit states for each section
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    problemSummary: '',
    solutionOverview: '',
    description: '',
    price: 0,
    monetize: false,
    tags: [] as string[]
  })
  
  // File upload
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const thumbnailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadIdea = async () => {
      if (!id) {
        setError('Invalid idea ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedIdea = await getIdeaById(id)
        if (fetchedIdea) {
          // Check if user owns this idea
          if (fetchedIdea.user_id !== user?.id) {
            setError('You can only edit your own ideas')
            setLoading(false)
            return
          }
          
          setIdea(fetchedIdea)
          // Pre-populate edit data with existing content
          setEditData({
            title: fetchedIdea.title,
            category: fetchedIdea.category,
            problemSummary: fetchedIdea.problem_summary || '',
            solutionOverview: fetchedIdea.solution_overview || '',
            description: fetchedIdea.description,
            price: fetchedIdea.price,
            monetize: fetchedIdea.price > 0,
            tags: fetchedIdea.tags || []
          })
        } else {
          setError('Idea not found')
        }
      } catch (err) {
        console.error('Error loading idea:', err)
        setError('Failed to load idea. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadIdea()
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

  const startEditing = (section: string) => {
    setEditingSection(section)
    setError('')
    setSuccess('')
  }

  const cancelEditing = () => {
    setEditingSection(null)
    // Reset edit data to original values
    if (idea) {
      setEditData({
        title: idea.title,
        category: idea.category,
        problemSummary: idea.problem_summary || '',
        solutionOverview: idea.solution_overview || '',
        description: idea.description,
        price: idea.price,
        monetize: idea.price > 0,
        tags: idea.tags || []
      })
    }
  }

  const saveSection = async (section: string) => {
    if (!idea || !user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let updates: UpdateIdeaData = {}

      switch (section) {
        case 'title':
          updates.title = editData.title
          break
        case 'category':
          updates.category = editData.category
          break
        case 'problem':
          updates.problem_summary = editData.problemSummary
          break
        case 'solution':
          updates.solution_overview = editData.solutionOverview
          break
        case 'description':
          updates.description = editData.description
          break
        case 'pricing':
          updates.price = editData.monetize ? editData.price : 0
          break
        case 'tags':
          updates.tags = editData.tags
          break
      }

      const updatedIdea = await updateIdea(idea.id, updates)
      
      if (updatedIdea) {
        setIdea(updatedIdea)
        setEditingSection(null)
        setSuccess('Changes saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update idea')
      }
    } catch (error: any) {
      console.error('Error saving section:', error)
      setError(error.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'thumbnail') => {
    const file = event.target.files?.[0]
    if (!file || !idea) return

    if (type === 'cover') {
      setUploadingImage(true)
    } else {
      setUploadingThumbnail(true)
    }
    setError('')
    setSuccess('')

    try {
      const bucket = type === 'cover' ? 'idea-covers' : 'idea-thumbnails'
      const imageUrl = await uploadFile(file, bucket)
      
      if (imageUrl) {
        const updates = type === 'cover' 
          ? { cover_image_url: imageUrl }
          : { thumbnail_url: imageUrl }
        
        const updatedIdea = await updateIdea(idea.id, updates)
        
        if (updatedIdea) {
          setIdea(updatedIdea)
          setSuccess(`${type === 'cover' ? 'Cover image' : 'Thumbnail'} updated successfully!`)
          setTimeout(() => setSuccess(''), 3000)
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      if (type === 'cover') {
        setUploadingImage(false)
        if (coverImageRef.current) coverImageRef.current.value = ''
      } else {
        setUploadingThumbnail(false)
        if (thumbnailRef.current) thumbnailRef.current.value = ''
      }
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !editData.tags.includes(tag.trim())) {
      setEditData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const categories = [
    'Food & Beverage', 'Technology', 'Fashion', 'Health & Wellness', 'Education', 
    'Real Estate', 'Transportation', 'Entertainment', 'Professional Services', 'Retail', 'Other'
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !idea) {
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
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to My Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!idea) return null

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
          {/* Cover Image */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden group">
            {idea.cover_image_url ? (
              <img
                src={idea.cover_image_url}
                alt={idea.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium text-lg">
                    Click to add cover image
                  </p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/my-posts')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Edit cover image button */}
            <button
              onClick={() => coverImageRef.current?.click()}
              disabled={uploadingImage}
              className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
            >
              {uploadingImage ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </button>
            
            <input
              ref={coverImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
              className="hidden"
            />
            
            {/* Price badge */}
            {idea.price > 0 && (
              <div className="absolute bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                ${idea.price}
              </div>
            )}
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
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {idea.category}
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
                <div className="flex items-center space-x-2 mb-4">
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
                    className="text-3xl md:text-4xl font-bold text-white mb-4 cursor-pointer hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors"
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => startEditing('title')}
                  >
                    {idea.title}
                  </h1>
                  <button
                    onClick={() => startEditing('title')}
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
                {/* Problem Summary */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'problem' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          The Problem
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('problem')}
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
                        value={editData.problemSummary}
                        onChange={(e) => setEditData(prev => ({ ...prev, problemSummary: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="What problem does this idea solve?"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          The Problem
                        </h2>
                        <button
                          onClick={() => startEditing('problem')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <p 
                        className="text-gray-700 leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        style={{ fontFamily: 'Inter' }}
                        onClick={() => startEditing('problem')}
                      >
                        {idea.problem_summary || 'Click to add problem summary...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Solution Overview */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'solution' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          The Solution
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('solution')}
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
                        value={editData.solutionOverview}
                        onChange={(e) => setEditData(prev => ({ ...prev, solutionOverview: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="How would this idea work?"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          The Solution
                        </h2>
                        <button
                          onClick={() => startEditing('solution')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <p 
                        className="text-gray-700 leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        style={{ fontFamily: 'Inter' }}
                        onClick={() => startEditing('solution')}
                      >
                        {idea.solution_overview || 'Click to add solution overview...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'description' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Detailed Overview
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="Provide detailed information about your business idea..."
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Detailed Overview
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
                        {idea.description.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'tags' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Tags
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('tags')}
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        {editData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
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
                            addTag(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Tags
                        </h3>
                        <button
                          onClick={() => startEditing('tags')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="flex flex-wrap gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('tags')}
                      >
                        {idea.tags && idea.tags.length > 0 ? (
                          idea.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                            >
                              <Tag className="h-3 w-3" />
                              <span>{tag}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">Click to add tags...</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Thumbnail Management */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Thumbnail Image
                  </h3>
                  <div className="space-y-4">
                    {idea.thumbnail_url ? (
                      <div className="relative">
                        <img
                          src={idea.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => thumbnailRef.current?.click()}
                          disabled={uploadingThumbnail}
                          className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          {uploadingThumbnail ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Edit3 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <button
                          onClick={() => thumbnailRef.current?.click()}
                          disabled={uploadingThumbnail}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {uploadingThumbnail ? 'Uploading...' : 'Upload thumbnail'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">For card grids (16:9 recommended)</p>
                      </div>
                    )}
                    
                    <input
                      ref={thumbnailRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'thumbnail')}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  {editingSection === 'pricing' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900\" style={{ fontFamily: 'Montserrat' }}>
                          Pricing
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('pricing')}
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
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="monetize-edit"
                            checked={editData.monetize}
                            onChange={(e) => setEditData(prev => ({ ...prev, monetize: e.target.checked }))}
                            className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="monetize-edit" className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter' }}>
                            Charge readers to view full idea?
                          </label>
                        </div>
                        
                        {editData.monetize && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                              Price ($1 - $10)
                            </label>
                            <div className="relative w-32">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={editData.price}
                                onChange={(e) => setEditData(prev => ({ ...prev, price: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                style={{ fontFamily: 'Inter' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Pricing
                        </h3>
                        <button
                          onClick={() => startEditing('pricing')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('pricing')}
                      >
                        {idea.price > 0 ? (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-600">${idea.price}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Free to view</span>
                        )}
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
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="font-semibold text-gray-900">{idea.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="font-semibold text-gray-900">{idea.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">{idea.status}</span>
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

export default EditIdeaDetail