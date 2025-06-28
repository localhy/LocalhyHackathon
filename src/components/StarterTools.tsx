import React, { useState, useEffect } from 'react'
import { Plus, Download, Star, ExternalLink, Search, Filter, Wrench, Crown, Zap, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getTools, incrementPromotionClicks, getActivePromotionForContent, type Tool } from '../lib/database'

const StarterTools = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      setError('')
      const fetchedTools = await getTools(20, 0) // Get up to 20 tools
      setTools(fetchedTools)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError('Failed to load tools. Please try again.')
    } finally {
      setLoading(false)
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
        // Stay on current page
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

  const handleSubmitTool = () => {
    navigate('/dashboard/create-new?tab=tool')
  }

  const handleViewTool = async (tool: Tool) => {
    // Track promotion click if this is promoted content
    if (tool.is_promoted) {
      try {
        const promotion = await getActivePromotionForContent(tool.id, 'tool')
        if (promotion) {
          await incrementPromotionClicks(promotion.id)
        }
      } catch (error) {
        console.error('Error tracking promotion click:', error)
      }
    }

    // For now, just log the action since we don't have a tool detail page yet
    console.log('View/Download tool:', tool.id)
    
    // If the tool has a download URL, open it
    if (tool.download_url) {
      window.open(tool.download_url, '_blank')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get promotion badge and styling
  const getPromotionBadge = (tool: Tool) => {
    if (!tool.is_promoted) return null

    // For now, we'll show a generic "Featured" badge
    // In the future, you could fetch the specific promotion type and show different badges
    return (
      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
        <Crown className="h-3 w-3" />
        <span>Featured</span>
      </div>
    )
  }

  const getPromotionStyling = (tool: Tool) => {
    if (!tool.is_promoted) return 'border-gray-200'
    
    // Enhanced styling for promoted content
    return 'border-yellow-400 ring-2 ring-yellow-100 shadow-lg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="starter-tools"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
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
        currentPage="starter-tools"
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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Starter Tools
            </h1>
            
            <button
              onClick={handleSubmitTool}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Submit Tool</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools and templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ fontFamily: 'Inter' }}
              />
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Filter</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={loadTools}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {tools.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-purple-500" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  No tools yet
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  Be the first to submit a useful tool or template for the community!
                </p>
                <button
                  onClick={handleSubmitTool}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                  style={{ fontFamily: 'Inter' }}
                >
                  Submit Your First Tool
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border ${getPromotionStyling(tool)} hover:shadow-lg transition-all duration-200 cursor-pointer relative`}
                    onClick={() => handleViewTool(tool)}
                  >
                    {/* Promotion badge */}
                    {getPromotionBadge(tool)}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(tool.type)}`}>
                          {tool.type}
                        </span>
                      </div>
                      {tool.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      {tool.title}
                    </h3>
                    
                    <p 
                      className="text-gray-600 text-sm mb-4 line-clamp-3"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{tool.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{tool.downloads_count}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags && tool.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        by {tool.user_profiles?.name || 'Anonymous'}
                      </span>
                      <div className="flex items-center space-x-2">
                        {tool.price > 0 && (
                          <span className="text-green-600 font-bold text-sm">${tool.price}</span>
                        )}
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
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

export default StarterTools