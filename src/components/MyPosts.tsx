import React, { useState, useEffect } from 'react'
import { Eye, Heart, MessageCircle, Edit, Trash2, Plus, DollarSign, Users, Download, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getUserIdeas, 
  getUserReferralJobs, 
  getUserTools, 
  deleteIdea, 
  deleteReferralJob, 
  deleteTool,
  type Idea,
  type ReferralJob,
  type Tool
} from '../lib/database'

interface PostCounts {
  ideas: number
  referrals: number
  tools: number
  total: number
}

const MyPosts = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [referralJobs, setReferralJobs] = useState<ReferralJob[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [counts, setCounts] = useState<PostCounts>({
    ideas: 0,
    referrals: 0,
    tools: 0,
    total: 0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadUserPosts()
    }
  }, [user])

  const loadUserPosts = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      // Fetch all user posts in parallel
      const [userIdeas, userReferrals, userTools] = await Promise.all([
        getUserIdeas(user.id),
        getUserReferralJobs(user.id),
        getUserTools(user.id)
      ])

      setIdeas(userIdeas)
      setReferralJobs(userReferrals)
      setTools(userTools)

      // Update counts
      setCounts({
        ideas: userIdeas.length,
        referrals: userReferrals.length,
        tools: userTools.length,
        total: userIdeas.length + userReferrals.length + userTools.length
      })
    } catch (err) {
      console.error('Error loading user posts:', err)
      setError('Failed to load your posts. Please try again.')
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
        // Stay on current page
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

  const handleEditPost = (type: 'idea' | 'referral' | 'tool', id: string) => {
    // Navigate to the dedicated edit page within My Posts context
    navigate(`/dashboard/my-posts/edit/${type}/${id}`)
  }

  const handleDelete = async (type: 'idea' | 'referral' | 'tool', id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      let success = false
      
      switch (type) {
        case 'idea':
          success = await deleteIdea(id)
          break
        case 'referral':
          success = await deleteReferralJob(id)
          break
        case 'tool':
          success = await deleteTool(id)
          break
      }

      if (success) {
        // Reload posts after successful deletion
        await loadUserPosts()
      } else {
        setError('Failed to delete post. Please try again.')
      }
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete post. Please try again.')
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

  const getFilteredPosts = () => {
    const allPosts = [
      ...ideas.map(idea => ({ ...idea, type: 'idea' as const })),
      ...referralJobs.map(job => ({ ...job, type: 'referral' as const })),
      ...tools.map(tool => ({ ...tool, type: 'tool' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    switch (activeTab) {
      case 'ideas':
        return ideas.map(idea => ({ ...idea, type: 'idea' as const }))
      case 'referrals':
        return referralJobs.map(job => ({ ...job, type: 'referral' as const }))
      case 'tools':
        return tools.map(tool => ({ ...tool, type: 'tool' as const }))
      default:
        return allPosts
    }
  }

  const tabs = [
    { id: 'all', label: 'All Posts', count: counts.total },
    { id: 'ideas', label: 'Ideas', count: counts.ideas },
    { id: 'referrals', label: 'Referral Jobs', count: counts.referrals },
    { id: 'tools', label: 'Tools', count: counts.tools }
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

  const filteredPosts = getFilteredPosts()

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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              My Posts
            </h1>
            
            <button
              onClick={() => navigate('/dashboard/create-new')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => {
                    setError('')
                    loadUserPosts()
                  }}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {activeTab === 'all' ? 'No posts yet' : `No ${activeTab} yet`}
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  {activeTab === 'all' 
                    ? 'Start sharing your ideas, creating referral jobs, or submitting tools to build your presence in the community.'
                    : `Create your first ${activeTab === 'referrals' ? 'referral job' : activeTab.slice(0, -1)} to get started.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/create-new')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Create Your First Post
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/ideas-vault')}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Explore Ideas
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={`${post.type}-${post.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                    onClick={() => handleEditPost(post.type, post.id)}
                  >
                    {/* Thumbnail Image - YouTube style */}
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                      {(post.type === 'idea' && (post as Idea).thumbnail_url) ? (
                        <img
                          src={(post as Idea).thumbnail_url!}
                          alt={post.title}
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
                              {post.type === 'idea' && <Eye className="h-8 w-8 text-green-600" />}
                              {post.type === 'referral' && <Users className="h-8 w-8 text-blue-600" />}
                              {post.type === 'tool' && <Download className="h-8 w-8 text-purple-600" />}
                            </div>
                            <p className="text-gray-700 font-medium text-sm">
                              {post.type === 'idea' && (post as Idea).category}
                              {post.type === 'referral' && (post as ReferralJob).category}
                              {post.type === 'tool' && (post as Tool).category}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Price overlay */}
                      {((post.type === 'idea' && (post as Idea).price > 0) || 
                        (post.type === 'tool' && (post as Tool).price > 0)) && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          ${post.type === 'idea' ? (post as Idea).price : (post as Tool).price}
                        </div>
                      )}
                      
                      {/* Commission overlay for referral jobs */}
                      {post.type === 'referral' && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          {(post as ReferralJob).commission}%
                        </div>
                      )}
                      
                      {/* Type badge */}
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {post.type === 'idea' ? 'Idea' : 
                         post.type === 'referral' ? 'Referral Job' : 'Tool'}
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute top-3 left-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPost(post.type, post.id)
                          }}
                          className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(post.type, post.id, post.title)
                          }}
                          className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 
                        className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        {post.title}
                      </h3>
                      
                      <p 
                        className="text-gray-600 text-sm mb-4 line-clamp-3"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {post.description}
                      </p>
                      
                      {/* Author and timestamp */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-2">
                          {user?.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Your avatar"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <span>You</span>
                        </div>
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                      
                      {/* Engagement metrics */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {post.type === 'idea' && (
                            <>
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{(post as Idea).views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{(post as Idea).likes}</span>
                              </div>
                            </>
                          )}
                          
                          {post.type === 'referral' && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{(post as ReferralJob).applicants_count} applicants</span>
                            </div>
                          )}
                          
                          {post.type === 'tool' && (
                            <div className="flex items-center space-x-1">
                              <Download className="h-4 w-4" />
                              <span>{(post as Tool).downloads_count} downloads</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="text-green-500 hover:text-green-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPost(post.type, post.id)
                          }}
                        >
                          Edit →
                        </button>
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

export default MyPosts