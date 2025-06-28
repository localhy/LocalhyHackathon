import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Newspaper, ShoppingBag, Calendar, UserPlus, MessageCircle, Search, Filter, Plus, User, Heart, Share2, MapPin, Clock, ChevronDown, Image, X, Send, Loader, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost, getCommentsByContent, createComment, uploadFile, subscribeToCommunityPosts, type CommunityPost, type Comment } from '../lib/database'
import CommunityPostCard from './CommunityPostCard'

interface TabProps {
  id: string
  label: string
  icon: React.ComponentType<any>
  count?: number
  isActive: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ id, label, icon: Icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-50 text-blue-600 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
)

// Create Post Component
const CreatePostForm = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }
    
    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      let imageUrl = null
      
      // Upload image if selected
      if (image) {
        imageUrl = await uploadFile(image, 'community-posts')
      }
      
      // Create post
      const newPost = await createCommunityPost({
        user_id: user.id,
        content: content.trim(),
        location: location.trim() || undefined,
        image_url: imageUrl || undefined
      })
      
      if (newPost) {
        // Reset form
        setContent('')
        setLocation('')
        setImage(null)
        setImagePreview(null)
        
        // Notify parent component
        onPostCreated()
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 p-4">
      <div className="flex items-start space-x-3">
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt={user.user_metadata?.name || 'User'} 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your neighborhood?"
              className="w-full border border-gray-300 rounded-lg p-3 mb-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              style={{ fontFamily: 'Inter' }}
            />
            
            {error && (
              <div className="mb-3 text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            
            {imagePreview && (
              <div className="relative mb-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-60 rounded-lg object-contain bg-gray-100"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full hover:bg-gray-900/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Image className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="pl-7 pr-2 py-1 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Comment Section Component
const CommentSection = ({ postId, onClose }: { postId: string, onClose: () => void }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadComments = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const fetchedComments = await getCommentsByContent(postId, 'community_post', user.id)
        setComments(fetchedComments)
      } catch (error) {
        console.error('Error loading comments:', error)
        setError('Failed to load comments')
      } finally {
        setLoading(false)
      }
    }
    
    loadComments()
  }, [postId, user])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !newComment.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const comment = await createComment({
        content_id: postId,
        content_type: 'community_post',
        user_id: user.id,
        content: newComment.trim()
      })
      
      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment('')
      } else {
        throw new Error('Failed to create comment')
      }
    } catch (error: any) {
      console.error('Error creating comment:', error)
      setError(error.message || 'Failed to create comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Comments
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                {comment.user_profile?.avatar_url ? (
                  <img 
                    src={comment.user_profile.avatar_url} 
                    alt={comment.user_profile.name || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="font-medium text-gray-900">
                      {comment.user_profile?.name || 'Anonymous'}
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <span className="mx-2">•</span>
                    <button className="hover:text-blue-500">Like</button>
                    <span className="mx-2">•</span>
                    <button className="hover:text-blue-500">Reply</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t">
          {error && (
            <div className="mb-3 text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt={user.user_metadata?.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Right Sidebar Components
const GetStartedSection = () => (
  <div className="bg-white rounded-lg border border-gray-200 mb-4">
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900">Get started on Localhy</h3>
    </div>
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">Business owner? Create your page</h4>
          <button 
            onClick={() => window.location.href = '/dashboard/create-business-page'}
            className="text-blue-600 text-sm font-medium"
          >
            Get Started
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">1024 local groups to join</h4>
          <button className="text-blue-600 text-sm font-medium">
            See groups
          </button>
        </div>
      </div>
    </div>
  </div>
)

const InviteNeighborsSection = () => (
  <div className="bg-white rounded-lg border border-gray-200 mb-4">
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900">Invite nearby neighbors</h3>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-4">
        Your invitation will include your first name, your neighborhood, and helpful information about Localhy.
      </p>
      
      <div className="space-y-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">1301 Throckmorton St Apt {i}</p>
              <p className="text-xs text-gray-500">&lt;1 mi away</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
          </div>
        ))}
      </div>
      
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
        Send 3 invitations
      </button>
    </div>
  </div>
)

const BusinessSection = () => (
  <div className="bg-white rounded-lg border border-gray-200 mb-4">
    <div className="p-4">
      <div className="flex items-center justify-center mb-4">
        <div className="w-20 h-20 bg-yellow-50 rounded-lg flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L4 16V44H44V16L24 4Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 36C28.4183 36 32 32.4183 32 28C32 23.5817 28.4183 20 24 20C19.5817 20 16 23.5817 16 28C16 32.4183 19.5817 36 24 36Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Own a local business?
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 text-center">
        Create a business page to connect with neighbors, post updates in the feed, and gain new customers.
      </p>
      
      <button 
        onClick={() => window.location.href = '/dashboard/create-business-page'}
        className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium"
      >
        Create page
      </button>
    </div>
  </div>
)

const CommunityPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('news-feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  
  // Infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  useEffect(() => {
    loadPosts(true)
    
    // Set up real-time subscription for new posts
    const subscription = subscribeToCommunityPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new post to the top of the list
        const newPost = payload.new as CommunityPost
        
        // Fetch user profile data for the new post
        supabase
          .from('user_profiles')
          .select('name, avatar_url, user_type')
          .eq('id', newPost.user_id)
          .single()
          .then(({ data }) => {
            if (data) {
              setPosts(prev => [{
                ...newPost,
                user_profile: data,
                liked_by_user: false
              }, ...prev])
            }
          })
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setPosts([])
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const currentPage = reset ? 0 : page
      const limit = 10
      const offset = currentPage * limit
      
      // Fetch posts
      const fetchedPosts = await getCommunityPosts(limit, offset, user?.id)
      
      // Apply search filter if needed
      let filteredPosts = fetchedPosts
      if (searchQuery) {
        filteredPosts = fetchedPosts.filter(post => 
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.location?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      const hasMoreItems = filteredPosts.length === limit
      
      if (reset) {
        setPosts(filteredPosts)
      } else {
        setPosts(prev => [...prev, ...filteredPosts])
      }
      
      setHasMore(hasMoreItems)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false)
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
        // Stay on current page
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

  const handlePostCreated = () => {
    // Reload posts to show the new one
    loadPosts(true)
  }

  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(postId)
  }

  const tabs = [
    { id: 'news-feed', label: 'News Feed', icon: Newspaper, count: posts.length },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, count: 0 },
    { id: 'groups', label: 'Groups', icon: Users, count: 0 },
    { id: 'events', label: 'Events', icon: Calendar, count: 0 },
    { id: 'invite', label: 'Invite Neighbors', icon: UserPlus }
  ]

  const renderTabContent = () => {
    if (activeTab === 'news-feed') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post Form */}
            <CreatePostForm onPostCreated={handlePostCreated} />
            
            {/* Posts List */}
            {loading && posts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => loadPosts(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-4">Be the first to share something with your community!</p>
              </div>
            ) : (
              <>
                {posts.map((post, index) => {
                  const isLastItem = index === posts.length - 1
                  
                  return (
                    <div 
                      key={post.id} 
                      ref={isLastItem ? lastPostElementRef : null}
                    >
                      <CommunityPostCard 
                        post={post} 
                        onCommentClick={handleCommentClick}
                      />
                    </div>
                  )
                })}
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                )}
                
                {/* End of results indicator */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    You've reached the end of the feed
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-4">
            <GetStartedSection />
            <InviteNeighborsSection />
            <BusinessSection />
          </div>
        </div>
      )
    }
    
    // For other tabs, show coming soon message
    const comingSoonMessage = (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {activeTab === 'marketplace' && <ShoppingBag className="h-8 w-8 text-blue-500" />}
          {activeTab === 'groups' && <Users className="h-8 w-8 text-blue-500" />}
          {activeTab === 'events' && <Calendar className="h-8 w-8 text-blue-500" />}
          {activeTab === 'invite' && <UserPlus className="h-8 w-8 text-blue-500" />}
        </div>
        <h3 
          className="text-xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          Coming Soon
        </h3>
        <p 
          className="text-gray-600 mb-6 max-w-md mx-auto"
          style={{ fontFamily: 'Inter' }}
        >
          {activeTab === 'marketplace' && "Soon you'll be able to buy, sell, and trade items with people in your local area."}
          {activeTab === 'groups' && "Join interest-based groups in your community to connect with like-minded neighbors."}
          {activeTab === 'events' && "Discover and create local events happening in your neighborhood."}
          {activeTab === 'invite' && "Help grow your local community by inviting your neighbors to join Localhy."}
        </p>
        <button
          onClick={() => setActiveTab('news-feed')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          style={{ fontFamily: 'Inter' }}
        >
          Back to News Feed
        </button>
      </div>
    )

    return comingSoonMessage
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="community"
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
          <div className="max-w-6xl mx-auto">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Community
            </h1>
            <p 
              className="text-gray-600 mt-1"
              style={{ fontFamily: 'Inter' }}
            >
              Connect with your local community
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar space-x-2 py-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  count={tab.count}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters (only for certain tabs) */}
        {['news-feed', 'marketplace', 'groups', 'events'].includes(activeTab) && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (activeTab === 'news-feed') {
                      // Reload posts with search filter
                      loadPosts(true)
                    }
                  }}
                  placeholder={`Search ${activeTab === 'news-feed' ? 'posts' : activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Filter</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {activeCommentPostId && (
        <CommentSection 
          postId={activeCommentPostId} 
          onClose={() => setActiveCommentPostId(null)} 
        />
      )}

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CommunityPage