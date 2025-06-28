import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Send, X, Copy, Mail, Facebook, Twitter, Linkedin, User, Tag, MapPin, Lock, CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getIdeaById, 
  likeIdea, 
  bookmarkIdea, 
  getCommentsByContent, 
  createComment, 
  likeComment,
  hasUserPurchasedContent,
  purchaseContent,
  getUserCredits,
  type Idea, 
  type Comment 
} from '../lib/database'
import { BASE_URL } from '../lib/config'

// Share modal component
const ShareModal = ({ idea, isVisible, onClose }: { idea: Idea | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!idea || !isVisible) return null

  const shareUrl = `${BASE_URL}/dashboard/ideas/${idea.id}`
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

// Paywall overlay component
const PaywallOverlay = ({ 
  idea, 
  userCredits, 
  onPurchase, 
  purchasing, 
  error 
}: { 
  idea: Idea
  userCredits: number
  onPurchase: () => void
  purchasing: boolean
  error: string
}) => {
  const navigate = useNavigate()
  const canAfford = userCredits >= idea.price

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Premium Content
          </h3>
          
          <p 
            className="text-gray-600 mb-6"
            style={{ fontFamily: 'Inter' }}
          >
            This idea contains premium content that requires {idea.price} credits to unlock.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Credits:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits} credits
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Required:</span>
              <span className="font-semibold text-gray-900">{idea.price} credits</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {canAfford ? (
              <button
                onClick={onPurchase}
                disabled={purchasing}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2"
                style={{ fontFamily: 'Inter' }}
              >
                {purchasing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Unlock for {idea.price} Credits</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 text-sm font-medium">
                  Insufficient credits. You need {idea.price - userCredits} more credits.
                </p>
                <button
                  onClick={() => navigate('/dashboard/wallet?tab=purchase')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Buy More Credits</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Credits are used to unlock premium content and support creators
          </p>
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
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  
  // Paywall states
  const [userCredits, setUserCredits] = useState(0)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [checkingPurchase, setCheckingPurchase] = useState(true)

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
          
          // Load comments
          const ideaComments = await getCommentsByContent(fetchedIdea.id, 'idea', user?.id)
          setComments(ideaComments)
          
          // Check if user has purchased this content (if it's paid)
          if (user && fetchedIdea.price > 0) {
            setCheckingPurchase(true)
            const [purchased, credits] = await Promise.all([
              hasUserPurchasedContent(user.id, fetchedIdea.id, 'idea'),
              getUserCredits(user.id)
            ])
            setHasPurchased(purchased)
            setUserCredits(credits.cashCredits + credits.purchasedCredits)
            setCheckingPurchase(false)
          } else {
            setCheckingPurchase(false)
          }
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
  }, [id, user])

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
        navigate('/dashboard/community')
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

  const handleLike = async () => {
    if (!idea || !user) return

    try {
      const success = await likeIdea(idea.id, user.id)
      if (success) {
        setIdea(prev => prev ? {
          ...prev,
          liked_by_user: !prev.liked_by_user,
          likes: prev.liked_by_user ? prev.likes - 1 : prev.likes + 1
        } : null)
      }
    } catch (error) {
      console.error('Error liking idea:', error)
    }
  }

  const handleBookmark = async () => {
    if (!idea || !user) return

    try {
      const success = await bookmarkIdea(idea.id, user.id)
      if (success) {
        setIdea(prev => prev ? {
          ...prev,
          bookmarked_by_user: !prev.bookmarked_by_user
        } : null)
      }
    } catch (error) {
      console.error('Error bookmarking idea:', error)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handlePurchase = async () => {
    if (!idea || !user || purchasing) return

    setPurchasing(true)
    setPurchaseError('')

    try {
      const result = await purchaseContent(
        user.id,
        idea.user_id,
        idea.id,
        'idea',
        idea.price
      )

      if (result) {
        setHasPurchased(true)
        setUserCredits(prev => prev - idea.price)
        // Show success message
        setPurchaseError('')
      } else {
        throw new Error('Purchase failed')
      }
    } catch (error: any) {
      console.error('Error purchasing content:', error)
      setPurchaseError(error.message || 'Failed to purchase content. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !idea || !user || submittingComment) return

    setSubmittingComment(true)
    try {
      const comment = await createComment({
        content_id: idea.id,
        content_type: 'idea',
        user_id: user.id,
        content: newComment.trim()
      })

      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) return

    try {
      const success = await likeComment(commentId, user.id)
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

  // Check if content should be locked
  const isContentLocked = idea && idea.price > 0 && user && idea.user_id !== user.id && !hasPurchased
  const isOwner = idea && user && idea.user_id === user.id

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
              <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center space-x-1">
                <Lock className="h-4 w-4" />
                <span>${idea.price}</span>
              </div>
            )}
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                {idea.category}
              </span>
              <h1 
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {idea.title}
              </h1>
              {idea.location && (
                <div className="flex items-center text-white/90 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{idea.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Problem Summary - Always visible */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
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
                    {idea.problem_summary || idea.description.substring(0, 200) + '...'}
                  </p>
                </div>

                {/* Solution Overview - Always visible */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
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
                    {idea.solution_overview || idea.description.substring(200, 400) + '...'}
                  </p>
                </div>

                {/* Main Content - Potentially locked */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 relative">
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Detailed Overview
                  </h2>
                  
                  {isContentLocked && !checkingPurchase ? (
                    <PaywallOverlay
                      idea={idea}
                      userCredits={userCredits}
                      onPurchase={handlePurchase}
                      purchasing={purchasing}
                      error={purchaseError}
                    />
                  ) : null}
                  
                  <div 
                    className={`prose prose-gray max-w-none ${isContentLocked ? 'blur-sm' : ''}`}
                    style={{ fontFamily: 'Inter' }}
                  >
                    {idea.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Tags - Potentially locked */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 relative">
                    {isContentLocked && !checkingPurchase ? (
                      <PaywallOverlay
                        idea={idea}
                        userCredits={userCredits}
                        onPurchase={handlePurchase}
                        purchasing={purchasing}
                        error={purchaseError}
                      />
                    ) : null}
                    
                    <h3 
                      className={`text-lg font-semibold text-gray-900 mb-4 ${isContentLocked ? 'blur-sm' : ''}`}
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Tags
                    </h3>
                    <div className={`flex flex-wrap gap-2 ${isContentLocked ? 'blur-sm' : ''}`}>
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <Tag className="h-3 w-3" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section - Potentially locked */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 relative">
                  {isContentLocked && !checkingPurchase ? (
                    <PaywallOverlay
                      idea={idea}
                      userCredits={userCredits}
                      onPurchase={handlePurchase}
                      purchasing={purchasing}
                      error={purchaseError}
                    />
                  ) : null}
                  
                  <h3 
                    className={`text-lg font-semibold text-gray-900 mb-6 ${isContentLocked ? 'blur-sm' : ''}`}
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Comments ({comments.length})
                  </h3>

                  {/* Comment Form */}
                  {user && !isContentLocked && (
                    <div className="mb-6">
                      <div className="flex space-x-3">
                        {user.user_metadata?.avatar_url ? (
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
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                            style={{ fontFamily: 'Inter' }}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={handleSubmitComment}
                              disabled={!newComment.trim() || submittingComment}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                            >
                              {submittingComment ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              <span>Comment</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className={`space-y-6 ${isContentLocked ? 'blur-sm' : ''}`}>
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      comments.map((comment) => (
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
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Author Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    About the Creator
                  </h3>
                  <div className="flex items-center space-x-3 mb-4">
                    {idea.user_profiles?.avatar_url ? (
                      <img
                        src={idea.user_profiles.avatar_url}
                        alt={idea.user_profiles.name || 'Creator'}
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
                        {idea.user_profiles?.name || 'Anonymous Creator'}
                      </h4>
                      <p 
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {idea.user_profiles?.user_type || 'Community Member'}
                      </p>
                    </div>
                  </div>
                  {idea.user_profiles?.bio && (
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {idea.user_profiles.bio}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="font-semibold text-gray-900">{idea.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="font-semibold text-gray-900">{idea.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Comments</span>
                      <span className="font-semibold text-gray-900">{comments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Posted</span>
                      <span className="font-semibold text-gray-900">{formatDate(idea.created_at)}</span>
                    </div>
                    {idea.price > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price</span>
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
                        idea.liked_by_user 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${idea.liked_by_user ? 'fill-current' : ''}`} />
                      <span>{idea.liked_by_user ? 'Liked' : 'Like'} ({idea.likes})</span>
                    </button>

                    <button 
                      onClick={handleBookmark}
                      className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                        idea.bookmarked_by_user 
                          ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>{idea.bookmarked_by_user ? 'Bookmarked' : 'Bookmark'}</span>
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

                {/* Purchase Status */}
                {idea.price > 0 && user && !isOwner && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Access Status
                    </h3>
                    {checkingPurchase ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Checking access...</span>
                      </div>
                    ) : hasPurchased ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Full Access Unlocked</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Premium Content</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        idea={idea} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
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