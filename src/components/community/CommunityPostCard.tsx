import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, User, X, Copy, Mail, Facebook, Twitter, Linkedin } from 'lucide-react'
import { likeCommunityPost, type CommunityPost } from '../../lib/database'
import { useAuth } from '../../contexts/AuthContext'

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

interface CommunityPostCardProps {
  post: CommunityPost
  onCommentClick: (postId: string) => void
  onPostUpdate: (updatedPost: CommunityPost) => void
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onCommentClick, onPostUpdate }) => {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    if (!user || isLiking) return
    
    setIsLiking(true)
    try {
      const success = await likeCommunityPost(post.id, user.id)
      if (success) {
        // Update the post in the parent component
        onPostUpdate({
          ...post,
          liked_by_user: !post.liked_by_user,
          likes: post.liked_by_user ? post.likes - 1 : post.likes + 1
        })
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleCommentClick = () => {
    onCommentClick(post.id)
  }

  const getUserTypeDisplay = (type?: string) => {
    if (!type) return ''
    
    const types = {
      'business-owner': 'Business Owner',
      'referrer': 'Referrer',
      'idea-creator': 'Idea Creator',
      'other': 'Community Member'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {post.user_profiles?.avatar_url ? (
            <img
              src={post.user_profiles.avatar_url}
              alt={post.user_profiles.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-medium text-gray-900"
                style={{ fontFamily: 'Inter' }}
              >
                {post.user_profiles?.name || 'Anonymous'}
              </h3>
              {post.user_profiles?.user_type && (
                <span className="text-xs text-gray-500">
                  • {getUserTypeDisplay(post.user_profiles.user_type)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
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
        </div>
        
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {user && post.user_id === user.id && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Post
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setShareModalOpen(true)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Share Post
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p 
          className="text-gray-800 whitespace-pre-line"
          style={{ fontFamily: 'Inter' }}
        >
          {post.content}
        </p>
      </div>
      
      {/* Post Image */}
      {post.image_url && (
        <div className="mb-3">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-96 object-contain bg-black"
          />
        </div>
      )}
      
      {/* Post Video */}
      {post.video_url && (
        <div className="mb-3">
          <video
            src={post.video_url}
            controls
            className="w-full max-h-96 object-contain bg-black"
          />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Heart className={`h-4 w-4 ${post.liked_by_user ? 'text-red-500 fill-current' : ''}`} />
            <span>{post.likes} likes</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count} comments</span>
          </div>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center justify-center space-x-2 flex-1 py-2 rounded-lg transition-colors ${
            post.liked_by_user 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>
        
        <button
          onClick={handleCommentClick}
          className="flex items-center justify-center space-x-2 flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Comment</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        post={post} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
    </div>
  )
}

export default CommunityPostCard