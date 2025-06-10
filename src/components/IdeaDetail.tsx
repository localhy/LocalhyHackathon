import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, User, Calendar, MapPin, Tag, DollarSign, Send, X, Copy, Mail, Facebook, Twitter, Linkedin, Phone, ExternalLink, ThumbsUp, Reply, MoreVertical, Flag, AlertCircle, Check, Loader } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getIdeaById, getUserProfile, createMessage, getIdeaComments, createComment, likeComment, reportComment, type Idea } from '../lib/database'

// Comment interface
interface Comment {
  id: string
  user_id: string
  content: string
  likes: number
  replies: Comment[]
  created_at: string
  user_profile?: {
    name: string
    avatar_url?: string
    user_type: string
  }
  liked_by_user: boolean
}

// Share modal component
const ShareModal = ({ idea, isVisible, onClose }: { idea: Idea | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!idea || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/ideas/${idea.id}`
  const shareText = `Check out this business idea: ${idea.title}`

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
            Share Idea
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
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

// Message modal component
const MessageModal = ({ idea, isVisible, onClose }: { idea: Idea | null, isVisible: boolean, onClose: () => void }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!idea || !isVisible) return null

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    setSending(true)
    setError('')
    
    try {
      const result = await createMessage({
        sender_id: user.id,
        recipient_id: idea.user_id,
        content: message,
        subject: `Message about: ${idea.title}`
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
            Message Author
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
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h4>
            <p className="text-gray-600">Your message has been sent to the author.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                {idea.user_profiles?.avatar_url ? (
                  <img
                    src={idea.user_profiles.avatar_url}
                    alt={idea.user_profiles.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{idea.user_profiles?.name || 'Anonymous'}</h4>
                  <p className="text-sm text-gray-500">Author of "{idea.title}"</p>
                </div>
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
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Hi! I'm interested in your business idea..."
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
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
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

// Comment component
const CommentComponent = ({ comment, onReply, onLike, onReport, depth = 0 }: {
  comment: Comment
  onReply: (commentId: string, content: string) => void
  onLike: (commentId: string) => void
  onReport: (commentId: string) => void
  depth?: number
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
    }
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
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex space-x-3 mb-4">
        {comment.user_profile?.avatar_url ? (
          <img
            src={comment.user_profile.avatar_url}
            alt={comment.user_profile.name || 'User'}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Inter' }}>
              {comment.user_profile?.name || 'Anonymous'}
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {comment.user_profile?.user_type?.replace('-', ' ') || 'member'}
            </span>
            <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
            
            <div className="relative ml-auto">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      onReport(comment.id)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-3 leading-relaxed" style={{ fontFamily: 'Inter' }}>
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                comment.liked_by_user 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
              <span>{comment.likes}</span>
            </button>
            
            {depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3 space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                placeholder="Write a reply..."
                style={{ fontFamily: 'Inter' }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 disabled:bg-gray-300"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent('')
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onReport={onReport}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  
  // Author profile state
  const [authorProfile, setAuthorProfile] = useState<any>(null)
  const [loadingAuthor, setLoadingAuthor] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    const loadIdea = async () => {
      if (!id) {
        setError('Invalid idea ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedIdea = await getIdeaById(id)
        if (fetchedIdea) {
          setIdea(fetchedIdea)
          // Load author profile and comments
          loadAuthorProfile(fetchedIdea.user_id)
          loadComments(fetchedIdea.id)
        } else {
          setError('Idea not found')
        }
      } catch (err) {
        console.error('Error loading idea:', err)
        setError('Failed to load idea. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadIdea()
  }, [id])

  const loadAuthorProfile = async (userId: string) => {
    setLoadingAuthor(true)
    try {
      const profile = await getUserProfile(userId)
      setAuthorProfile(profile)
    } catch (error) {
      console.error('Error loading author profile:', error)
    } finally {
      setLoadingAuthor(false)
    }
  }

  const loadComments = async (ideaId: string) => {
    setCommentsLoading(true)
    try {
      const ideaComments = await getIdeaComments(ideaId)
      setComments(ideaComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setCommentsLoading(false)
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
        navigate('/dashboard/create-new?tab=idea')
        break
      case 'tool-submission':
        navigate('/dashboard/tool-submission')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleLike = async () => {
    if (!user || !idea) return
    
    try {
      // TODO: Implement actual like functionality with database
      setLiked(!liked)
      // Update idea likes count optimistically
      setIdea(prev => prev ? {
        ...prev,
        likes: liked ? prev.likes - 1 : prev.likes + 1
      } : null)
    } catch (error) {
      console.error('Error liking idea:', error)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleMessage = () => {
    setMessageModalOpen(true)
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || !user || !idea) return

    setPostingComment(true)
    try {
      const comment = await createComment({
        idea_id: idea.id,
        user_id: user.id,
        content: newComment,
        parent_id: null
      })

      if (comment) {
        // Reload comments to get the new one
        await loadComments(idea.id)
        setNewComment('')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setPostingComment(false)
    }
  }

  const handleReplyToComment = async (commentId: string, content: string) => {
    if (!user || !idea) return

    try {
      const reply = await createComment({
        idea_id: idea.id,
        user_id: user.id,
        content,
        parent_id: commentId
      })

      if (reply) {
        // Reload comments to get the new reply
        await loadComments(idea.id)
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return

    try {
      await likeComment(commentId, user.id)
      // Reload comments to get updated like counts
      if (idea) {
        await loadComments(idea.id)
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleReportComment = async (commentId: string) => {
    if (!user) return

    try {
      await reportComment(commentId, user.id)
      alert('Comment reported. Thank you for helping keep our community safe.')
    } catch (error) {
      console.error('Error reporting comment:', error)
      alert('Failed to report comment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="ideas-vault"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="ideas-vault"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Idea not found'}
              </h2>
              <button
                onClick={() => navigate('/dashboard/ideas-vault')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to Ideas Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="ideas-vault"
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Hero Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden">
            {idea.cover_image_url ? (
              <img
                src={idea.cover_image_url}
                alt={idea.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium text-lg">
                    {idea.category}
                  </p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/ideas-vault')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Price badge */}
            {idea.price > 0 && (
              <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                ${idea.price}
              </div>
            )}
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {idea.category}
                </span>
              </div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'Montserrat' }}
              >
                {idea.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Article Content */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  {/* Problem Summary */}
                  {idea.problem_summary && (
                    <div className="mb-8">
                      <h2 
                        className="text-xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        The Problem
                      </h2>
                      <p 
                        className="text-gray-700 leading-relaxed"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {idea.problem_summary}
                      </p>
                    </div>
                  )}

                  {/* Solution Overview */}
                  {idea.solution_overview && (
                    <div className="mb-8">
                      <h2 
                        className="text-xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        The Solution
                      </h2>
                      <p 
                        className="text-gray-700 leading-relaxed"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {idea.solution_overview}
                      </p>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="mb-8">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Detailed Overview
                    </h2>
                    <div 
                      className="prose prose-gray max-w-none"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {idea.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 
                        className="text-lg font-semibold text-gray-900 mb-3"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                          >
                            <Tag className="h-3 w-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Comments ({comments.length})
                  </h2>
                  
                  {/* Post new comment */}
                  {user && (
                    <div className="mb-8 pb-6 border-b border-gray-200">
                      <div className="flex space-x-3">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Your avatar"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                            placeholder="Share your thoughts about this idea..."
                            style={{ fontFamily: 'Inter' }}
                          />
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={handlePostComment}
                              disabled={!newComment.trim() || postingComment}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center space-x-2"
                            >
                              {postingComment ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span>Posting...</span>
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="h-4 w-4" />
                                  <span>Post Comment</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Comments list */}
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <CommentComponent
                          key={comment.id}
                          comment={comment}
                          onReply={handleReplyToComment}
                          onLike={handleLikeComment}
                          onReport={handleReportComment}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p 
                        className="text-gray-500 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No comments yet
                      </p>
                      <p 
                        className="text-gray-400 text-sm"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* About the Author */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    About the Author
                  </h3>
                  
                  {loadingAuthor ? (
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        {idea.user_profiles?.avatar_url ? (
                          <img
                            src={idea.user_profiles.avatar_url}
                            alt={idea.user_profiles.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 
                            className="font-semibold text-gray-900"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {idea.user_profiles?.name || 'Anonymous'}
                          </h4>
                          <p 
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {idea.user_profiles?.user_type?.replace('-', ' ') || 'Community Member'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bio */}
                      {authorProfile?.bio ? (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Inter' }}>
                            Bio
                          </h5>
                          <p 
                            className="text-gray-600 text-sm leading-relaxed"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {authorProfile.bio}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p 
                            className="text-gray-500 text-sm italic"
                            style={{ fontFamily: 'Inter' }}
                          >
                            No bio available
                          </p>
                        </div>
                      )}
                      
                      {/* Contact information */}
                      <div className="space-y-3 mb-4">
                        {authorProfile?.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{authorProfile.location}</span>
                          </div>
                        )}
                        
                        {/* Social media placeholders - these would come from profile */}
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Contact info not provided</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Social links not provided</span>
                        </div>
                      </div>
                      
                      {/* Message Author Button */}
                      {idea.user_id !== user?.id && (
                        <button
                          onClick={handleMessage}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Message Author</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Idea Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Idea Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Views</span>
                      </div>
                      <span className="font-semibold text-gray-900">{idea.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Likes</span>
                      </div>
                      <span className="font-semibold text-gray-900">{idea.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Comments</span>
                      </div>
                      <span className="font-semibold text-gray-900">{comments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Published</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatDate(idea.created_at)}</span>
                    </div>
                    {idea.price > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Price</span>
                        </div>
                        <span className="font-semibold text-green-600">${idea.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    <button 
                      onClick={handleLike}
                      className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                        liked 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      <span>{liked ? 'Liked' : 'Like this Idea'}</span>
                    </button>
                    <button 
                      onClick={handleShare}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        idea={idea} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
      
      <MessageModal 
        idea={idea} 
        isVisible={messageModalOpen} 
        onClose={() => setMessageModalOpen(false)} 
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

export default IdeaDetail