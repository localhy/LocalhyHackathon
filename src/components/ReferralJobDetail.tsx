import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Building, Globe, Phone, Mail, Share2, Send, X, Copy, Facebook, Twitter, Linkedin, AlertCircle, Check, Loader, Calendar, Star, Flag, MoreVertical, User } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getReferralJobById, createMessage, type ReferralJob } from '../lib/database'

// Share modal component
const ShareModal = ({ job, isVisible, onClose }: { job: ReferralJob | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!job || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/referral-jobs/${job.id}`
  const shareText = `Check out this referral opportunity: ${job.title} at ${job.business_name}`

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
            Share Referral Job
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{job.business_name}</p>
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

// Apply modal component
const ApplyModal = ({ job, isVisible, onClose }: { job: ReferralJob | null, isVisible: boolean, onClose: () => void }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!job || !isVisible) return null

  const handleSendApplication = async () => {
    if (!message.trim() || !user) return

    setSending(true)
    setError('')
    
    try {
      const result = await createMessage({
        sender_id: user.id,
        recipient_id: job.user_id,
        content: message,
        subject: `Application for referral job: ${job.title}`
      })

      if (result) {
        setSuccess(true)
        setMessage('')
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to send application')
      }
    } catch (error: any) {
      console.error('Failed to send application:', error)
      setError(error.message || 'Failed to send application. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Apply for Referral Job
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
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Application Sent!</h4>
            <p className="text-gray-600">Your application has been sent to the business owner.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                {job.logo_url ? (
                  <img
                    src={job.logo_url}
                    alt={job.business_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{job.business_name}</h4>
                  <p className="text-sm text-gray-500">{job.title}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">
                  Commission: {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                </p>
                {job.referral_type && (
                  <p className="text-blue-700 text-xs mt-1">
                    Type: {job.referral_type}
                  </p>
                )}
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
                Your Application Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Hi! I'm interested in this referral opportunity and would like to learn more..."
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
                onClick={handleSendApplication}
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
                    <span>Send Application</span>
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

const ReferralJobDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [job, setJob] = useState<ReferralJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Invalid job ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedJob = await getReferralJobById(id)
        if (fetchedJob) {
          setJob(fetchedJob)
        } else {
          setError('Referral job not found')
        }
      } catch (err) {
        console.error('Error loading job:', err)
        setError('Failed to load referral job. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [id])

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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleApply = () => {
    setApplyModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="referral-jobs"
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="referral-jobs"
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
                {error || 'Referral job not found'}
              </h2>
              <button
                onClick={() => navigate('/dashboard/referral-jobs')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to Referral Jobs
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
        currentPage="referral-jobs"
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
          {/* Header Background */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/referral-jobs')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Commission badge */}
            <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold">
              {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
            </div>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {job.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(job.urgency)}`}>
                  {job.urgency} Priority
                </span>
                {job.referral_type && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {job.referral_type}
                  </span>
                )}
              </div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {job.title}
              </h1>
              <p 
                className="text-xl text-blue-100 font-medium"
                style={{ fontFamily: 'Inter' }}
              >
                {job.business_name}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Job Description
                  </h2>
                  <div 
                    className="prose prose-gray max-w-none"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Requirements
                    </h2>
                    <div 
                      className="prose prose-gray max-w-none"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {job.requirements.split('\n').map((requirement, index) => (
                        <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                          • {requirement}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                {job.terms && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-4"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Terms & Conditions
                    </h2>
                    <div 
                      className="prose prose-gray max-w-none"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {job.terms.split('\n').map((term, index) => (
                        <p key={index} className="mb-2 text-gray-700 leading-relaxed text-sm">
                          {term}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Business Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    About the Business
                  </h3>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    {job.logo_url ? (
                      <img
                        src={job.logo_url}
                        alt={job.business_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {job.business_name}
                      </h4>
                      <p 
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {job.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Contact information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    
                    {job.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={job.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 truncate"
                        >
                          {job.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Apply Button */}
                  {job.user_id !== user?.id && (
                    <button
                      onClick={handleApply}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{job.cta_text || 'Apply Now'}</span>
                    </button>
                  )}
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Job Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Commission</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Urgency</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Applicants</span>
                      </div>
                      <span className="font-semibold text-gray-900">{job.applicants_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Posted</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatDate(job.created_at)}</span>
                    </div>
                    {job.referral_type && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Type</span>
                        </div>
                        <span className="font-semibold text-purple-600">{job.referral_type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    <button 
                      onClick={handleShare}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Job</span>
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
        job={job} 
        isVisible={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
      
      <ApplyModal 
        job={job} 
        isVisible={applyModalOpen} 
        onClose={() => setApplyModalOpen(false)} 
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

export default ReferralJobDetail