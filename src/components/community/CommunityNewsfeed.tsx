import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  MapPin, 
  Image, 
  Send, 
  X, 
  User, 
  Lightbulb, 
  Building, 
  Wrench,
  DollarSign,
  Clock,
  ChevronDown,
  Filter,
  Search,
  AlertCircle,
  Loader,
  ArrowRight,
  Eye,
  Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  getIdeas, 
  getReferralJobs, 
  getTools, 
  getActivePromotionForContent,
  incrementPromotionClicks,
  type Idea,
  type ReferralJob,
  type Tool
} from '../../lib/database'

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
  user_name: string
  user_avatar_url?: string
  user_type?: string
  liked_by_user: boolean
  type: 'community_post'
}

interface PromotionAd {
  id: string
  title: string
  description: string
  image_url?: string
  link_url?: string
  business_name?: string
  type: 'promotion'
}

type FeedItem = 
  | (Idea & { type: 'idea' }) 
  | (ReferralJob & { type: 'referral_job' }) 
  | (Tool & { type: 'tool' }) 
  | CommunityPost 
  | PromotionAd

interface CommunityNewsfeedProps {
  user: any
}

const CommunityNewsfeed: React.FC<CommunityNewsfeedProps> = ({ user }) => {
  const navigate = useNavigate()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [postingContent, setPostingContent] = useState(false)
  const [postError, setPostError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')
  const [selectedContentType, setSelectedContentType] = useState('all')
  
  // Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Right column data
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])
  const [topReferralJobs, setTopReferralJobs] = useState<ReferralJob[]>([])
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [loadingRightColumn, setLoadingRightColumn] = useState(true)
  
  // Ads
  const promotionAds: PromotionAd[] = [
    {
      id: 'promo1',
      title: 'Minuteman Heating And Air',
      description: '$50 Off Any Repair! Limited time offer for all new customers.',
      image_url: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link_url: 'https://example.com/promo1',
      business_name: 'Minuteman Heating And Air',
      type: 'promotion'
    },
    {
      id: 'promo2',
      title: 'Web Development Services',
      description: 'Professional web development at affordable prices. Get your business online today!',
      image_url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link_url: 'https://example.com/promo2',
      business_name: 'TechSolutions',
      type: 'promotion'
    },
    {
      id: 'promo3',
      title: 'Local Lawn Care',
      description: 'Spring special: 20% off your first lawn care service. Professional and reliable.',
      image_url: 'https://images.pexels.com/photos/589/garden-grass-meadow-green.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link_url: 'https://example.com/promo3',
      business_name: 'Green Thumb Landscaping',
      type: 'promotion'
    }
  ]

  useEffect(() => {
    loadFeedItems()
    loadRightColumnData()
  }, [user, searchQuery, selectedLocation, selectedTimeframe, selectedContentType])

  const loadFeedItems = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true)
        setPage(0)
      } else {
        setLoadingMore(true)
      }
      
      setError('')
      
      const currentPage = loadMore ? page : 0
      const limit = 10
      const offset = currentPage * limit
      
      // Fetch community posts
      let communityPostsQuery = supabase.rpc('get_community_posts_with_interactions', {
        p_user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        p_limit: limit,
        p_offset: offset
      })
      
      // Apply filters to community posts query
      if (selectedTimeframe !== 'all') {
        const days = selectedTimeframe === 'today' ? 1 : 
                    selectedTimeframe === 'week' ? 7 : 
                    selectedTimeframe === 'month' ? 30 : 365
        
        communityPostsQuery = supabase.rpc('get_community_posts_by_timeframe', {
          p_user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          p_days: days,
          p_limit: limit,
          p_offset: offset
        })
      }
      
      if (selectedLocation) {
        communityPostsQuery = supabase.rpc('get_community_posts_by_location', {
          p_user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          p_location: selectedLocation,
          p_limit: limit,
          p_offset: offset
        })
      }
      
      if (searchQuery) {
        communityPostsQuery = supabase.rpc('search_community_posts', {
          p_user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          p_query: searchQuery,
          p_limit: limit,
          p_offset: offset
        })
      }
      
      const { data: communityPosts, error: communityPostsError } = await communityPostsQuery
      
      if (communityPostsError) {
        throw communityPostsError
      }
      
      // Format community posts
      const formattedCommunityPosts: CommunityPost[] = (communityPosts || []).map(post => ({
        ...post,
        type: 'community_post'
      }))
      
      // Initialize combined feed with community posts
      let combinedFeed: FeedItem[] = [...formattedCommunityPosts]
      
      // Only fetch other content types if not filtering to community posts only
      if (selectedContentType === 'all' || selectedContentType === 'ideas') {
        // Fetch ideas
        const ideas = await getIdeas(limit, offset, user?.id)
        const formattedIdeas = ideas.map(idea => ({ ...idea, type: 'idea' as const }))
        combinedFeed = [...combinedFeed, ...formattedIdeas]
      }
      
      if (selectedContentType === 'all' || selectedContentType === 'referral_jobs') {
        // Fetch referral jobs
        const referralJobs = await getReferralJobs(limit, offset, user?.id)
        const formattedReferralJobs = referralJobs.map(job => ({ ...job, type: 'referral_job' as const }))
        combinedFeed = [...combinedFeed, ...formattedReferralJobs]
      }
      
      if (selectedContentType === 'all' || selectedContentType === 'tools') {
        // Fetch tools
        const tools = await getTools(limit, offset)
        const formattedTools = tools.map(tool => ({ ...tool, type: 'tool' as const }))
        combinedFeed = [...combinedFeed, ...formattedTools]
      }
      
      // Apply search filter to all items if needed
      if (searchQuery) {
        combinedFeed = combinedFeed.filter(item => {
          if (item.type === 'community_post') {
            // Community posts are already filtered by the RPC function
            return true
          } else if (item.type === 'idea') {
            return (
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            )
          } else if (item.type === 'referral_job') {
            return (
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
          } else if (item.type === 'tool') {
            return (
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            )
          }
          return false
        })
      }
      
      // Apply location filter to all items if needed
      if (selectedLocation) {
        combinedFeed = combinedFeed.filter(item => {
          if (item.type === 'community_post') {
            // Community posts are already filtered by the RPC function
            return true
          } else {
            return item.location && item.location.toLowerCase().includes(selectedLocation.toLowerCase())
          }
        })
      }
      
      // Apply timeframe filter to all items if needed
      if (selectedTimeframe !== 'all') {
        const cutoffDate = new Date()
        const days = selectedTimeframe === 'today' ? 1 : 
                    selectedTimeframe === 'week' ? 7 : 
                    selectedTimeframe === 'month' ? 30 : 365
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        combinedFeed = combinedFeed.filter(item => {
          if (item.type === 'community_post') {
            // Community posts are already filtered by the RPC function
            return true
          } else {
            return new Date(item.created_at) >= cutoffDate
          }
        })
      }
      
      // Sort by creation date (newest first)
      combinedFeed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      // Insert ads every 4 items
      const feedWithAds: FeedItem[] = []
      let adIndex = 0
      
      combinedFeed.forEach((item, index) => {
        feedWithAds.push(item)
        
        // Insert an ad after every 4th item
        if ((index + 1) % 4 === 0 && adIndex < promotionAds.length) {
          feedWithAds.push(promotionAds[adIndex])
          adIndex = (adIndex + 1) % promotionAds.length
        }
      })
      
      // Update state
      if (loadMore) {
        setFeedItems(prev => [...prev, ...feedWithAds])
      } else {
        setFeedItems(feedWithAds)
      }
      
      // Check if there are more items to load
      setHasMore(combinedFeed.length >= limit)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Error loading feed items:', err)
      setError('Failed to load feed items. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadRightColumnData = async () => {
    try {
      setLoadingRightColumn(true)
      
      // Fetch recent ideas (limit to 3)
      const ideas = await getIdeas(3, 0, user?.id)
      setRecentIdeas(ideas)
      
      // Fetch top referral jobs (limit to 3)
      const referralJobs = await getReferralJobs(3, 0, user?.id)
      setTopReferralJobs(referralJobs)
      
      // Fetch featured tools (limit to 3)
      const tools = await getTools(3, 0)
      setFeaturedTools(tools)
    } catch (err) {
      console.error('Error loading right column data:', err)
    } finally {
      setLoadingRightColumn(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeedItems(true)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPostError('Image size must be less than 5MB')
      return
    }
    
    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePostSubmit = async () => {
    if (!user) {
      setPostError('You must be logged in to post')
      return
    }
    
    if (!newPostContent.trim() && !selectedImage) {
      setPostError('Please enter some content or add an image')
      return
    }
    
    setPostingContent(true)
    setPostError('')
    
    try {
      let imageUrl = null
      
      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true)
        
        const fileExt = selectedImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `community-posts/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(filePath, selectedImage)
        
        if (uploadError) {
          throw uploadError
        }
        
        const { data } = supabase.storage
          .from('community-images')
          .getPublicUrl(filePath)
        
        imageUrl = data.publicUrl
        setUploadingImage(false)
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
          id, 
          user_id, 
          content, 
          image_url, 
          video_url, 
          location, 
          likes, 
          comments_count, 
          created_at, 
          updated_at
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      // Get user profile for the new post
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('name, avatar_url, user_type')
        .eq('id', user.id)
        .single()
      
      // Add the new post to the feed
      const newPost: CommunityPost = {
        ...data,
        user_name: userProfile?.name || user.user_metadata?.name || 'Anonymous',
        user_avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url,
        user_type: userProfile?.user_type || user.user_metadata?.user_type,
        liked_by_user: false,
        type: 'community_post'
      }
      
      setFeedItems(prev => [newPost, ...prev])
      
      // Reset form
      setNewPostContent('')
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error('Error creating post:', err)
      setPostError(err.message || 'Failed to create post. Please try again.')
    } finally {
      setPostingContent(false)
    }
  }

  const handleLikePost = async (item: FeedItem) => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    try {
      if (item.type === 'community_post') {
        // Like/unlike community post
        const { error } = await supabase.rpc('toggle_community_post_like', {
          p_user_id: user.id,
          p_post_id: item.id
        })
        
        if (error) throw error
        
        // Update state optimistically
        setFeedItems(prev => prev.map(feedItem => 
          feedItem.id === item.id && feedItem.type === 'community_post'
            ? { 
                ...feedItem, 
                liked_by_user: !feedItem.liked_by_user,
                likes: feedItem.liked_by_user ? feedItem.likes - 1 : feedItem.likes + 1
              }
            : feedItem
        ))
      } else if (item.type === 'idea') {
        // Navigate to idea detail page
        navigate(`/dashboard/ideas/${item.id}`)
      } else if (item.type === 'referral_job') {
        // Navigate to referral job detail page
        navigate(`/dashboard/referral-jobs/${item.id}`)
      } else if (item.type === 'tool') {
        // Navigate to tool detail page (or tools list for now)
        navigate('/dashboard/starter-tools')
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCommentClick = (item: FeedItem) => {
    if (item.type === 'community_post') {
      // TODO: Implement comment modal or expand comments section
      console.log('Comment on community post:', item.id)
    } else if (item.type === 'idea') {
      navigate(`/dashboard/ideas/${item.id}`)
    } else if (item.type === 'referral_job') {
      navigate(`/dashboard/referral-jobs/${item.id}`)
    } else if (item.type === 'tool') {
      navigate('/dashboard/starter-tools')
    }
  }

  const handleShareClick = (item: FeedItem) => {
    // TODO: Implement share functionality
    console.log('Share item:', item.id, item.type)
  }

  const handleItemClick = async (item: FeedItem) => {
    if (item.type === 'promotion') {
      // Handle promotion click
      if (item.link_url) {
        window.open(item.link_url, '_blank')
      }
      return
    }
    
    // Track promotion click if this is promoted content
    if (item.is_promoted) {
      try {
        const promotion = await getActivePromotionForContent(item.id, item.type)
        if (promotion) {
          await incrementPromotionClicks(promotion.id)
        }
      } catch (error) {
        console.error('Error tracking promotion click:', error)
      }
    }
    
    // Navigate based on content type
    if (item.type === 'idea') {
      navigate(`/dashboard/ideas/${item.id}`)
    } else if (item.type === 'referral_job') {
      navigate(`/dashboard/referral-jobs/${item.id}`)
    } else if (item.type === 'tool') {
      navigate('/dashboard/starter-tools')
    } else if (item.type === 'community_post') {
      // For community posts, we might expand the post in-place or show a modal
      // For now, we'll just log it
      console.log('View community post details:', item.id)
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
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return date.toLocaleDateString()
  }

  const getItemIcon = (item: FeedItem) => {
    switch (item.type) {
      case 'idea':
        return <Lightbulb className="h-5 w-5 text-green-500" />
      case 'referral_job':
        return <Building className="h-5 w-5 text-blue-500" />
      case 'tool':
        return <Wrench className="h-5 w-5 text-purple-500" />
      case 'community_post':
        return <MessageSquare className="h-5 w-5 text-gray-500" />
      case 'promotion':
        return <DollarSign className="h-5 w-5 text-yellow-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  }

  const getItemTitle = (item: FeedItem) => {
    switch (item.type) {
      case 'idea':
        return item.title
      case 'referral_job':
        return item.title
      case 'tool':
        return item.title
      case 'community_post':
        return `${item.user_name} posted`
      case 'promotion':
        return item.title
      default:
        return 'Untitled'
    }
  }

  const getItemSubtitle = (item: FeedItem) => {
    switch (item.type) {
      case 'idea':
        return item.category
      case 'referral_job':
        return item.business_name
      case 'tool':
        return item.category
      case 'community_post':
        return item.user_type || 'Community Member'
      case 'promotion':
        return item.business_name || 'Sponsored'
      default:
        return ''
    }
  }

  const getItemContent = (item: FeedItem) => {
    switch (item.type) {
      case 'idea':
        return item.description.length > 300 
          ? item.description.substring(0, 300) + '...' 
          : item.description
      case 'referral_job':
        return item.description.length > 300 
          ? item.description.substring(0, 300) + '...' 
          : item.description
      case 'tool':
        return item.description.length > 300 
          ? item.description.substring(0, 300) + '...' 
          : item.description
      case 'community_post':
        return item.content
      case 'promotion':
        return item.description
      default:
        return ''
    }
  }

  const getItemImage = (item: FeedItem) => {
    switch (item.type) {
      case 'idea':
        return item.thumbnail_url || item.cover_image_url
      case 'referral_job':
        return item.logo_url
      case 'tool':
        // Tools don't have images in our current schema
        return null
      case 'community_post':
        return item.image_url
      case 'promotion':
        return item.image_url
      default:
        return null
    }
  }

  const getItemLocation = (item: FeedItem) => {
    if ('location' in item && item.location) {
      return item.location
    }
    return null
  }

  const getItemLikes = (item: FeedItem) => {
    if ('likes' in item) {
      return item.likes || 0
    }
    return 0
  }

  const getItemComments = (item: FeedItem) => {
    if (item.type === 'community_post') {
      return item.comments_count || 0
    }
    return 0
  }

  const isItemLiked = (item: FeedItem) => {
    if ('liked_by_user' in item) {
      return item.liked_by_user || false
    }
    return false
  }

  const getItemPromotionBadge = (item: FeedItem) => {
    if (item.type === 'promotion') {
      return (
        <div className="text-xs text-gray-500 font-medium flex items-center">
          <span>Sponsored</span>
        </div>
      )
    }
    
    if (item.is_promoted) {
      return (
        <div className="text-xs text-yellow-600 font-medium flex items-center">
          <span>Featured</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Newsfeed */}
          <div className="lg:w-2/3">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex space-x-3">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
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
                    className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                  />
                  
                  {imagePreview && (
                    <div className="relative mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-40 rounded-lg object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {postError && (
                    <div className="text-red-500 text-sm mb-2">{postError}</div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        title="Add Image"
                      >
                        <Image className="h-5 w-5" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <button
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        title="Add Location"
                      >
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handlePostSubmit}
                      disabled={postingContent || (!newPostContent.trim() && !selectedImage)}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                    >
                      {postingContent ? (
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
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">All Locations</option>
                      <option value="New York">New York</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Houston">Houston</option>
                      <option value="Phoenix">Phoenix</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                    <select
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Content</option>
                      <option value="community_post">Community Posts</option>
                      <option value="ideas">Ideas</option>
                      <option value="referral_jobs">Referral Jobs</option>
                      <option value="tools">Tools</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feed Items */}
            {loading ? (
              <div className="text-center py-8">
                <Loader className="h-8 w-8 animate-spin mx-auto text-green-500" />
                <p className="mt-2 text-gray-600">Loading feed...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedLocation || selectedTimeframe !== 'all' || selectedContentType !== 'all'
                    ? 'No posts match your filters. Try adjusting your search criteria.'
                    : 'Be the first to post in your community!'}
                </p>
                {(searchQuery || selectedLocation || selectedTimeframe !== 'all' || selectedContentType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedLocation('')
                      setSelectedTimeframe('all')
                      setSelectedContentType('all')
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {feedItems.map((item, index) => (
                  <div 
                    key={`${item.type}-${item.id}-${index}`}
                    className={`bg-white rounded-lg shadow overflow-hidden ${
                      item.type === 'promotion' ? 'border-2 border-yellow-200' : ''
                    }`}
                  >
                    {/* Post Header */}
                    <div className="p-4 flex justify-between items-start">
                      <div className="flex space-x-3">
                        {/* User Avatar or Content Type Icon */}
                        <div className="flex-shrink-0">
                          {item.type === 'community_post' && item.user_avatar_url ? (
                            <img 
                              src={item.user_avatar_url} 
                              alt={item.user_name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : item.type === 'referral_job' && item.logo_url ? (
                            <img 
                              src={item.logo_url} 
                              alt={item.business_name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                              {getItemIcon(item)}
                            </div>
                          )}
                        </div>
                        
                        {/* Post Info */}
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900">
                              {getItemTitle(item)}
                            </h3>
                            {getItemPromotionBadge(item)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <span>{getItemSubtitle(item)}</span>
                            
                            {item.type !== 'promotion' && (
                              <>
                                <span>•</span>
                                <span>{formatTimeAgo(item.created_at)}</span>
                              </>
                            )}
                            
                            {getItemLocation(item) && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{getItemLocation(item)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Post Content */}
                    <div 
                      className="px-4 pb-3 cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <p className="text-gray-800 whitespace-pre-line mb-3">
                        {getItemContent(item)}
                      </p>
                      
                      {/* Post Image */}
                      {getItemImage(item) && (
                        <div className="mb-3">
                          <img 
                            src={getItemImage(item)!} 
                            alt="Post content" 
                            className="w-full h-auto rounded-lg object-cover max-h-96"
                          />
                        </div>
                      )}
                      
                      {/* Special content for referral jobs */}
                      {item.type === 'referral_job' && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-700 font-medium">
                                {item.commission_type === 'percentage' 
                                  ? `${item.commission}% Commission` 
                                  : `$${item.commission} Commission`}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.urgency === 'high' ? 'bg-red-100 text-red-800' :
                                item.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.urgency} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Special content for tools */}
                      {item.type === 'tool' && (
                        <div className="bg-purple-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Wrench className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-700 font-medium">
                                {item.type} Tool
                              </span>
                            </div>
                            
                            {item.price > 0 ? (
                              <div className="text-green-600 font-semibold">
                                ${item.price}
                              </div>
                            ) : (
                              <div className="text-green-600 font-semibold">
                                Free
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Special content for ideas */}
                      {item.type === 'idea' && item.price > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Lightbulb className="h-4 w-4 text-green-600" />
                              <span className="text-green-700 font-medium">
                                Premium Idea
                              </span>
                            </div>
                            
                            <div className="text-green-600 font-semibold">
                              ${item.price}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Post Actions */}
                    <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
                      <button 
                        onClick={() => handleLikePost(item)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
                          isItemLiked(item) 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isItemLiked(item) ? 'fill-current' : ''}`} />
                        <span>{getItemLikes(item)}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleCommentClick(item)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{getItemComments(item)}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShareClick(item)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-500 hover:text-green-500 hover:bg-gray-100"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg shadow-sm"
                    >
                      {loadingMore ? (
                        <div className="flex items-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Loading more...</span>
                        </div>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Curated Content */}
          <div className="lg:w-1/3 space-y-6">
            {/* Recent Ideas */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Ideas</h3>
                <button 
                  onClick={() => navigate('/dashboard/ideas-vault')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {loadingRightColumn ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentIdeas.length === 0 ? (
                <div className="text-center py-4">
                  <Lightbulb className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No ideas yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentIdeas.map((idea) => (
                    <div 
                      key={idea.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => navigate(`/dashboard/ideas/${idea.id}`)}
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{idea.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{idea.category}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{idea.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => navigate('/dashboard/ideas-vault')}
                    className="w-full text-center text-green-600 hover:text-green-700 text-sm font-medium flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>Explore Ideas Vault</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Top Referral Jobs */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top Referral Jobs</h3>
                <button 
                  onClick={() => navigate('/dashboard/referral-jobs')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {loadingRightColumn ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : topReferralJobs.length === 0 ? (
                <div className="text-center py-4">
                  <Building className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No referral jobs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topReferralJobs.map((job) => (
                    <div 
                      key={job.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => navigate(`/dashboard/referral-jobs/${job.id}`)}
                    >
                      {job.logo_url ? (
                        <img 
                          src={job.logo_url} 
                          alt={job.business_name} 
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{job.business_name}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              {job.commission_type === 'percentage' 
                                ? `${job.commission}%` 
                                : `$${job.commission}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => navigate('/dashboard/referral-jobs')}
                    className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>Browse Referral Jobs</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Featured Tools */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Featured Tools</h3>
                <button 
                  onClick={() => navigate('/dashboard/starter-tools')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {loadingRightColumn ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredTools.length === 0 ? (
                <div className="text-center py-4">
                  <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tools yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => navigate('/dashboard/starter-tools')}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{tool.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{tool.category}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{tool.downloads_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => navigate('/dashboard/starter-tools')}
                    className="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>Explore Starter Tools</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Widget */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-700">Views</span>
                  </div>
                  <p className="text-xl font-bold text-green-800">0</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-700">Likes</span>
                  </div>
                  <p className="text-xl font-bold text-blue-800">0</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageSquare className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-purple-700">Comments</span>
                  </div>
                  <p className="text-xl font-bold text-purple-800">0</p>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-yellow-700">Referrals</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityNewsfeed