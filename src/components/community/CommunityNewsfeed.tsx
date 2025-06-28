import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Image, 
  Video, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  User, 
  X, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin,
  Search,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { 
  createCommunityPost, 
  getCommunityPosts, 
  likeCommunityPost, 
  subscribeToCommunityPosts,
  get_community_posts_by_location,
  type CommunityPost 
} from '../../lib/database'

// Share modal component
const ShareModal = ({ post, isVisible, onClose }: { post: CommunityPost | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!post || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/community?post=${post.id}`
  const shareText = `Check out this community post on Localhy!`

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
            Share Post
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
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

interface CommunityNewsfeedProps {
  user: any
}

const CommunityNewsfeed: React.FC<CommunityNewsfeedProps> = ({ user }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sharePost, setSharePost] = useState<CommunityPost | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPosts()
    
    // Set up real-time subscription for new posts
    const subscription = subscribeToCommunityPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new post to the top of the list
        const newPost = payload.new as any
        
        // Fetch user details for the new post
        const fetchUserDetails = async () => {
          try {
            // In a real implementation, you would fetch user details from the database
            // For now, we'll just add placeholder user details
            setPosts(prev => [{
              ...newPost,
              user_name: 'New User',
              user_avatar_url: null,
              user_type: 'other',
              liked_by_user: false
            }, ...prev])
          } catch (error) {
            console.error('Error fetching user details for new post:', error)
          }
        }
        
        fetchUserDetails()
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Reload posts when filters change
    loadPosts()
  }, [locationFilter, timeFilter, sortBy])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      
      let fetchedPosts: CommunityPost[] = []
      
      // Apply filters
      if (locationFilter) {
        // Fetch posts by location
        fetchedPosts = await getCommunityPostsByLocation(locationFilter)
      } else if (timeFilter !== 'all') {
        // Fetch posts by time period
        const days = timeFilter === 'today' ? 1 : timeFilter === 'week' ? 7 : 30
        fetchedPosts = await getCommunityPostsByTime(days)
      } else {
        // Fetch all posts
        fetchedPosts = await getCommunityPosts(10, 0, user?.id)
      }
      
      // Sort posts
      if (sortBy === 'popular') {
        fetchedPosts.sort((a, b) => b.likes - a.likes)
      } else {
        // Default is 'recent'
        fetchedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
      
      setPosts(fetchedPosts)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCommunityPostsByLocation = async (location: string): Promise<CommunityPost[]> => {
    try {
      // This would be a real API call in a production app
      // For now, we'll filter the existing posts client-side
      const allPosts = await getCommunityPosts(50, 0, user?.id)
      return allPosts.filter(post => 
        post.location && post.location.toLowerCase().includes(location.toLowerCase())
      )
    } catch (error) {
      console.error('Error fetching posts by location:', error)
      return []
    }
  }

  const getCommunityPostsByTime = async (days: number): Promise<CommunityPost[]> => {
    try {
      // This would be a real API call in a production app
      // For now, we'll filter the existing posts client-side
      const allPosts = await getCommunityPosts(50, 0, user?.id)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      return allPosts.filter(post => 
        new Date(post.created_at) >= cutoffDate
      )
    } catch (error) {
      console.error('Error fetching posts by time:', error)
      return []
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPostContent.trim() && !imageFile) {
      return // Don't submit empty posts
    }
    
    if (!user) {
      setError('You must be logged in to post')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      // In a real app, you would upload the image to storage first
      // and then create the post with the image URL
      let imageUrl = null
      if (imageFile) {
        // Simulate image upload
        imageUrl = imagePreview // In a real app, this would be the URL from storage
      }
      
      const post = await createCommunityPost({
        user_id: user.id,
        content: newPostContent,
        image_url: imageUrl,
        location: location || undefined
      })
      
      if (post) {
        // Add the new post to the top of the list
        setPosts(prev => [post, ...prev])
        
        // Reset form
        setNewPostContent('')
        setImageFile(null)
        setImagePreview(null)
        setLocation('')
        if (imageInputRef.current) {
          imageInputRef.current.value = ''
        }
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    
    try {
      const success = await likeCommunityPost(postId, user.id)
      
      if (success) {
        // Update post in state
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const newLikedState = !post.liked_by_user
            return {
              ...post,
              liked_by_user: newLikedState,
              likes: newLikedState ? post.likes + 1 : post.likes - 1
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = (post: CommunityPost) => {
    setSharePost(post)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex space-x-3">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's happening in your neighborhood?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={3}
                />
                
                {/* Image preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* Location input */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add your location (optional)"
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Image className="h-5 w-5" />
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || (!newPostContent.trim() && !imageFile)}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-1"
                  >
                    <span>Post</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Location filter */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* Time filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            {/* Sort filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          {/* Active filters */}
          {(locationFilter || timeFilter !== 'all' || sortBy !== 'recent') && (
            <div className="flex items-center mt-3 text-sm">
              <span className="text-gray-600 mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {locationFilter && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{locationFilter}</span>
                    <button
                      onClick={() => setLocationFilter('')}
                      className="ml-1 text-green-800 hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {timeFilter !== 'all' && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {timeFilter === 'today' ? 'Today' : 
                       timeFilter === 'week' ? 'This Week' : 'This Month'}
                    </span>
                    <button
                      onClick={() => setTimeFilter('all')}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {sortBy !== 'recent' && (
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Most Popular</span>
                    <button
                      onClick={() => setSortBy('recent')}
                      className="ml-1 text-purple-800 hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setLocationFilter('')
                    setTimeFilter('all')
                    setSortBy('recent')
                  }}
                  className="text-gray-600 hover:text-gray-800 underline text-xs"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            
            <p className="text-gray-600 mb-6">
              {locationFilter 
                ? `No posts found in "${locationFilter}". Try a different location or be the first to post!` 
                : "Be the first to share something with your community!"}
            </p>
            
            <button
              onClick={() => {
                // Scroll to top where the post form is
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow">
                {/* Post header */}
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {post.user_avatar_url ? (
                      <img
                        src={post.user_avatar_url}
                        alt={post.user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {post.user_name}
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm">
                            <span>{formatTimeAgo(post.created_at)}</span>
                            {post.location && (
                              <>
                                <span className="mx-1">•</span>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{post.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <p className="mt-2 text-gray-700">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Post image */}
                {post.image_url && (
                  <div className="px-4 pb-3">
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                  </div>
                )}
                
                {/* Post video */}
                {post.video_url && (
                  <div className="px-4 pb-3">
                    <video
                      src={post.video_url}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                
                {/* Post actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 ${
                        post.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments_count}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        post={sharePost} 
        isVisible={!!sharePost} 
        onClose={() => setSharePost(null)} 
      />
    </div>
  )
}

export default CommunityNewsfeed

export default CommunityNewsfeed