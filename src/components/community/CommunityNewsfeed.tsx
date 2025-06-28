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
  X, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin, 
  AlertCircle, 
  Loader, 
  User,
  Filter,
  Clock
} from 'lucide-react'
import { 
  createCommunityPost, 
  getCommunityPosts, 
  likeCommunityPost, 
  getCommentsByContent, 
  createComment, 
  likeComment,
  type CommunityPost,
  type Comment
} from '../../lib/database'
import { supabase } from '../../lib/supabase'
import CommunityRightColumn from './CommunityRightColumn'
import { BASE_URL } from '../../lib/config'

// Share modal component
const ShareModal = ({ post, isVisible, onClose }: { post: CommunityPost | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!post || !isVisible) return null

  const shareUrl = `${BASE_URL}/dashboard/community?post=${post.id}`
  const shareText = `Check out this post on Localhy!`

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

// Comment modal component
const CommentModal = ({ post, isVisible, onClose }: { post: CommunityPost | null, isVisible: boolean, onClose: () => void }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
    }
    
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (post && isVisible) {
      loadComments()
    }
  }, [post, isVisible])

  const loadComments = async () => {
    if (!post) return
    
    try {
      setLoading(true)
      const fetchedComments = await getCommentsByContent(post.id, 'community_post', userId || undefined)
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!post || !userId || !newComment.trim() || submitting) return
    
    setSubmitting(true)
    setError('')
    
    try {
      const comment = await createComment({
        content_id: post.id,
        content_type: 'community_post',
        user_id: userId,
        content: newComment.trim()
      })
      
      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment('')
      } else {
        throw new Error('Failed to create comment')
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      setError(error.message || 'Failed to submit comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!userId) return
    
    try {
      const success = await likeComment(commentId, userId)
      if (success) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                liked_by_user: !comment.liked_by_user,
                likes: comment.liked_by_user ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        ))
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!post || !isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Comments ({post.comments_count})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.user_profile?.avatar_url ? (
                    <img
                      src={comment.user_profile.avatar_url}
                      alt={comment.user_profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user_profile?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          comment.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-4 border-t">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment()
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
            >
              {submitting ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
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
  const [newPostLocation, setNewPostLocation] = useState('')
  const [newPostImage, setNewPostImage] = useState<File | null>(null)
  const [newPostVideo, setNewPostVideo] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPosts()
    
    // Set up real-time subscription for new posts
    const subscription = supabase
      .channel('community-posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts'
        },
        (payload) => {
          // When a new post is created, fetch the user details and add to posts
          const fetchUserDetails = async () => {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, avatar_url, user_type')
              .eq('id', payload.new.user_id)
              .single()
            
            const newPost: CommunityPost = {
              ...payload.new,
              user_name: userProfile?.name || 'Anonymous',
              user_avatar_url: userProfile?.avatar_url,
              user_type: userProfile?.user_type,
              liked_by_user: false
            }
            
            setPosts(prev => [newPost, ...prev])
          }
          
          fetchUserDetails()
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Reload posts when location filter changes
    loadPosts()
  }, [selectedLocation])

  const loadPosts = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      // Get posts with location filter if provided
      const fetchedPosts = await getCommunityPosts(10, 0, user.id, selectedLocation)
      setPosts(fetchedPosts)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim() || submitting) return
    
    setSubmitting(true)
    setError('')
    
    try {
      // For now, we'll just handle text posts
      // In a real implementation, you would upload images/videos to storage
      const newPost = await createCommunityPost({
        user_id: user.id,
        content: newPostContent.trim(),
        location: newPostLocation.trim() || undefined
      })
      
      if (newPost) {
        // Add the new post to the state immediately for better UX
        const enhancedPost: CommunityPost = {
          ...newPost,
          user_name: user.user_metadata?.name || 'Anonymous',
          user_avatar_url: user.user_metadata?.avatar_url,
          user_type: user.user_metadata?.user_type,
          liked_by_user: false
        }
        
        // Add the new post to the top of the list
        setPosts(prev => [enhancedPost, ...prev])
        
        // Clear form
        setNewPostContent('')
        setNewPostLocation('')
        setNewPostImage(null)
        setNewPostVideo(null)
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return
    
    try {
      const success = await likeCommunityPost(postId, user.id)
      if (success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                liked_by_user: !post.liked_by_user,
                likes: post.liked_by_user ? post.likes - 1 : post.likes + 1
              }
            : post
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleSharePost = (post: CommunityPost) => {
    setSelectedPost(post)
    setShareModalOpen(true)
  }

  const handleCommentPost = (post: CommunityPost) => {
    setSelectedPost(post)
    setCommentModalOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPostImage(file)
      setNewPostVideo(null) // Reset video if image is selected
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPostVideo(file)
      setNewPostImage(null) // Reset image if video is selected
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Newsfeed */}
          <div className="lg:col-span-2">
            {/* Create Post Card */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4">
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
                  
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's happening in your neighborhood?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={3}
                    />
                    
                    <div className="flex items-center mt-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={newPostLocation}
                          onChange={(e) => setNewPostLocation(e.target.value)}
                          placeholder="Add location (optional)"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="mt-2 text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    
                    {(newPostImage || newPostVideo) && (
                      <div className="mt-2 relative">
                        {newPostImage && (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(newPostImage)}
                              alt="Post image"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setNewPostImage(null)}
                              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        
                        {newPostVideo && (
                          <div className="relative">
                            <video
                              src={URL.createObjectURL(newPostVideo)}
                              controls
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setNewPostVideo(null)}
                              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-100"
                    title="Add Image"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-100"
                    title="Add Video"
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
                
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || submitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2"
                >
                  {submitting ? (
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
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Filter by location (worldwide)"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      timeFilter === 'all' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTimeFilter('today')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      timeFilter === 'today' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setTimeFilter('week')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      timeFilter === 'week' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>
            </div>
            
            {/* Posts List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedLocation 
                    ? `No posts found in "${selectedLocation}". Try a different location or be the first to post!` 
                    : "Be the first to post in your community!"}
                </p>
                <button
                  onClick={() => {
                    setSelectedLocation('')
                    setTimeFilter('all')
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow">
                    {/* Post Header */}
                    <div className="p-4 flex items-start space-x-3">
                      {post.user_avatar_url ? (
                        <img
                          src={post.user_avatar_url}
                          alt={post.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {post.user_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 space-x-2">
                              <span>{formatTimeAgo(post.created_at)}</span>
                              {post.location && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{post.location}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <p className="mt-2 text-gray-700 whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>
                    </div>
                    
                    {/* Post Media */}
                    {post.image_url && (
                      <div className="px-4 pb-4">
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                    
                    {post.video_url && (
                      <div className="px-4 pb-4">
                        <video
                          src={post.video_url}
                          controls
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* Post Stats */}
                    <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes} likes</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>
                    
                    {/* Post Actions */}
                    <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          post.liked_by_user 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                        <span>Like</span>
                      </button>
                      
                      <button
                        onClick={() => handleCommentPost(post)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Comment</span>
                      </button>
                      
                      <button
                        onClick={() => handleSharePost(post)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="hidden lg:block">
            <CommunityRightColumn userId={user?.id} />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <ShareModal 
        post={selectedPost} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
      
      <CommentModal 
        post={selectedPost} 
        isVisible={commentModalOpen} 
        onClose={() => setCommentModalOpen(false)} 
      />
    </div>
  )
}

export default CommunityNewsfeed