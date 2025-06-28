import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Newspaper, 
  ShoppingBag, 
  Calendar, 
  UserPlus, 
  MessageCircle, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  ChevronDown, 
  MoreHorizontal, 
  Image, 
  Video, 
  Send, 
  X, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin,
  Building,
  Lightbulb,
  Wrench,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  getIdeas, 
  getReferralJobs, 
  getTools,
  createComment,
  likeComment,
  type Idea,
  type ReferralJob,
  type Tool,
  type Comment
} from '../lib/database'

// Types for community posts
interface CommunityPost {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  location?: string
  likes: number
  comments_count: number
  created_at: string
  updated_at: string
  user_profile?: {
    name: string
    avatar_url?: string
    user_type?: string
  }
  liked_by_user?: boolean
  comments?: Comment[]
}

// Share modal component
const ShareModal = ({ post, isVisible, onClose }: { post: CommunityPost | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!post || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/community/post/${post.id}`
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

// Comment section component
const CommentSection = ({ 
  post, 
  comments, 
  onAddComment, 
  onLikeComment, 
  isVisible, 
  onClose 
}: { 
  post: CommunityPost | null, 
  comments: Comment[], 
  onAddComment: (content: string) => Promise<void>, 
  onLikeComment: (commentId: string) => Promise<void>, 
  isVisible: boolean, 
  onClose: () => void 
}) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!post || !isVisible) return null

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      await onAddComment(newComment)
      setNewComment('')
    } catch (err: any) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Comments ({comments.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                {comment.user_profile?.avatar_url ? (
                  <img
                    src={comment.user_profile.avatar_url}
                    alt={comment.user_profile.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {comment.user_profile?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 space-x-2">
                    <button
                      onClick={() => onLikeComment(comment.id)}
                      className={`text-xs flex items-center space-x-1 ${
                        comment.liked_by_user ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                      <span>{comment.likes || 0} Likes</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input */}
        {user && (
          <div className="p-4 border-t">
            {error && (
              <div className="mb-2 text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-r-lg"
                >
                  {submitting ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Sponsored content component
const SponsoredContent = ({ item }: { item: Idea | ReferralJob | Tool }) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if ('price' in item && 'problem_summary' in item) {
      // It's an Idea
      navigate(`/dashboard/ideas/${item.id}`)
    } else if ('commission' in item && 'business_name' in item) {
      // It's a ReferralJob
      navigate(`/dashboard/referral-jobs/${item.id}`)
    } else if ('download_url' in item) {
      // It's a Tool
      navigate(`/dashboard/starter-tools`)
    }
  }
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">Sponsored</span>
      </div>
      
      <div className="flex space-x-3">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {'thumbnail_url' in item && item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : 'logo_url' in item && item.logo_url ? (
            <img src={item.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <>
              {'price' in item && 'problem_summary' in item && <Lightbulb className="h-6 w-6 text-green-500" />}
              {'commission' in item && 'business_name' in item && <Building className="h-6 w-6 text-blue-500" />}
              {'download_url' in item && <Wrench className="h-6 w-6 text-purple-500" />}
            </>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
            {item.title}
          </h4>
          
          <p className="text-gray-600 text-xs line-clamp-2">
            {'description' in item ? item.description : ''}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {'price' in item && item.price > 0 && (
                <span className="text-green-600 font-medium">${item.price}</span>
              )}
              {'commission' in item && (
                <span className="text-blue-600 font-medium">
                  {item.commission_type === 'percentage' ? `${item.commission}%` : `$${item.commission}`}
                </span>
              )}
            </div>
            
            <button className="text-blue-500 hover:text-blue-600 text-xs font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const CommunityPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('news-feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterLocation, setFilterLocation] = useState('')
  const [filterTimeframe, setFilterTimeframe] = useState('all')
  
  // Post states
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [newPostContent, setNewPostContent] = useState('')
  const [postImage, setPostImage] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal states
  const [sharePost, setSharePost] = useState<CommunityPost | null>(null)
  const [commentPost, setCommentPost] = useState<CommunityPost | null>(null)
  const [postComments, setPostComments] = useState<Comment[]>([])
  
  // Sponsored content
  const [sponsoredItems, setSponsoredItems] = useState<(Idea | ReferralJob | Tool)[]>([])
  const [loadingSponsored, setLoadingSponsored] = useState(true)
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useRef<HTMLDivElement | null>(null)
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPosts()
    loadSponsoredContent()
    
    // Set up intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.5 }
    )
    
    observerRef.current = observer
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
  
  useEffect(() => {
    // Update observer when lastPostElementRef changes
    if (lastPostElementRef.current && observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current.observe(lastPostElementRef.current)
    }
  }, [posts])
  
  useEffect(() => {
    // Apply filters when search query or filters change
    if (searchQuery || filterLocation || filterTimeframe !== 'all') {
      filterPosts()
    }
  }, [searchQuery, filterLocation, filterTimeframe])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch community posts from Supabase
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url, user_type)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        throw error
      }
      
      // Add user interaction data if user is logged in
      let postsWithInteractions = data || []
      
      if (user) {
        postsWithInteractions = await Promise.all(
          postsWithInteractions.map(async (post) => {
            // Check if user liked this post
            const { data: likeData } = await supabase
              .from('community_post_likes')
              .select('id')
              .eq('community_post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle()
            
            return {
              ...post,
              liked_by_user: !!likeData
            }
          })
        )
      }
      
      setPosts(postsWithInteractions)
      setPage(1)
      setHasMore(data?.length === 10)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url, user_type)
        `)
        .order('created_at', { ascending: false })
        .range(page * 10, (page + 1) * 10 - 1)
      
      if (error) {
        throw error
      }
      
      // Add user interaction data if user is logged in
      let newPosts = data || []
      
      if (user) {
        newPosts = await Promise.all(
          newPosts.map(async (post) => {
            // Check if user liked this post
            const { data: likeData } = await supabase
              .from('community_post_likes')
              .select('id')
              .eq('community_post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle()
            
            return {
              ...post,
              liked_by_user: !!likeData
            }
          })
        )
      }
      
      setPosts(prev => [...prev, ...newPosts])
      setPage(prev => prev + 1)
      setHasMore(data?.length === 10)
    } catch (err) {
      console.error('Error loading more posts:', err)
    } finally {
      setLoadingMore(false)
    }
  }
  
  const filterPosts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url, user_type)
        `)
      
      // Apply location filter
      if (filterLocation) {
        query = query.ilike('location', `%${filterLocation}%`)
      }
      
      // Apply timeframe filter
      if (filterTimeframe !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (filterTimeframe) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }
      
      // Order by created_at
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      // Apply search filter client-side
      let filteredPosts = data || []
      
      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post => 
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Add user interaction data if user is logged in
      if (user) {
        filteredPosts = await Promise.all(
          filteredPosts.map(async (post) => {
            // Check if user liked this post
            const { data: likeData } = await supabase
              .from('community_post_likes')
              .select('id')
              .eq('community_post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle()
            
            return {
              ...post,
              liked_by_user: !!likeData
            }
          })
        )
      }
      
      setPosts(filteredPosts)
      setHasMore(false) // Disable infinite scroll when filters are applied
    } catch (err) {
      console.error('Error filtering posts:', err)
      setError('Failed to filter posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const loadSponsoredContent = async () => {
    try {
      setLoadingSponsored(true)
      
      // Fetch a mix of ideas, referral jobs, and tools
      const [ideas, referralJobs, tools] = await Promise.all([
        getIdeas(3, 0),
        getReferralJobs(3, 0),
        getTools(3, 0)
      ])
      
      // Combine and shuffle
      const allItems = [...ideas, ...referralJobs, ...tools]
      const shuffled = allItems.sort(() => 0.5 - Math.random())
      
      // Take a subset for sponsored content
      setSponsoredItems(shuffled.slice(0, 5))
    } catch (err) {
      console.error('Error loading sponsored content:', err)
    } finally {
      setLoadingSponsored(false)
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    
    setPostImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPostImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleRemoveImage = () => {
    setPostImage(null)
    setPostImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleSubmitPost = async () => {
    if (!user || !newPostContent.trim() && !postImage) {
      setError('Please add some content to your post')
      return
    }
    
    setSubmittingPost(true)
    setError('')
    
    try {
      let imageUrl = null
      
      // Upload image if present
      if (postImage) {
        const fileExt = postImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `community-posts/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(filePath, postImage)
        
        if (uploadError) {
          throw uploadError
        }
        
        const { data } = supabase.storage
          .from('community-images')
          .getPublicUrl(filePath)
        
        imageUrl = data.publicUrl
      }
      
      // Create post
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim(),
          image_url: imageUrl,
          location: user.user_metadata?.location || null
        })
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url, user_type)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      // Add to posts list
      setPosts(prev => [
        {
          ...data,
          liked_by_user: false
        },
        ...prev
      ])
      
      // Reset form
      setNewPostContent('')
      setPostImage(null)
      setPostImagePreview(null)
      
      // Show success message
      setSuccess('Post created successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error creating post:', err)
      setError(err.message || 'Failed to create post. Please try again.')
    } finally {
      setSubmittingPost(false)
    }
  }
  
  const handleLikePost = async (postId: string) => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('community_post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (existingLike) {
        // Unlike
        await supabase
          .from('community_post_likes')
          .delete()
          .eq('community_post_id', postId)
          .eq('user_id', user.id)
        
        // Decrement likes count
        await supabase.rpc('decrement_community_post_likes', { p_post_id: postId })
        
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                liked_by_user: false,
                likes: Math.max((post.likes || 0) - 1, 0)
              }
            : post
        ))
      } else {
        // Like
        await supabase
          .from('community_post_likes')
          .insert({ community_post_id: postId, user_id: user.id })
        
        // Increment likes count
        await supabase.rpc('increment_community_post_likes', { p_post_id: postId })
        
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                liked_by_user: true,
                likes: (post.likes || 0) + 1
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }
  
  const handleViewComments = async (post: CommunityPost) => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    setCommentPost(post)
    
    try {
      // Fetch comments for this post
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          *,
          user_profile:user_profiles(name, avatar_url)
        `)
        .eq('content_id', post.id)
        .eq('content_type', 'community_post')
        .order('created_at', { ascending: false })
      
      // Add user interaction data
      const commentsWithInteractions = await Promise.all(
        (comments || []).map(async (comment) => {
          // Check if user liked this comment
          const { data: likeData } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id)
            .maybeSingle()
          
          return {
            ...comment,
            liked_by_user: !!likeData
          }
        })
      )
      
      setPostComments(commentsWithInteractions)
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }
  
  const handleAddComment = async (content: string) => {
    if (!user || !commentPost) return
    
    try {
      const comment = await createComment({
        content_id: commentPost.id,
        content_type: 'community_post',
        user_id: user.id,
        content: content
      })
      
      if (comment) {
        // Add to comments list
        setPostComments(prev => [comment, ...prev])
        
        // Update post comments count
        setPosts(prev => prev.map(post => 
          post.id === commentPost.id 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        ))
        
        // Increment comments count in database
        await supabase.rpc('increment_community_post_comments', { p_post_id: commentPost.id })
      } else {
        throw new Error('Failed to create comment')
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }
  
  const handleLikeComment = async (commentId: string) => {
    if (!user) return
    
    try {
      const success = await likeComment(commentId, user.id)
      
      if (success) {
        // Update local state
        setPostComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                liked_by_user: !comment.liked_by_user,
                likes: comment.liked_by_user ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        ))
      }
    } catch (err) {
      console.error('Error liking comment:', err)
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

  const tabs = [
    { id: 'news-feed', label: 'News Feed', icon: Newspaper, count: posts.length },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, count: 0 },
    { id: 'groups', label: 'Groups', icon: Users, count: 0 },
    { id: 'events', label: 'Events', icon: Calendar, count: 0 },
    { id: 'invite', label: 'Invite Neighbors', icon: UserPlus }
  ]

  // Function to render a sponsored item every 4 posts
  const getContentWithSponsored = () => {
    if (posts.length === 0) return []
    
    const result = []
    let sponsoredIndex = 0
    
    for (let i = 0; i < posts.length; i++) {
      result.push({ type: 'post', item: posts[i] })
      
      // Add sponsored content after every 4 posts
      if ((i + 1) % 4 === 0 && sponsoredItems[sponsoredIndex]) {
        result.push({ type: 'sponsored', item: sponsoredItems[sponsoredIndex] })
        sponsoredIndex = (sponsoredIndex + 1) % sponsoredItems.length
      }
    }
    
    return result
  }

  const renderNewsFeed = () => {
    if (loading && posts.length === 0) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-16 bg-gray-200 rounded mb-3"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )
    }
    
    if (posts.length === 0 && !loading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
            No posts yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto" style={{ fontFamily: 'Inter' }}>
            Be the first to share something with your community! Create a post to get started.
          </p>
        </div>
      )
    }
    
    const contentWithSponsored = getContentWithSponsored()
    
    return (
      <div className="space-y-4">
        {contentWithSponsored.map((content, index) => {
          if (content.type === 'sponsored') {
            return <SponsoredContent key={`sponsored-${index}`} item={content.item} />
          }
          
          const post = content.item as CommunityPost
          const isLastItem = index === contentWithSponsored.length - 1
          
          return (
            <div 
              key={post.id} 
              ref={isLastItem ? lastPostElementRef : null}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-3">
                {post.user_profile?.avatar_url ? (
                  <img 
                    src={post.user_profile.avatar_url} 
                    alt={post.user_profile.name || 'User'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {post.user_profile?.name || 'Anonymous'}
                    </h4>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{formatTimeAgo(post.created_at)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-0.5" />
                          <span>{post.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="mb-3">
                <p className="text-gray-700 whitespace-pre-line">
                  {post.content}
                </p>
                
                {post.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                )}
                
                {post.video_url && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <video 
                      src={post.video_url} 
                      controls 
                      className="w-full h-auto max-h-96"
                    />
                  </div>
                )}
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      post.liked_by_user ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                    <span>{post.likes || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => handleViewComments(post)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => setSharePost(post)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && !loadingMore && (
          <div className="text-center py-4 text-gray-500">
            No more posts to show
          </div>
        )}
      </div>
    )
  }

  const renderRightSidebar = () => {
    return (
      <div className="space-y-4">
        {/* Get Started Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Get started on Localhy
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Business owner? Create your page</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">1024 local groups to join</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500">3 of 6 steps completed</span>
            <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
              <div className="w-1/2 h-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Invite Neighbors Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Invite nearby neighbors
          </h3>
          
          <p className="text-sm text-gray-600 mb-3">
            Your invitation will include your first name, your neighborhood, and helpful information about Localhy.
          </p>
          
          <div className="space-y-2 mb-3">
            {['New York, NY', 'Los Angeles, CA', 'Chicago, IL'].map((location, index) => (
              <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{location}</span>
                </div>
                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
            Send 3 invitations
          </button>
          
          <button className="w-full text-blue-500 hover:text-blue-600 text-sm mt-2">
            See more neighbors
          </button>
        </div>
        
        {/* Business Promotion Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="#f0fdf4" />
                <path d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z" fill="none" stroke="#e0e0e0" strokeWidth="2" />
                <path d="M50,10 C70,10 90,30 90,50" fill="none" stroke="#10b981" strokeWidth="2" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building className="h-10 w-10 text-green-500" />
              </div>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 text-center mb-2">
            Own a local business?
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 text-center">
            Create a business page to connect with neighbors, post updates in the feed, and gain new customers.
          </p>
          
          <button 
            onClick={() => navigate('/dashboard/create-business-page')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium"
          >
            Create page
          </button>
        </div>
        
        {/* Sponsored Ad */}
        {!loadingSponsored && sponsoredItems.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">Sponsored</span>
            </div>
            
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src="https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop" 
                alt="Sponsored" 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Minuteman Heating And Air</h4>
                <p className="text-xs text-gray-500">Sponsored</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              $50 Off Any Repair! Limited time offer for all new customers.
            </p>
            
            <img 
              src="https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Promotion" 
              className="w-full h-auto rounded-lg mb-3"
            />
            
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
              Learn More
            </button>
          </div>
        )}
      </div>
    )
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
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {activeTab === 'news-feed' && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
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
            
            {showFilters && (
              <div className="max-w-6xl mx-auto mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="Filter by location..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                  <select
                    value={filterTimeframe}
                    onChange={(e) => setFilterTimeframe(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterLocation('')
                      setFilterTimeframe('all')
                      setSearchQuery('')
                      loadPosts()
                    }}
                    className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'news-feed' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Left Column - Create Post + Feed */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Create Post */}
                  {user && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      {error && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {error}
                        </div>
                      )}
                      
                      {success && (
                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {success}
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        {user.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt="Your avatar" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="What's happening in your neighborhood?"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            style={{ fontFamily: 'Inter' }}
                          />
                          
                          {/* Image Preview */}
                          {postImagePreview && (
                            <div className="mt-2 relative">
                              <img 
                                src={postImagePreview} 
                                alt="Preview" 
                                className="max-h-40 rounded-lg"
                              />
                              <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full hover:bg-gray-900/70"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-gray-100"
                              >
                                <Image className="h-5 w-5" />
                                <span className="text-sm">Photo</span>
                              </button>
                              
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                              
                              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-gray-100">
                                <Video className="h-5 w-5" />
                                <span className="text-sm">Video</span>
                              </button>
                            </div>
                            
                            <button
                              onClick={handleSubmitPost}
                              disabled={(!newPostContent.trim() && !postImage) || submittingPost}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                            >
                              {submittingPost ? (
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
                      </div>
                    </div>
                  )}
                  
                  {/* News Feed */}
                  {renderNewsFeed()}
                </div>
                
                {/* Right Column - Sidebar */}
                <div className="hidden lg:block">
                  {renderRightSidebar()}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        post={sharePost} 
        isVisible={!!sharePost} 
        onClose={() => setSharePost(null)} 
      />
      
      <CommentSection 
        post={commentPost}
        comments={postComments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        isVisible={!!commentPost}
        onClose={() => setCommentPost(null)}
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

export default CommunityPage