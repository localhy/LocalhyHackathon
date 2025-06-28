import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, User, X, Copy, Mail, Facebook, Twitter, Linkedin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { likeCommunityPost, type CommunityPost } from '../lib/database'
import { useAuth } from '../contexts/AuthContext'

// Share modal component
const ShareModal = ({ post, isVisible, onClose }: { post: CommunityPost | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!post || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/community?post=${post.id}`
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

interface CommunityPostCardProps {
  post: CommunityPost
  onCommentClick?: (postId: string) => void
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onCommentClick }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(post.liked_by_user || false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

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

  const handleLike = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    try {
      const success = await likeCommunityPost(post.id, user.id)
      if (success) {
        if (isLiked) {
          setLikeCount(prev => prev - 1)
        } else {
          setLikeCount(prev => prev + 1)
        }
        setIsLiked(!isLiked)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick(post.id)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowOptions(!showOptions)
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Navigate to user profile
    // navigate(`/dashboard/profile/${post.user_id}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3" onClick={handleUserClick}>
          {post.user_profile?.avatar_url ? (
            <img 
              src={post.user_profile.avatar_url} 
              alt={post.user_profile.name || 'User'} 
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
          
          <div>
            <div className="font-medium text-gray-900 cursor-pointer">
              {post.user_profile?.name || 'Anonymous'}
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
        
        <div className="relative">
          <button 
            onClick={handleOptionsClick}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowOptions(false)
                    // Report post functionality
                  }}
                >
                  Report post
                </button>
                {user && post.user_id === user.id && (
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      setShowOptions(false)
                      // Delete post functionality
                    }}
                  >
                    Delete post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-line">
          {post.content}
        </p>
      </div>
      
      {/* Post Image (if any) */}
      {post.image_url && (
        <div className="mb-3">
          <img 
            src={post.image_url} 
            alt="Post" 
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}
      
      {/* Post Video (if any) */}
      {post.video_url && (
        <div className="mb-3">
          <video 
            src={post.video_url} 
            controls 
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <div>
          {likeCount > 0 && (
            <span className="flex items-center">
              <Heart className="h-3 w-3 text-red-500 mr-1 fill-current" />
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
          )}
        </div>
        <div>
          {post.comments_count > 0 && (
            <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
        <button 
          onClick={handleLike}
          className={`flex items-center justify-center space-x-1 px-4 py-2 rounded-md transition-colors ${
            isLiked 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>
        
        <button 
          onClick={handleCommentClick}
          className="flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Comment</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        post={post} 
        isVisible={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
    </div>
  )
}

export default CommunityPostCard