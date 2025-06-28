import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, X, Copy, Mail, Facebook, Twitter, Linkedin, User } from 'lucide-react'
import { likeCommunityPost, type CommunityPost, type Comment } from '../../lib/database'
import { useAuth } from '../../contexts/AuthContext'

interface CommunityPostCardProps {
  post: CommunityPost
  onCommentClick: (postId: string) => void
  onDeleteClick?: (postId: string) => void
}

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
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
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

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onCommentClick, onDeleteClick }) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.liked_by_user || false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  
  const isOwner = user && post.user_id === user.id

  const handleLike = async () => {
    if (!user) return
    
    try {
      const success = await likeCommunityPost(post.id, user.id)
      if (success) {
        // Update UI optimistically
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleDelete = () => {
    if (onDeleteClick && isOwner) {
      onDeleteClick(post.id)
    }
    setMenuOpen(false)
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
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4">
      {/* Post Header */}
      <div className="flex justify-between mb-3">
        <div className="flex items-center space-x-3">
          {post.user_profile?.avatar_url ? (
            <img
              src={post.user_profile.avatar_url}
              alt={post.user_profile.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
          
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                {post.user_profile?.name || 'Anonymous'}
              </h3>
              {post.user_profile?.user_type && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {post.user_profile.user_type.replace(/-/g, ' ')}
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>{formatTimeAgo(post.created_at)}</span>
              {post.location && (
                <>
                  <span className="mx-1">•</span>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-0.5" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Post menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete post
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(post.content)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Copy text
              </button>
              <button
                onClick={() => {
                  setShareModalOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Share post
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-800 whitespace-pre-line" style={{ fontFamily: 'Inter' }}>
          {post.content}
        </p>
      </div>
      
      {/* Post Image */}
      {post.image_url && (
        <div className="mb-3">
          <img
            src={post.image_url}
            alt="Post"
            className="rounded-lg max-h-96 w-full object-cover"
          />
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>
        
        <button
          onClick={() => onCommentClick(post.id)}
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-500 hover:text-blue-500 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments_count}</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-500 hover:text-green-500 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        post={shareModalOpen ? post : null} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
    </div>
  )
}

export default CommunityPostCard