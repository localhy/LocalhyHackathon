import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Eye, Heart, MessageCircle, Share2, Filter, Search, MapPin, Bookmark, BookmarkCheck, DollarSign, Lock, Send, X, ExternalLink, Copy, Mail, Facebook, Twitter, Linkedin, ChevronDown, User, Tag, Building, Users, Clock, Crown, Zap, Target, Star, Edit, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserBusinessProfiles, userHasBusinessProfile, type BusinessProfile } from '../lib/database'
import { BASE_URL } from '../lib/config'

// Share modal component
const ShareModal = ({ business, isVisible, onClose }: { business: BusinessProfile | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!business || !isVisible) return null

  const shareUrl = `${BASE_URL}/dashboard/business/${business.id}`
  const shareText = `Check out ${business.business_name} on Localhy!`

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
            Share Business
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{business.business_name}</h4>
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

// Empty state component for My Business Page tab
const EmptyBusinessPage = ({ onCreateClick }: { onCreateClick: () => void }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building className="h-8 w-8 text-blue-500" />
      </div>
      <h3 
        className="text-xl font-semibold text-gray-900 mb-2"
        style={{ fontFamily: 'Montserrat' }}
      >
        You don't have a business page yet
      </h3>
      <p 
        className="text-gray-600 mb-6"
        style={{ fontFamily: 'Inter' }}
      >
        Create a business page to showcase your business, manage referrals, and connect with the community.
      </p>
      <button
        onClick={onCreateClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        style={{ fontFamily: 'Inter' }}
      >
        Create Business Page
      </button>
    </div>
  )
}

const BusinessPagesList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [myBusinesses, setMyBusinesses] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery);
  const [localLocationTerm, setLocalLocationTerm] = useState(selectedLocation);
  
  // Modal states
  const [shareBusiness, setShareBusiness] = useState<BusinessProfile | null>(null)
  
  // Infinite scroll
  const [page, setPage] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastBusinessElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreBusinesses()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Filter options
  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  useEffect(() => {
    if (activeTab === 'all') {
      loadBusinesses(true)
    } else if (activeTab === 'my-page' && user) {
      loadMyBusinesses()
    }
  }, [searchQuery, selectedCategory, selectedLocation, activeTab, user])

  const loadBusinesses = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setBusinesses([])
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const currentPage = reset ? 0 : page
      const limit = 12
      const offset = currentPage * limit
      
      // Fetch businesses from database
      let query = supabase
        .from('business_profiles')
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      // Apply filters
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }
      
      if (selectedLocation) {
        // Use ilike for location search across city, state, and country fields
        query = query.or(`city.ilike.%${selectedLocation}%,state.ilike.%${selectedLocation}%,country.ilike.%${selectedLocation}%`)
      }
      
      query = query.range(offset, offset + limit - 1)
      
      const { data, error: fetchError } = await query
      
      if (fetchError) {
        throw fetchError
      }
      
      let filteredBusinesses = data || []
      
      // Client-side search filtering
      if (searchQuery) {
        filteredBusinesses = filteredBusinesses.filter(business => 
          business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      const hasMoreItems = filteredBusinesses.length === limit
      
      if (reset) {
        setBusinesses(filteredBusinesses)
      } else {
        setBusinesses(prev => [...prev, ...filteredBusinesses])
      }
      
      setHasMore(hasMoreItems)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading businesses:', err)
      setError('Failed to load businesses. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMyBusinesses = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      const userBusinesses = await getUserBusinessProfiles(user.id)
      setMyBusinesses(userBusinesses)
    } catch (err) {
      console.error('Error loading user businesses:', err)
      setError('Failed to load your business pages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreBusinesses = () => {
    if (!loadingMore && hasMore && activeTab === 'all') {
      loadBusinesses(false)
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
        // Stay on current page
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

  const handleCreateBusinessPage = () => {
    navigate('/dashboard/create-business-page')
  }

  const handleViewBusiness = (business: BusinessProfile) => {
    navigate(`/dashboard/business/${business.id}`)
  }

  const handleShare = (business: BusinessProfile, event: React.MouseEvent) => {
    event.stopPropagation()
    setShareBusiness(business)
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
    setSelectedLocation('')
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedLocation
  ].filter(Boolean).length

  if (loading && businesses.length === 0 && myBusinesses.length === 0) {
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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Business Pages
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'all' ? 
                  `${businesses.length} businesses • ${activeFiltersCount > 0 ? `${activeFiltersCount} filters applied` : ''}` : 
                  'Manage your business page'}
              </p>
            </div>
            
            <button
              onClick={handleCreateBusinessPage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Business Page</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                All Businesses
              </button>
              <button
                onClick={() => setActiveTab('my-page')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my-page'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                My Business Page
              </button>
            </nav>
          </div>
        </div>

        {/* Enhanced Filters - Only show in All Businesses tab */}
        {activeTab === 'all' && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Search and main filter toggle */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    placeholder="Search businesses, categories, or keywords..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                    showFilters || activeFiltersCount > 0
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={localLocationTerm}
                        onChange={(e) => setLocalLocationTerm(e.target.value)}
                        placeholder="Enter any location..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <div className="md:col-span-2">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => activeTab === 'all' ? loadBusinesses(true) : loadMyBusinesses()}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {/* My Business Page Tab Content */}
            {activeTab === 'my-page' && (
              <div>
                {myBusinesses.length === 0 ? (
                  <EmptyBusinessPage onCreateClick={handleCreateBusinessPage} />
                ) : (
                  <div className="space-y-6">
                    {myBusinesses.map((business) => (
                      <div 
                        key={business.id}
                        className="bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden"
                      >
                        {/* Cover Image */}
                        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                          {business.cover_photo_url ? (
                            <img
                              src={business.cover_photo_url}
                              alt={business.business_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Building className="h-8 w-8 text-blue-600" />
                                </div>
                                <p className="text-blue-700 font-medium text-sm">
                                  {business.category}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Status badge */}
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                            business.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : business.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                          </div>
                          
                          {/* Business Logo - Positioned at bottom edge of cover */}
                          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden">
                            <img
                              src={business.thumbnail_url}
                              alt={business.business_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-12">
                          {/* Business Name */}
                          <h3 
                            className="text-xl font-bold text-gray-900 mb-2"
                            style={{ fontFamily: 'Montserrat' }}
                          >
                            {business.business_name}
                          </h3>
                          
                          {/* Location */}
                          {(business.city || business.state || business.country) && (
                            <div className="flex items-center space-x-1 mb-3 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {[business.city, business.state, business.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {/* Description - Max 3 lines */}
                          <p 
                            className="text-gray-600 text-sm line-clamp-3 mb-4"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {business.description}
                          </p>
                          
                          {/* Referral Reward */}
                          {business.enable_referrals && business.referral_reward_amount && (
                            <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm mb-4 flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>
                                Earn {business.referral_reward_type === 'percentage' 
                                  ? `${business.referral_reward_amount}%` 
                                  : `$${business.referral_reward_amount}`} 
                                per referral
                              </span>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => navigate(`/dashboard/business/${business.id}`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Page</span>
                            </button>
                            
                            <button
                              onClick={() => navigate(`/dashboard/business/edit/${business.id}`)}
                              className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit Page</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShare(business, e)
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Businesses Tab Content */}
            {activeTab === 'all' && (
              <>
                {businesses.length === 0 && !loading && !error ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 
                      className="text-xl font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      {searchQuery || selectedCategory || selectedLocation
                        ? 'No businesses match your filters' 
                        : 'No business pages yet'
                      }
                    </h3>
                    <p 
                      className="text-gray-600 mb-6"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {searchQuery || selectedCategory || selectedLocation
                        ? 'Try adjusting your search criteria or filters.'
                        : 'Be the first to create a business page and connect with the community!'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleCreateBusinessPage}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Create Your Business Page
                      </button>
                      {(searchQuery || selectedCategory || selectedLocation) && (
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
                      {businesses.map((business, index) => {
                        const isLastItem = index === businesses.length - 1
                        
                        return (
                          <div
                            key={business.id}
                            ref={isLastItem ? lastBusinessElementRef : null}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                            onClick={() => handleViewBusiness(business)}
                          >
                            {/* Cover Image */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                              {business.cover_photo_url ? (
                                <img
                                  src={business.cover_photo_url}
                                  alt={business.business_name}
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
                                      <Building className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <p className="text-blue-700 font-medium text-sm">
                                      {business.category}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Category badge - bottom left */}
                              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                {business.category}
                              </div>
                              
                              {/* Business Logo - Positioned at bottom edge of cover */}
                              <div className="absolute -bottom-10 left-4 w-20 h-20 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden">
                                <img
                                  src={business.thumbnail_url}
                                  alt={business.business_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-12">
                              {/* Business Name */}
                              <h3 
                                className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors"
                                style={{ fontFamily: 'Montserrat' }}
                              >
                                {business.business_name}
                              </h3>
                              
                              {/* Location */}
                              {(business.city || business.state || business.country) && (
                                <div className="flex items-center space-x-1 mb-3 text-sm text-gray-500">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {[business.city, business.state, business.country]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              {/* Description - Max 3 lines */}
                              <p 
                                className="text-gray-600 text-sm line-clamp-3 mb-4"
                                style={{ fontFamily: 'Inter' }}
                              >
                                {business.description}
                              </p>
                              
                              {/* Referral Reward */}
                              {business.enable_referrals && business.referral_reward_amount && (
                                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm mb-4 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span>
                                    Earn {business.referral_reward_type === 'percentage' 
                                      ? `${business.referral_reward_amount}%` 
                                      : `$${business.referral_reward_amount}`} 
                                    per referral
                                  </span>
                                </div>
                              )}
                              
                              {/* Contact Info */}
                              <div className="flex flex-wrap gap-3 mb-4">
                                {business.phone && (
                                  <a 
                                    href={`tel:${business.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>Call</span>
                                  </a>
                                )}
                                
                                {business.website && (
                                  <a 
                                    href={business.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                                  >
                                    <Globe className="h-3 w-3" />
                                    <span>Website</span>
                                  </a>
                                )}
                              </div>
                              
                              {/* Bottom row: Owner + Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  {business.user_profile?.avatar_url ? (
                                    <img
                                      src={business.user_profile.avatar_url}
                                      alt={business.user_profile.name || 'Owner'}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                      <User className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                  <span>{business.user_profile?.name || 'Business Owner'}</span>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => handleShare(business, e)}
                                    className="text-gray-500 hover:text-blue-600 transition-colors"
                                    title="Share"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </button>
                                  
                                  <button 
                                    className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewBusiness(business)
                                    }}
                                  >
                                    View
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {/* End of results indicator */}
                    {!hasMore && businesses.length > 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
                          You've seen all businesses! 🎉
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        business={shareBusiness} 
        isVisible={!!shareBusiness} 
        onClose={() => setShareBusiness(null)} 
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

export default BusinessPagesList