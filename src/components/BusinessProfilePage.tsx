import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Clock, 
  DollarSign, 
  Share2, 
  Edit, 
  MessageCircle, 
  Star, 
  FileText, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Send, 
  X, 
  Copy, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  User 
} from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getBusinessProfileById, 
  createMessage, 
  getCommentsByContent, 
  createComment, 
  likeComment, 
  type BusinessProfile, 
  type Comment 
} from '../lib/database'
import { BASE_URL } from '../lib/config'

// Share modal component
const ShareModal = ({ business, isVisible, onClose }: { business: BusinessProfile | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!business || !isVisible) return null

  const shareUrl = `${BASE_URL}/dashboard/business/${business.id}`
  const shareText = `Check out ${business.business_name} on Localhy!`

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
            Share Business
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{business.business_name}</h4>
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

// Contact modal component
const ContactModal = ({ business, isVisible, onClose }: { business: BusinessProfile | null, isVisible: boolean, onClose: () => void }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!business || !isVisible) return null

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    setSending(true)
    setError('')
    
    try {
      const result = await createMessage({
        sender_id: user.id,
        recipient_id: business.user_id,
        content: message,
        subject: `Message about ${business.business_name}`
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
            Contact Business
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h4>
            <p className="text-gray-600">Your message has been sent to the business owner.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                {business.thumbnail_url ? (
                  <img
                    src={business.thumbnail_url}
                    alt={business.business_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{business.business_name}</h4>
                  <p className="text-sm text-gray-500">{business.category}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Hi! I'm interested in your business and would like to learn more..."
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
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
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

const BusinessProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    const loadBusiness = async () => {
      if (!id) {
        setError('Invalid business ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedBusiness = await getBusinessProfileById(id)
        if (fetchedBusiness) {
          setBusiness(fetchedBusiness)
          
          // Load comments if comments are enabled
          if (fetchedBusiness.enable_questions_comments && user) {
            const businessComments = await getCommentsByContent(fetchedBusiness.id, 'business', user.id)
            setComments(businessComments)
          }
        } else {
          setError('Business not found')
        }
      } catch (err) {
        console.error('Error loading business:', err)
        setError('Failed to load business. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
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

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleContact = () => {
    setContactModalOpen(true)
  }

  const handleEdit = () => {
    // Navigate to edit page
    navigate(`/dashboard/business/edit/${id}`)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !business || !user || submittingComment) return

    setSubmittingComment(true)
    setCommentError('')
    
    try {
      const comment = await createComment({
        content_id: business.id,
        content_type: 'business',
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
      console.error('Error submitting comment:', error)
      setCommentError(error.message || 'Failed to submit comment. Please try again.')
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

  const isOwner = business && user && business.user_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="profile"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="profile"
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
                {error || 'Business not found'}
              </h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to Dashboard
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
        currentPage="profile"
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
          <div className="h-64 md:h-80 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
            {business.cover_photo_url ? (
              <img
                src={business.cover_photo_url}
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="text-blue-700 font-medium text-lg">
                    {business.category}
                  </p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Edit button (for owner) */}
            {isOwner && (
              <button
                onClick={handleEdit}
                className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Business Logo & Name */}
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-6">
            <div className="max-w-4xl mx-auto flex items-end">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg border-4 border-white bg-white shadow-lg overflow-hidden">
                <img
                  src={business.thumbnail_url}
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 pt-16 sm:pt-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Business Header */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h1 
                        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        {business.business_name}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Tag className="h-4 w-4 mr-2" />
                        <span>{business.category}</span>
                      </div>
                      {(business.city || business.state || business.country) && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {[business.city, business.state, business.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {business.years_in_business ? (
                      <div className="mt-4 sm:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        {business.years_in_business} {business.years_in_business === 1 ? 'year' : 'years'} in business
                      </div>
                    ) : null}
                  </div>
                  
                  <p 
                    className="text-gray-700 leading-relaxed"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {business.description}
                  </p>
                </div>

                {/* Gallery */}
                {business.gallery_urls && business.gallery_urls.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Gallery
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {business.gallery_urls.map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`${business.business_name} gallery ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Video */}
                {business.youtube_video_url && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Video
                    </h2>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={business.youtube_video_url.replace('watch?v=', 'embed/')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Referral Program */}
                {business.enable_referrals && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Referral Program
                    </h2>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-800 mb-1">
                            Earn {business.referral_reward_type === 'percentage' 
                              ? `${business.referral_reward_amount}%` 
                              : `$${business.referral_reward_amount}`} 
                            per successful referral
                          </h3>
                          <p className="text-blue-700 text-sm">
                            Refer customers to {business.business_name} and earn commissions for each successful referral.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {business.promo_tagline && (
                      <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg mb-4">
                        <p className="text-yellow-800 font-medium text-center">
                          {business.promo_tagline}
                        </p>
                      </div>
                    )}
                    
                    {business.referral_cta_link && (
                      <a
                        href={business.referral_cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center"
                      >
                        Refer a Customer Now
                      </a>
                    )}
                  </div>
                )}

                {/* Customer Reviews */}
                {business.customer_reviews && business.customer_reviews.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Customer Reviews
                    </h2>
                    <div className="space-y-4">
                      {business.customer_reviews.map((review, index) => (
                        <div key={index} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{review.name}</div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{review.text}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {formatDate(review.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {business.enable_questions_comments && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-6"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Questions & Comments ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    {user && (
                      <div className="mb-6">
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
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Ask a question or leave a comment..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              style={{ fontFamily: 'Inter' }}
                            />
                            {commentError && (
                              <p className="text-red-600 text-sm mt-1">{commentError}</p>
                            )}
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || submittingComment}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                              >
                                {submittingComment ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                <span>Submit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-6">
                      {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No questions or comments yet. Be the first to start the conversation!
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
                                    comment.liked_by_user ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                                  }`}
                                >
                                  <Star className={`h-4 w-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                                  <span>{comment.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {business.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <a 
                          href={`mailto:${business.email}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {business.email}
                        </a>
                      </div>
                    )}
                    
                    {business.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <a 
                          href={`tel:${business.phone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    
                    {business.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a 
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {business.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                    
                    {business.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{business.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                {business.operating_hours && Object.keys(business.operating_hours).length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Operating Hours
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(business.operating_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">{day}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">
                              {hours.open && hours.close 
                                ? `${hours.open} - ${hours.close}`
                                : 'Closed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {(business.linkedin || business.twitter || business.facebook || business.instagram) && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Social Media
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {business.linkedin && (
                        <a 
                          href={business.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      
                      {business.twitter && (
                        <a 
                          href={business.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                          title="Twitter"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      
                      {business.facebook && (
                        <a 
                          href={business.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                          title="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      
                      {business.instagram && (
                        <a 
                          href={business.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-br from-purple-600 to-pink-500 text-white p-2 rounded-full hover:from-purple-700 hover:to-pink-600 transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {business.certifications_urls && business.certifications_urls.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {business.certifications_urls.map((url, index) => (
                        <a 
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span className="text-blue-600">View Certification {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    {!isOwner && (
                      <button 
                        onClick={handleContact}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Contact Business</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleShare}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Business</span>
                    </button>
                    
                    {isOwner && (
                      <button 
                        onClick={handleEdit}
                        className="w-full border border-blue-500 text-blue-500 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Business Page</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        business={business} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
      
      <ContactModal 
        business={business} 
        isVisible={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
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

export default BusinessProfilePage