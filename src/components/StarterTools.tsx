import React, { useState, useEffect } from 'react'
import { Plus, Download, Star, ExternalLink, Search, Filter, Wrench, Crown, Zap, Target, CreditCard, X, Check, Loader, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getTools, incrementPromotionClicks, getActivePromotionForContent, hasUserPurchasedContent, getUserCredits, purchaseContent, type Tool } from '../lib/database'

// Purchase modal component
const PurchaseModal = ({ 
  tool, 
  isVisible, 
  onClose, 
  onPurchase, 
  userCredits, 
  purchasing, 
  error 
}: { 
  tool: Tool | null
  isVisible: boolean
  onClose: () => void
  onPurchase: () => void
  userCredits: number
  purchasing: boolean
  error: string
}) => {
  if (!tool || !isVisible) return null

  const canAfford = userCredits >= tool.price

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Purchase Tool
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{tool.title}</h4>
              <p className="text-sm text-gray-500">{tool.category}</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-4">
            {tool.description.length > 150 
              ? tool.description.substring(0, 150) + '...' 
              : tool.description}
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Credits:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits} credits
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Tool Price:</span>
              <span className="font-semibold text-gray-900">{tool.price} credits</span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Remaining Balance:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits - tool.price} credits
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          {canAfford ? (
            <button
              onClick={onPurchase}
              disabled={purchasing}
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {purchasing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Buy for {tool.price} Credits</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/dashboard/wallet?tab=purchase'}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Buy More Credits</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Success modal component
const SuccessModal = ({ 
  tool, 
  isVisible, 
  onClose, 
  onDownload 
}: { 
  tool: Tool | null
  isVisible: boolean
  onClose: () => void
  onDownload: () => void
}) => {
  if (!tool || !isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
            Purchase Successful!
          </h3>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
            You now have access to "{tool.title}". You can download it now or access it anytime from your purchased tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDownload}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Now</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const StarterTools = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Purchase flow states
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [checkingPurchase, setCheckingPurchase] = useState(false)

  useEffect(() => {
    loadTools()
    
    // Load user credits if user is logged in
    if (user) {
      loadUserCredits()
    }
  }, [user])

  const loadTools = async () => {
    try {
      setLoading(true)
      setError('')
      const fetchedTools = await getTools(20, 0) // Get up to 20 tools
      setTools(fetchedTools)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError('Failed to load tools. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const loadUserCredits = async () => {
    if (!user) return
    
    try {
      const credits = await getUserCredits(user.id)
      setUserCredits(credits.cashCredits + credits.freeCredits)
    } catch (error) {
      console.error('Error loading user credits:', error)
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
        navigate('/dashboard/community')
        break
      case 'starter-tools':
        // Stay on current page
        break
      case 'create-new':
        navigate('/dashboard/create-new?tab=tool')
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

  const handleSubmitTool = () => {
    navigate('/dashboard/create-new?tab=tool')
  }

  const handleViewTool = async (tool: Tool) => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    // Track promotion click if this is promoted content
    if (tool.is_promoted) {
      try {
        const promotion = await getActivePromotionForContent(tool.id, 'tool')
        if (promotion) {
          await incrementPromotionClicks(promotion.id)
        }
      } catch (error) {
        console.error('Error tracking promotion click:', error)
      }
    }
    
    // Check if this is a paid tool
    if (tool.price > 0) {
      setSelectedTool(tool)
      setCheckingPurchase(true)
      setPurchaseError('')
      
      try {
        // Check if user has already purchased this tool
        const hasPurchased = await hasUserPurchasedContent(user.id, tool.id, 'tool')
        
        if (hasPurchased) {
          // User already purchased, open download URL directly
          if (tool.download_url) {
            window.open(tool.download_url, '_blank')
          }
        } else {
          // User hasn't purchased, show purchase modal
          setShowPurchaseModal(true)
        }
      } catch (error) {
        console.error('Error checking purchase status:', error)
        setPurchaseError('Failed to check purchase status. Please try again.')
      } finally {
        setCheckingPurchase(false)
      }
    } else {
      // Free tool, open download URL directly
      if (tool.download_url) {
        window.open(tool.download_url, '_blank')
      }
    }
  }
  
  const handlePurchase = async () => {
    if (!selectedTool || !user || purchasing) return
    
    setPurchasing(true)
    setPurchaseError('')
    
    try {
      const result = await purchaseContent(
        user.id,
        selectedTool.user_id,
        selectedTool.id,
        'tool',
        selectedTool.price
      )
      
      if (result) {
        // Purchase successful
        setShowPurchaseModal(false)
        setShowSuccessModal(true)
        
        // Update user credits
        setUserCredits(prev => prev - selectedTool.price)
        
        // Reload user credits to ensure accuracy
        await loadUserCredits()
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
  
  const handleDownload = () => {
    if (selectedTool?.download_url) {
      window.open(selectedTool.download_url, '_blank')
    }
    setShowSuccessModal(false)
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

  // Get promotion badge and styling
  const getPromotionBadge = (tool: Tool) => {
    if (!tool.is_promoted) return null

    // For now, we'll show a generic "Featured" badge
    // In the future, you could fetch the specific promotion type and show different badges
    return (
      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
        <Crown className="h-3 w-3" />
        <span>Featured</span>
      </div>
    )
  }

  const getPromotionStyling = (tool: Tool) => {
    if (!tool.is_promoted) return 'border-gray-200'
    
    // Enhanced styling for promoted content
    return 'border-yellow-400 ring-2 ring-yellow-100 shadow-lg'
  }

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
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
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

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Starter Tools
            </h1>
            
            <button
              onClick={handleSubmitTool}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Plus className="h-4 w-4" />
              <span>Submit Tool</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools and templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ fontFamily: 'Inter' }}
              />
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Filter</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={loadTools}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {tools.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-purple-500" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  No tools yet
                </h3>
                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Inter' }}
                >
                  Be the first to submit a useful tool or template for the community!
                </p>
                <button
                  onClick={handleSubmitTool}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                  style={{ fontFamily: 'Inter' }}
                >
                  Submit Your First Tool
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border ${getPromotionStyling(tool)} hover:shadow-lg transition-all duration-200 cursor-pointer relative`}
                    onClick={() => handleViewTool(tool)}
                  >
                    {/* Promotion badge */}
                    {getPromotionBadge(tool)}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(tool.type)}`}>
                          {tool.type}
                        </span>
                      </div>
                      {tool.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      {tool.title}
                    </h3>
                    
                    <p 
                      className="text-gray-600 text-sm mb-4 line-clamp-3"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{tool.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{tool.downloads_count}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags && tool.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        by {tool.user_profiles?.name || 'Anonymous'}
                      </span>
                      <div className="flex items-center space-x-2">
                        {tool.price > 0 ? (
                          <button 
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTool(tool);
                            }}
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>{tool.price} Credits</span>
                          </button>
                        ) : (
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTool(tool);
                            }}
                          >
                            <Download className="h-3 w-3" />
                            <span>Free</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        tool={selectedTool}
        isVisible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchase}
        userCredits={userCredits}
        purchasing={purchasing}
        error={purchaseError}
      />

      {/* Success Modal */}
      <SuccessModal
        tool={selectedTool}
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDownload={handleDownload}
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

export default StarterTools