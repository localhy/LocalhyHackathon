import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, X, Upload, Tag, DollarSign, Check, AlertCircle, Loader, Download, Star } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getToolById, updateTool, type Tool } from '../lib/database'

const EditToolDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit states for each section
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    description: '',
    type: 'free' as 'free' | 'paid' | 'premium',
    price: 0,
    download_url: '',
    tags: [] as string[]
  })

  useEffect(() => {
    const loadTool = async () => {
      if (!id) {
        setError('Invalid tool ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedTool = await getToolById(id)
        if (fetchedTool) {
          // Check if user owns this tool
          if (fetchedTool.user_id !== user?.id) {
            setError('You can only edit your own tools')
            setLoading(false)
            return
          }
          
          setTool(fetchedTool)
          // Pre-populate edit data with existing content
          setEditData({
            title: fetchedTool.title,
            category: fetchedTool.category,
            description: fetchedTool.description,
            type: fetchedTool.type,
            price: fetchedTool.price,
            download_url: fetchedTool.download_url || '',
            tags: fetchedTool.tags || []
          })
        } else {
          setError('Tool not found')
        }
      } catch (err) {
        console.error('Error loading tool:', err)
        setError('Failed to load tool. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadTool()
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
    if (tool) {
      setEditData({
        title: tool.title,
        category: tool.category,
        description: tool.description,
        type: tool.type,
        price: tool.price,
        download_url: tool.download_url || '',
        tags: tool.tags || []
      })
    }
  }

  const saveSection = async (section: string) => {
    if (!tool || !user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let updates: Partial<Tool> = {}

      switch (section) {
        case 'title':
          updates.title = editData.title
          break
        case 'category':
          updates.category = editData.category
          break
        case 'description':
          updates.description = editData.description
          break
        case 'pricing':
          updates.type = editData.type
          updates.price = editData.type === 'free' ? 0 : editData.price
          break
        case 'download':
          updates.download_url = editData.download_url
          break
        case 'tags':
          updates.tags = editData.tags
          break
      }

      const updatedTool = await updateTool(tool.id, updates)
      
      if (updatedTool) {
        setTool(updatedTool)
        setEditingSection(null)
        setSuccess('Changes saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update tool')
      }
    } catch (error: any) {
      console.error('Error saving section:', error)
      setError(error.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
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

  const toolCategories = [
    'Template', 'Software', 'Course', 'Guide', 'Checklist', 'Calculator', 
    'Design Asset', 'Marketing Tool', 'Business Plan', 'Legal Document', 'Other'
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !tool) {
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
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to My Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tool) return null

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
          <div className="h-64 md:h-80 bg-gradient-to-br from-purple-100 to-purple-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/my-posts')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Price badge */}
            {tool.price > 0 && (
              <div className="absolute top-6 right-6 bg-purple-500 text-white px-4 py-2 rounded-full font-bold">
                ${tool.price}
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
                      {toolCategories.map(category => (
                        <option key={category} value={category} className="text-gray-900">
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => saveSection('category')}
                      disabled={saving}
                      className="bg-purple-500 text-white p-1 rounded-full hover:bg-purple-600"
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
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {tool.category}
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
                    className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600"
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
                    {tool.title}
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
                {/* Tool Description */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'description' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Description
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('description')}
                            disabled={saving}
                            className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 flex items-center space-x-1"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder="Provide detailed information about your tool..."
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Description
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
                        {tool.description.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Download URL */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'download' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Download URL
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('download')}
                            disabled={saving}
                            className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 flex items-center space-x-1"
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
                      <div className="relative">
                        <Download className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={editData.download_url}
                          onChange={(e) => setEditData(prev => ({ ...prev, download_url: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="https://example.com/download-link"
                          style={{ fontFamily: 'Inter' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Link to where users can download your tool (Google Drive, Dropbox, etc.)
                      </p>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Download URL
                        </h2>
                        <button
                          onClick={() => startEditing('download')}
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => startEditing('download')}
                      >
                        {tool.download_url ? (
                          <div className="flex items-center space-x-2">
                            <Download className="h-5 w-5 text-purple-500" />
                            <a 
                              href={tool.download_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 break-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tool.download_url}
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-500">No download URL provided. Click to add one.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {editingSection === 'tags' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Tags
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('tags')}
                            disabled={saving}
                            className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 flex items-center space-x-1"
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
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-purple-600 hover:text-purple-800"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        {tool.tags && tool.tags.length > 0 ? (
                          tool.tags.map((tag, index) => (
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
                {/* Pricing */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  {editingSection === 'pricing' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          Pricing
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection('pricing')}
                            disabled={saving}
                            className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 flex items-center space-x-1"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                            Type
                          </label>
                          <select
                            value={editData.type}
                            onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as 'free' | 'paid' | 'premium' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            style={{ fontFamily: 'Inter' }}
                          >
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                        
                        {editData.type !== 'free' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                              Price ($)
                            </label>
                            <div className="relative w-32">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={editData.price}
                                onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tool.type === 'free' ? 'bg-green-100 text-green-800' :
                            tool.type === 'paid' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {tool.type.charAt(0).toUpperCase() + tool.type.slice(1)}
                          </span>
                        </div>
                        
                        {tool.price > 0 && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold text-purple-600">${tool.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      <span className="text-sm text-gray-600">Downloads</span>
                      <span className="font-semibold text-gray-900">{tool.downloads_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900">{tool.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">{tool.status}</span>
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

export default EditToolDetail