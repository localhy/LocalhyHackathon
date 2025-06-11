import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Star, ExternalLink, Share2, Send, X, Copy, Mail, Facebook, Twitter, Linkedin, AlertCircle, Check, Loader, Calendar, User, Tag, MapPin, Lock, CreditCard, DollarSign } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getToolById, hasUserPurchasedContent, purchaseContent, getUserCredits, type Tool } from '../lib/database'

// Share modal component
const ShareModal = ({ tool, isVisible, onClose }: { tool: Tool | null, isVisible: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  if (!tool || !isVisible) return null

  const shareUrl = `${window.location.origin}/dashboard/tools/${tool.id}`
  const shareText = `Check out this tool: ${tool.title}`

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
            Share Tool
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{tool.title}</h4>
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

// Paywall overlay component for paid tools
const PaywallOverlay = ({ 
  tool, 
  userCredits, 
  onPurchase, 
  purchasing, 
  error 
}: { 
  tool: Tool
  userCredits: number
  onPurchase: () => void
  purchasing: boolean
  error: string
}) => {
  const navigate = useNavigate()
  const canAfford = userCredits >= tool.price

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          
          <h3 
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Premium Tool
          </h3>
          
          <p 
            className="text-gray-600 mb-6"
            style={{ fontFamily: 'Inter' }}
          >
            This tool requires {tool.price} credits to download.
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
              <span className="font-semibold text-gray-900">{tool.price} credits</span>
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
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2"
                style={{ fontFamily: 'Inter' }}
              >
                {purchasing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Purchase for {tool.price} Credits</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 text-sm font-medium">
                  Insufficient credits. You need {tool.price - userCredits} more credits.
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
            Credits support tool creators and platform development
          </p>
        </div>
      </div>
    </div>
  )
}

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  
  // Paywall states
  const [userCredits, setUserCredits] = useState(0)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [checkingPurchase, setCheckingPurchase] = useState(true)

  useEffect(() => {
    const loadTool = async () => {
      if (!id) {
        setError('Invalid tool ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const fetchedTool = await getToolById(id)
        if (fetchedTool) {
          setTool(fetchedTool)
          
          // Check if user has purchased this content (if it's paid)
          if (user && fetchedTool.price > 0) {
            setCheckingPurchase(true)
            const [purchased, credits] = await Promise.all([
              hasUserPurchasedContent(user.id, fetchedTool.id, 'tool'),
              getUserCredits(user.id)
            ])
            setHasPurchased(purchased)
            setUserCredits(credits)
            setCheckingPurchase(false)
          } else {
            setCheckingPurchase(false)
          }
        } else {
          setError('Tool not found')
        }
      } catch (err) {
        console.error('Error loading tool:', err)
        setError('Failed to load tool. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadTool()
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

  const handleDownload = () => {
    if (tool?.download_url) {
      window.open(tool.download_url, '_blank')
    }
  }

  const handlePurchase = async () => {
    if (!tool || !user || purchasing) return

    setPurchasing(true)
    setPurchaseError('')

    try {
      const result = await purchaseContent(
        user.id,
        tool.user_id,
        tool.id,
        'tool',
        tool.price
      )

      if (result) {
        setHasPurchased(true)
        setUserCredits(prev => prev - tool.price)
        setPurchaseError('')
      } else {
        throw new Error('Purchase failed')
      }
    } catch (error: any) {
      console.error('Error purchasing tool:', error)
      setPurchaseError(error.message || 'Failed to purchase tool. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Check if content should be locked
  const isContentLocked = tool && tool.price > 0 && user && tool.user_id !== user.id && !hasPurchased
  const isOwner = tool && user && tool.user_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="starter-tools"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="starter-tools"
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
                {error || 'Tool not found'}
              </h2>
              <button
                onClick={() => navigate('/dashboard/starter-tools')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to Starter Tools
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
        currentPage="starter-tools"
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
          <div className="h-64 md:h-80 bg-gradient-to-br from-purple-100 to-purple-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"></div>
            
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard/starter-tools')}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Price badge */}
            {tool.price > 0 && (
              <div className="absolute top-6 right-6 bg-purple-500 text-white px-4 py-2 rounded-full font-bold flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>{tool.price}</span>
              </div>
            )}
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {tool.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(tool.type)}`}>
                  {tool.type}
                </span>
                {tool.featured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Featured
                  </span>
                )}
              </div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {tool.title}
              </h1>
              {tool.location && (
                <div className="flex items-center text-white/90 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{tool.location}</span>
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
                {/* Tool Description */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 relative">
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Description
                  </h2>
                  
                  {isContentLocked && !checkingPurchase ? (
                    <PaywallOverlay
                      tool={tool}
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
                    {tool.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 relative">
                    {isContentLocked && !checkingPurchase ? (
                      <PaywallOverlay
                        tool={tool}
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
                      {tool.tags.map((tag, index) => (
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Creator Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    About the Creator
                  </h3>
                  <div className="flex items-center space-x-3 mb-4">
                    {tool.user_profiles?.avatar_url ? (
                      <img
                        src={tool.user_profiles.avatar_url}
                        alt={tool.user_profiles.name || 'Creator'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {tool.user_profiles?.name || 'Anonymous Creator'}
                      </h4>
                      <p 
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {tool.user_profiles?.user_type || 'Community Member'}
                      </p>
                    </div>
                  </div>
                  {tool.user_profiles?.bio && (
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {tool.user_profiles.bio}
                    </p>
                  )}
                </div>

                {/* Tool Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Downloads</span>
                      <span className="font-semibold text-gray-900">{tool.downloads_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900">{tool.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tool.type)}`}>
                        {tool.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Posted</span>
                      <span className="font-semibold text-gray-900">{formatDate(tool.created_at)}</span>
                    </div>
                    {tool.price > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="font-semibold text-purple-600">${tool.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    {/* Download/Purchase Button */}
                    {!isContentLocked || hasPurchased ? (
                      <button 
                        onClick={handleDownload}
                        disabled={!tool.download_url}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>{tool.price > 0 ? 'Download' : 'Download Free'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handlePurchase}
                        disabled={purchasing || userCredits < tool.price}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        {purchasing ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>Purchase for ${tool.price}</span>
                          </>
                        )}
                      </button>
                    )}

                    <button 
                      onClick={handleShare}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Tool</span>
                    </button>
                  </div>
                </div>

                {/* Purchase Status */}
                {tool.price > 0 && user && !isOwner && (
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
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Purchased</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Premium Tool</span>
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
        tool={tool} 
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

export default ToolDetail