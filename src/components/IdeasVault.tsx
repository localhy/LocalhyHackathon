import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Eye, Heart, MessageCircle, Share2, Filter, Search, MapPin, Bookmark, BookmarkCheck, DollarSign, Lock, Send, X, ExternalLink, Copy, Mail, Facebook, Twitter, Linkedin, ChevronDown, User, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getIdeas, likeIdea, bookmarkIdea, type Idea } from '../lib/database'

// Mobile long press preview component
const IdeaPreview = ({ idea, isVisible, onClose }: { idea: Idea | null, isVisible: boolean, onClose: () => void }) => {
  if (!idea || !isVisible) return null

  const extractProblemSolution = (idea: Idea) => {
    return {
      problem: idea.problem_summary || idea.description.substring(0, 120) + '...',
      solution: idea.solution_overview || idea.description.substring(120, 240) + '...'
    }
  }

  const { problem, solution } = extractProblemSolution(idea)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Preview Header */}
        <div className="relative h-32 bg-gradient-to-br from-green-100 to-green-200">
          {idea.thumbnail_url ? (
            <img src={idea.thumbnail_url} alt={idea.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/90 p-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          {idea.price > 0 && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ${idea.price}
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat' }}>
            {idea.title}
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-600">💬 Problem:</span>
              <p className="text-gray-700 mt-1">{problem}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">💡 Solution:</span>
              <p className="text-gray-700 mt-1">{solution}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{idea.views}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{idea.likes}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Read Full
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Share modal component
const ShareModal = ({ idea, isVisible, onClose }: { idea: Idea | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!idea || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/ideas/${idea.id}`
  const shareText = `Check out this business idea: ${idea.title}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: copyToClipboard,
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`),
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`),
      color: 'bg-blue-700 hover:bg-blue-800'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Share Idea
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className={`${option.color} text-white p-3 rounded-lg flex items-center space-x-2 transition-colors`}
            >
              <option.icon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const IdeasVault = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [previewIdea, setPreviewIdea] = useState<Idea | null>(null)
  const [shareIdea, setShareIdea] = useState<Idea | null>(null)
  
  // Long press handling
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  
  // Infinite scroll
  const [page, setPage] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastIdeaElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreIdeas()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Filter options
  const categories = [
    'Food & Beverage', 'Technology', 'Fashion', 'Health & Wellness', 'Education',
    'Real Estate', 'Transportation', 'Entertainment', 'Professional Services', 'Retail', 'Other'
  ]

  // Location options - cities and states for better UX
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
    'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
    'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
    'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
    'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
    'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA'
  ].sort()

  useEffect(() => {
    loadIdeas(true)
  }, [searchQuery, selectedCategory, selectedLocation, priceFilter, sortBy])

  const loadIdeas = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setIdeas([])
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const currentPage = reset ? 0 : page
      const limit = 12
      const offset = currentPage * limit
      
      // Apply filters and search
      let fetchedIdeas = await getIdeas(limit + 1, offset, user?.id) // Fetch one extra to check if there are more
      
      // Client-side filtering (in a real app, this would be done server-side)
      if (searchQuery) {
        fetchedIdeas = fetchedIdeas.filter(idea => 
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        )
      }
      
      if (selectedCategory) {
        fetchedIdeas = fetchedIdeas.filter(idea => idea.category === selectedCategory)
      }

      if (selectedLocation) {
        fetchedIdeas = fetchedIdeas.filter(idea => 
          idea.location && idea.location.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      }
      
      if (priceFilter !== 'all') {
        fetchedIdeas = fetchedIdeas.filter(idea => 
          priceFilter === 'free' ? idea.price === 0 : idea.price > 0
        )
      }
      
      // Sort ideas
      fetchedIdeas.sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return (b.likes + b.views) - (a.likes + a.views)
          case 'trending':
            // Simple trending algorithm based on recent engagement
            const aScore = (b.likes * 2 + b.views) / Math.max(1, Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)))
            const bScore = (a.likes * 2 + a.views) / Math.max(1, Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)))
            return bScore - aScore
          default: // newest
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
      
      const hasMoreItems = fetchedIdeas.length > limit
      if (hasMoreItems) {
        fetchedIdeas = fetchedIdeas.slice(0, limit)
      }
      
      if (reset) {
        setIdeas(fetchedIdeas)
      } else {
        setIdeas(prev => [...prev, ...fetchedIdeas])
      }
      
      setHasMore(hasMoreItems)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading ideas:', err)
      setError('Failed to load ideas. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreIdeas = () => {
    if (!loadingMore && hasMore) {
      loadIdeas(false)
    }
  }

  const handleNavigation = (page: string) => {
    setSidebarOpen(false)
    
    switch(page) {
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'ideas-vault':
        // Stay on current page
        break
      case 'referral-jobs':
        navigate('/dashboard/referral-jobs')
        break
      case 'starter-tools':
        navigate('/dashboard/starter-tools')
        break
      case 'create-new':
        navigate('/dashboard/create-new?tab=idea')
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

  const handleCreateIdea = () => {
    navigate('/dashboard/create-new?tab=idea')
  }

  const handleViewIdea = (idea: Idea) => {
    if (isLongPress) {
      setIsLongPress(false)
      return
    }
    navigate(`/dashboard/ideas/${idea.id}`)
  }

  // Long press handlers
  const handleTouchStart = (idea: Idea) => {
    const timer = setTimeout(() => {
      setIsLongPress(true)
      setPreviewIdea(idea)
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleBookmark = async (ideaId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!user) return

    try {
      const success = await bookmarkIdea(ideaId, user.id)
      if (success) {
        // Update local state
        setIdeas(prev => prev.map(idea => 
          idea.id === ideaId 
            ? { ...idea, bookmarked_by_user: !idea.bookmarked_by_user }
            : idea
        ))
      }
    } catch (error) {
      console.error('Error bookmarking idea:', error)
    }
  }

  const handleQuickLike = async (ideaId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!user) return

    try {
      const success = await likeIdea(ideaId, user.id)
      if (success) {
        // Update local state
        setIdeas(prev => prev.map(idea => 
          idea.id === ideaId 
            ? { 
                ...idea, 
                liked_by_user: !idea.liked_by_user,
                likes: idea.liked_by_user ? idea.likes - 1 : idea.likes + 1
              }
            : idea
        ))
      }
    } catch (error) {
      console.error('Error liking idea:', error)
    }
  }

  const handleShare = (idea: Idea, event: React.MouseEvent) => {
    event.stopPropagation()
    setShareIdea(idea)
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

  // Extract problem and solution previews from description
  const extractProblemSolution = (idea: Idea) => {
    return {
      problem: idea.problem_summary || idea.description.substring(0, 120) + '...',
      solution: idea.solution_overview || idea.description.substring(120, 240) + '...'
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedLocation('')
    setPriceFilter('all')
    setSortBy('newest')
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedLocation,
    priceFilter !== 'all' ? priceFilter : '',
    sortBy !== 'newest' ? sortBy : ''
  ].filter(Boolean).length

  if (loading && ideas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="ideas-vault"
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
                    <div key={i} className="bg-white rounded-xl overflow-hidden">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
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
        currentPage="ideas-vault"
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
                Ideas Vault
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {ideas.length} ideas • {activeFiltersCount > 0 && `${activeFiltersCount} filters applied`}
              </p>
            </div>
            
            <button
              onClick={handleCreateIdea}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Post Idea</span>
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
                  placeholder="Search ideas, tags, or keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? 'border-green-500 bg-green-50 text-green-700'
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4  bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Ideas</option>
                    <option value="free">Free Ideas</option>
                    <option value="paid">Paid Ideas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'trending')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
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
                <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => loadIdeas(true)}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {ideas.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {searchQuery || selectedCategory || selectedLocation || priceFilter !== 'all' 
                    ? 'No ideas match your filters' 
                    : 'No ideas yet'
                  }
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  {searchQuery || selectedCategory || selectedLocation || priceFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to share a local business idea and start earning!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleCreateIdea}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Post Your First Idea
                  </button>
                  {(searchQuery || selectedCategory || selectedLocation || priceFilter !== 'all') && (
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
                  {ideas.map((idea, index) => {
                    const { problem, solution } = extractProblemSolution(idea)
                    const isBookmarked = idea.bookmarked_by_user
                    const isLiked = idea.liked_by_user
                    const isLastItem = index === ideas.length - 1
                    
                    return (
                      <div
                        key={idea.id}
                        ref={isLastItem ? lastIdeaElementRef : null}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                        onClick={() => handleViewIdea(idea)}
                        onTouchStart={() => handleTouchStart(idea)}
                        onTouchEnd={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                      >
                        {/* Thumbnail Image - 16:9 ratio */}
                        <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                          {idea.thumbnail_url ? (
                            <img
                              src={idea.thumbnail_url}
                              alt={idea.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Eye className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-green-700 font-medium text-sm">
                                  {idea.category}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Bookmark Icon - Top right */}
                          <button
                            onClick={(e) => handleBookmark(idea.id, e)}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                          
                          {/* Price overlay - if monetized */}
                          {idea.price > 0 && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                              <Lock className="h-3 w-3" />
                              <span>${idea.price}</span>
                            </div>
                          )}
                          
                          {/* Category badge - bottom left */}
                          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            {idea.category}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Title - 1 line max, bold, clickable */}
                          <h3 
                            className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-green-600 transition-colors"
                            style={{ fontFamily: 'Montserrat' }}
                          >
                            {idea.title}
                          </h3>
                          
                          {/* Location badge */}
                          {idea.location && (
                            <div className="flex items-center space-x-1 mb-3">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {idea.location}
                              </span>
                            </div>
                          )}
                          
                          {/* Problem (short) - Max 2 lines */}
                          <div className="mb-3">
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">💬 Problem</span>
                            </div>
                            <p 
                              className="text-gray-700 text-sm line-clamp-2"
                              style={{ fontFamily: 'Inter' }}
                            >
                              {problem}
                            </p>
                          </div>
                          
                          {/* Solution (short) - Max 2 lines */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">💡 Solution</span>
                            </div>
                            <p 
                              className="text-gray-600 text-sm line-clamp-2"
                              style={{ fontFamily: 'Inter' }}
                            >
                              {solution}
                            </p>
                          </div>
                          
                          {/* Tags - Up to 3 pills */}
                          {idea.tags && idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {idea.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1"
                                >
                                  <Tag className="h-3 w-3" />
                                  <span>#{tag}</span>
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Author and timestamp */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-2">
                              {idea.user_profiles?.avatar_url ? (
                                <img
                                  src={idea.user_profiles.avatar_url}
                                  alt={idea.user_profiles.name || 'User'}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {(idea.user_profiles?.name || 'U')[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span>{idea.user_profiles?.name || 'Anonymous'}</span>
                            </div>
                            <span>{formatTimeAgo(idea.created_at)}</span>
                          </div>
                          
                          {/* Bottom row: Engagement metrics + Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {/* Like count with quick like */}
                              <button
                                onClick={(e) => handleQuickLike(idea.id, e)}
                                className={`flex items-center space-x-1 transition-colors ${
                                  isLiked ? 'text-red-500' : 'hover:text-red-500'
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{idea.likes}</span>
                              </button>
                              
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{idea.views}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>Comment</span>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => handleShare(idea, e)}
                                className="text-gray-500 hover:text-green-600 transition-colors"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              
                              {/* Read More button */}
                              <button 
                                className={`flex items-center space-x-1 font-medium text-sm px-3 py-1 rounded-full transition-all ${
                                  idea.price > 0 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewIdea(idea)
                                }}
                              >
                                {idea.price > 0 ? (
                                  <>
                                    <Lock className="h-3 w-3" />
                                    <span>${idea.price}</span>
                                  </>
                                ) : (
                                  <span>Read More</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && ideas.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
                      You've seen all ideas! 🎉
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IdeaPreview 
        idea={previewIdea} 
        isVisible={!!previewIdea} 
        onClose={() => setPreviewIdea(null)} 
      />
      
      <ShareModal 
        idea={shareIdea} 
        isVisible={!!shareIdea} 
        onClose={() => setShareIdea(null)} 
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

export default IdeasVault