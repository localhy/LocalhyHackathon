import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Download, Star, ExternalLink, Search, Filter, Wrench, Crown, Zap, Target, ChevronDown, User, Tag, MapPin } from 'lucide-react'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'free' | 'paid' | 'premium'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Infinite scroll
  const [page, setPage] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastToolElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTools()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Filter options
  const categories = [
    'Template', 'Software', 'Course', 'Guide', 'Checklist', 'Calculator', 
    'Design Asset', 'Marketing Tool', 'Business Plan', 'Legal Document', 'Other'
  ]

  useEffect(() => {
    loadTools(true)
  }, [searchQuery, selectedCategory, selectedType, sortBy])

  const loadTools = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setTools([])
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const currentPage = reset ? 0 : page
      const limit = 12
      const offset = currentPage * limit
      
      // Fetch tools from database
      let fetchedTools = await getTools(limit + 1, offset)
      
      // Client-side filtering (in a real app, this would be done server-side)
      if (searchQuery) {
        fetchedTools = fetchedTools.filter(tool => 
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        )
      }
      
      if (selectedCategory) {
        fetchedTools = fetchedTools.filter(tool => tool.category === selectedCategory)
      }
      
      if (selectedType !== 'all') {
        fetchedTools = fetchedTools.filter(tool => tool.type === selectedType)
      }
      
      // Sort tools
      fetchedTools.sort((a, b) => {
        // First sort by promotion status
        if (a.is_promoted && !b.is_promoted) return -1
        if (!a.is_promoted && b.is_promoted) return 1
        
        // Then sort by the selected criteria
        switch (sortBy) {
          case 'popular':
            return b.downloads_count - a.downloads_count
          case 'rating':
            return b.rating - a.rating
          default: // newest
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
      
      const hasMoreItems = fetchedTools.length > limit
      if (hasMoreItems) {
        fetchedTools = fetchedTools.slice(0, limit)
      }
      
      if (reset) {
        setTools(fetchedTools)
      } else {
        setTools(prev => [...prev, ...fetchedTools])
      }
      
      setHasMore(hasMoreItems)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError('Failed to load tools. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTools = () => {
    if (!loadingMore && hasMore) {
      loadTools(false)
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
        // Stay on current page
        break
      case 'create-new':
        navigate('/dashboard/create-new?tab=tool')
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return date.toLocaleDateString()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedType('all')
    setSortBy('newest')
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedType !== 'all' ? selectedType : '',
    sortBy !== 'newest' ? sortBy : ''
  ].filter(Boolean).length

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

  if (loading && tools.length === 0) {
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
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Starter Tools
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {tools.length} tools • {activeFiltersCount > 0 && `${activeFiltersCount} filters applied`}
              </p>
            </div>
            
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

        {/* Enhanced Filters */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Search and main filter toggle */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools, templates, and resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'all' | 'free' | 'paid' | 'premium')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'rating')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Downloaded</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => loadTools(true)}
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
                  {searchQuery || selectedCategory || selectedType !== 'all'
                    ? 'No tools match your filters' 
                    : 'No tools yet'
                  }
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  {searchQuery || selectedCategory || selectedType !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to submit a useful tool or template for the community!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleSubmitTool}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Submit Your First Tool
                  </button>
                  {(searchQuery || selectedCategory || selectedType !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool, index) => {
                    const isLastItem = index === tools.length - 1
                    
                    return (
                      <div
                        key={tool.id}
                        ref={isLastItem ? lastToolElementRef : null}
                        className={`bg-white rounded-xl p-6 shadow-sm border ${getPromotionStyling(tool)} hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden group`}
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
                          className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors"
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
                        
                        {/* Location */}
                        {tool.location && (
                          <div className="flex items-center space-x-1 mb-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {tool.location}
                            </span>
                          </div>
                        )}
                        
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
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded flex items-center space-x-1"
                            >
                              <Tag className="h-3 w-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                        
                        {/* Author and timestamp */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            {tool.user_profiles?.avatar_url ? (
                              <img
                                src={tool.user_profiles.avatar_url}
                                alt={tool.user_profiles.name || 'User'}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <span>by {tool.user_profiles?.name || 'Anonymous'}</span>
                          </div>
                          <span>{formatTimeAgo(tool.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {tool.price > 0 && (
                              <span className="text-green-600 font-bold text-sm">${tool.price}</span>
                            )}
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <button 
                            className="bg-purple-500 text-white hover:bg-purple-600 font-medium text-sm px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewTool(tool)
                            }}
                          >
                            {tool.price > 0 ? `Buy $${tool.price}` : 'Download'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && tools.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
                      You've seen all tools! 🎉
                    </p>
                  </div>
                )}
              </>
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