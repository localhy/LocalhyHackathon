import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, MapPin, DollarSign, Clock, Users, Search, Filter, ChevronDown, User, Building, AlertCircle, Calendar, Share2, ExternalLink, Copy, Mail, Facebook, Twitter, Linkedin, X, Send, Check, Loader, Globe, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getReferralJobs, createMessage, type ReferralJob } from '../lib/database'

// Share modal component
const ShareModal = ({ job, isVisible, onClose }: { job: ReferralJob | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!job || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/referral-jobs/${job.id}`
  const shareText = `Check out this referral opportunity: ${job.title} at ${job.business_name}`

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
            Share Referral Job
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{job.business_name}</p>
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

// Contact modal component
const ContactModal = ({ job, isVisible, onClose }: { job: ReferralJob | null, isVisible: boolean, onClose: () => void }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!job || !isVisible) return null

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    setSending(true)
    setError('')
    
    try {
      const result = await createMessage({
        sender_id: user.id,
        recipient_id: job.user_id,
        content: message,
        subject: `Interest in referral job: ${job.title}`
      })

      if (result) {
        setSuccess(true)
        setMessage('')
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)
      setError(error.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Apply for Referral Job
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Application Sent!</h4>
            <p className="text-gray-600">Your application has been sent to the business owner.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                {job.logo_url ? (
                  <img
                    src={job.logo_url}
                    alt={job.business_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{job.business_name}</h4>
                  <p className="text-sm text-gray-500">{job.title}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">
                  Commission: {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                </p>
                {job.referral_type && (
                  <p className="text-blue-700 text-xs mt-1">
                    Type: {job.referral_type}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Application Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Hi! I'm interested in this referral opportunity and would like to learn more..."
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Application</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const ReferralJobs = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [jobs, setJobs] = useState<ReferralJob[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [commissionTypeFilter, setCommissionTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'commission' | 'urgent'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [shareJob, setShareJob] = useState<ReferralJob | null>(null)
  const [contactJob, setContactJob] = useState<ReferralJob | null>(null)
  
  // Infinite scroll
  const [page, setPage] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastJobElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreJobs()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Filter options
  const categories = [
    'Restaurant', 'Retail', 'Professional Services', 'Health & Wellness', 'Technology',
    'Real Estate', 'Education', 'Entertainment', 'Transportation', 'Home Services', 'Other'
  ]

  // Location options
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
    'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD'
  ].sort()

  useEffect(() => {
    loadJobs(true)
  }, [searchQuery, selectedCategory, selectedLocation, commissionTypeFilter, urgencyFilter, sortBy])

  const loadJobs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setJobs([])
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const currentPage = reset ? 0 : page
      const limit = 12
      const offset = currentPage * limit
      
      // Fetch jobs from database
      let fetchedJobs = await getReferralJobs(limit + 1, offset)
      
      // Client-side filtering (in a real app, this would be done server-side)
      if (searchQuery) {
        fetchedJobs = fetchedJobs.filter(job => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      if (selectedCategory) {
        fetchedJobs = fetchedJobs.filter(job => job.category === selectedCategory)
      }

      if (selectedLocation) {
        fetchedJobs = fetchedJobs.filter(job => 
          job.location && job.location.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      }
      
      if (commissionTypeFilter !== 'all') {
        fetchedJobs = fetchedJobs.filter(job => job.commission_type === commissionTypeFilter)
      }

      if (urgencyFilter !== 'all') {
        fetchedJobs = fetchedJobs.filter(job => job.urgency === urgencyFilter)
      }
      
      // Sort jobs
      fetchedJobs.sort((a, b) => {
        switch (sortBy) {
          case 'commission':
            return b.commission - a.commission
          case 'urgent':
            const urgencyOrder = { high: 3, medium: 2, low: 1 }
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
          default: // newest
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
      
      const hasMoreItems = fetchedJobs.length > limit
      if (hasMoreItems) {
        fetchedJobs = fetchedJobs.slice(0, limit)
      }
      
      if (reset) {
        setJobs(fetchedJobs)
      } else {
        setJobs(prev => [...prev, ...fetchedJobs])
      }
      
      setHasMore(hasMoreItems)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading jobs:', err)
      setError('Failed to load referral jobs. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreJobs = () => {
    if (!loadingMore && hasMore) {
      loadJobs(false)
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
        // Stay on current page
        break
      case 'starter-tools':
        navigate('/dashboard/starter-tools')
        break
      case 'create-new':
        navigate('/dashboard/create-new?tab=referral')
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

  const handleCreateJob = () => {
    navigate('/dashboard/create-new?tab=referral')
  }

  const handleViewJob = (job: ReferralJob) => {
    navigate(`/dashboard/referral-jobs/${job.id}`)
  }

  const handleApplyJob = (job: ReferralJob, event: React.MouseEvent) => {
    event.stopPropagation()
    setContactJob(job)
  }

  const handleShare = (job: ReferralJob, event: React.MouseEvent) => {
    event.stopPropagation()
    setShareJob(job)
  }

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
    setCommissionTypeFilter('all')
    setUrgencyFilter('all')
    setSortBy('newest')
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedLocation,
    commissionTypeFilter !== 'all' ? commissionTypeFilter : '',
    urgencyFilter !== 'all' ? urgencyFilter : '',
    sortBy !== 'newest' ? sortBy : ''
  ].filter(Boolean).length

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="referral-jobs"
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
        currentPage="referral-jobs"
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
                Referral Jobs
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {jobs.length} jobs • {activeFiltersCount > 0 && `${activeFiltersCount} filters applied`}
              </p>
            </div>
            
            <button
              onClick={handleCreateJob}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Job</span>
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
                  placeholder="Search jobs, businesses, or keywords..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
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
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
                  <select
                    value={commissionTypeFilter}
                    onChange={(e) => setCommissionTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Urgency</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'commission' | 'urgent')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="commission">Highest Commission</option>
                    <option value="urgent">Most Urgent</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="md:col-span-2 lg:col-span-5">
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

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => loadJobs(true)}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {jobs.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {searchQuery || selectedCategory || selectedLocation || commissionTypeFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'No jobs match your filters' 
                    : 'No referral jobs yet'
                  }
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  {searchQuery || selectedCategory || selectedLocation || commissionTypeFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to create a referral job and start earning commissions!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleCreateJob}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Create Your First Job
                  </button>
                  {(searchQuery || selectedCategory || selectedLocation || commissionTypeFilter !== 'all' || urgencyFilter !== 'all') && (
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
                  {jobs.map((job, index) => {
                    const isLastItem = index === jobs.length - 1
                    
                    return (
                      <div
                        key={job.id}
                        ref={isLastItem ? lastJobElementRef : null}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                        onClick={() => handleViewJob(job)}
                      >
                        {/* Header with badges */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {job.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(job.urgency)}`}>
                                {job.urgency} Priority
                              </span>
                              {job.referral_type && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                  {job.referral_type}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-green-600 font-bold">
                              {job.commission_type === 'percentage' ? (
                                <span>{job.commission}%</span>
                              ) : (
                                <>
                                  <DollarSign className="h-4 w-4" />
                                  <span>{job.commission}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Business info with logo */}
                          <div className="flex items-center space-x-3 mb-3">
                            {job.logo_url ? (
                              <img
                                src={job.logo_url}
                                alt={job.business_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Building className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 
                                className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                                style={{ fontFamily: 'Montserrat' }}
                              >
                                {job.title}
                              </h3>
                              <p 
                                className="text-blue-600 font-medium text-sm"
                                style={{ fontFamily: 'Inter' }}
                              >
                                {job.business_name}
                              </p>
                            </div>
                          </div>
                          
                          <p 
                            className="text-gray-600 text-sm mb-4 line-clamp-3"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {job.description}
                          </p>
                          
                          {/* Location and applicants */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{job.applicants_count} applicants</span>
                            </div>
                            {job.website && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Globe className="h-4 w-4 mr-2" />
                                <a 
                                  href={job.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {job.website}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Requirements */}
                          {job.requirements && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Requirements:</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{job.requirements}</p>
                            </div>
                          )}

                          {/* Terms */}
                          {job.terms && (
                            <div className="mb-4">
                              <div className="flex items-center space-x-1 mb-1">
                                <FileText className="h-3 w-3 text-gray-500" />
                                <h4 className="text-sm font-medium text-gray-700">Terms:</h4>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{job.terms}</p>
                            </div>
                          )}
                          
                          {/* Author and timestamp */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-2">
                              {job.user_profiles?.avatar_url ? (
                                <img
                                  src={job.user_profiles.avatar_url}
                                  alt={job.user_profiles.name || 'User'}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                              )}
                              <span>{job.user_profiles?.name || 'Business Owner'}</span>
                            </div>
                            <span>{formatTimeAgo(job.created_at)}</span>
                          </div>
                          
                          {/* CTA and action buttons */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => handleShare(job, e)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                              title="Share"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => handleApplyJob(job, e)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                              style={{ fontFamily: 'Inter' }}
                            >
                              {job.cta_text || 'Apply Now'}
                            </button>
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
                {!hasMore && jobs.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
                      You've seen all jobs! 🎉
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        job={shareJob} 
        isVisible={!!shareJob} 
        onClose={() => setShareJob(null)} 
      />
      
      <ContactModal 
        job={contactJob} 
        isVisible={!!contactJob} 
        onClose={() => setContactJob(null)} 
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

export default ReferralJobs