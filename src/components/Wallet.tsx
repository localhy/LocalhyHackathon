import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet as WalletIcon, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, History, RefreshCw, Send, Plus, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getUserCredits, 
  getUserTransactions, 
  getWalletStats,
  transferCreditsToFiatBalance,
  processWithdrawal,
  updateUserPayPalEmail,
  transferCredits,
  type Transaction,
  type WalletStats
} from '../lib/database'

// Credit Purchase Modal
const CreditPurchaseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null

  const creditPackages = [
    { credits: 10, price: 10, popular: false },
    { credits: 50, price: 50, popular: false },
    { credits: 100, price: 100, popular: true, bonus: 200 },
    { credits: 500, price: 500, popular: false }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Purchase Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
          Credits can be used to post referral jobs, promote your content, and access premium features.
        </p>

        <div className="space-y-4 mb-6">
          {creditPackages.map((pkg) => (
            <div 
              key={pkg.credits}
              className={`border rounded-lg p-4 relative cursor-pointer hover:shadow-md transition-shadow ${
                pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Best Value
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{pkg.credits} Credits</h4>
                  {pkg.bonus && (
                    <p className="text-green-600 text-sm">+ {pkg.bonus} FREE credits</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${pkg.price}</p>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg mt-1">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium mb-1">Payment Processing</p>
          <p>This is a demo app. In a real application, this would connect to a payment processor like Stripe or PayPal.</p>
        </div>
      </div>
    </div>
  )
}

// Credit Transfer Modal
const CreditTransferModal = ({ 
  isOpen, 
  onClose, 
  onTransfer, 
  availableCredits,
  isProcessing,
  error
}: { 
  isOpen: boolean
  onClose: () => void
  onTransfer: (recipient: string, amount: number) => void
  availableCredits: number
  isProcessing: boolean
  error: string
}) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (recipient && amount > 0 && amount <= availableCredits) {
      onTransfer(recipient, amount)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Transfer Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
          Send credits to another Localhy user. You can transfer to any user by their email address.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (Credits)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableCredits}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Available: {availableCredits}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Important</p>
            <p>Only cash credits can be transferred. Free credits cannot be transferred to other users.</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!recipient || amount <= 0 || amount > availableCredits || isProcessing}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Credits</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Withdrawal Modal
const WithdrawalModal = ({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  availableBalance,
  paypalEmail,
  onUpdatePayPalEmail,
  isProcessing,
  error
}: { 
  isOpen: boolean
  onClose: () => void
  onWithdraw: (amount: number) => void
  availableBalance: number
  paypalEmail: string
  onUpdatePayPalEmail: (email: string) => void
  isProcessing: boolean
  error: string
}) => {
  const [amount, setAmount] = useState(0)
  const [newPayPalEmail, setNewPayPalEmail] = useState(paypalEmail)
  const [isEditingEmail, setIsEditingEmail] = useState(!paypalEmail)
  const [emailUpdated, setEmailUpdated] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0 && amount <= availableBalance) {
      onWithdraw(amount)
    }
  }

  const handleUpdateEmail = () => {
    if (newPayPalEmail && newPayPalEmail !== paypalEmail) {
      onUpdatePayPalEmail(newPayPalEmail)
      setIsEditingEmail(false)
      setEmailUpdated(true)
      setTimeout(() => setEmailUpdated(false), 3000)
    }
  }

  // Calculate fee and net amount
  const fee = amount * 0.15 // 15% fee
  const netAmount = amount - fee

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Withdraw to PayPal
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
          Withdraw your earnings to your PayPal account. A 15% processing fee applies to all withdrawals.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {emailUpdated && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-green-700 text-sm">PayPal email updated successfully!</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PayPal Email
          </label>
          {isEditingEmail ? (
            <div className="flex space-x-2">
              <input
                type="email"
                value={newPayPalEmail}
                onChange={(e) => setNewPayPalEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleUpdateEmail}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-gray-900">{paypalEmail || 'No PayPal email set'}</span>
              <button
                onClick={() => setIsEditingEmail(true)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount ($)
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max={availableBalance}
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!paypalEmail && !newPayPalEmail}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Available: ${availableBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Fee (15%):</span>
                <span className="font-medium text-red-600">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">You'll receive:</span>
                <span className="font-bold text-green-600">${netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!paypalEmail || amount <= 0 || amount > availableBalance || isProcessing}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Withdraw</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Convert Credits Modal
const ConvertCreditsModal = ({ 
  isOpen, 
  onClose, 
  onConvert, 
  availableCredits,
  isProcessing,
  error
}: { 
  isOpen: boolean
  onClose: () => void
  onConvert: (amount: number) => void
  availableCredits: number
  isProcessing: boolean
  error: string
}) => {
  const [amount, setAmount] = useState(0)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0 && amount <= availableCredits) {
      onConvert(amount)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Convert Credits to Cash
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
          Convert your credits to cash balance at a 1:1 ratio. Cash balance can be withdrawn to your PayPal account.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Convert (Credits)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableCredits}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Available: {availableCredits} credits
              </div>
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Credits to convert:</span>
                <span className="font-medium">{amount} credits</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">You'll receive:</span>
                <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || amount > availableCredits || isProcessing}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Convert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Wallet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletStats, setWalletStats] = useState<WalletStats>({
    currentCredits: 0,
    freeCredits: 0,
    fiatBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    pendingEarnings: 0
  })
  const [paypalEmail, setPaypalEmail] = useState('')
  
  // Modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  
  // Processing states
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false)
  const [isProcessingConversion, setIsProcessingConversion] = useState(false)
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadWalletData()
    }
  }, [user])

  const loadWalletData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      // Load wallet data in parallel
      const [stats, txns, profile] = await Promise.all([
        getWalletStats(user.id),
        getUserTransactions(user.id),
        supabase.from('user_profiles').select('paypal_email').eq('id', user.id).single()
      ])
      
      setWalletStats(stats)
      setTransactions(txns)
      
      if (profile.data) {
        setPaypalEmail(profile.data.paypal_email || '')
      }
    } catch (error) {
      console.error('Error loading wallet data:', error)
      setError('Failed to load wallet data. Please try again.')
    } finally {
      setLoading(false)
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
        navigate('/dashboard/starter-tools')
        break
      case 'create-new':
        navigate('/dashboard/create-new')
        break
      case 'my-posts':
        navigate('/dashboard/my-posts')
        break
      case 'wallet':
        // Stay on current page
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

  const handleWithdraw = async (amount: number) => {
    if (!user) return
    
    setIsProcessingWithdrawal(true)
    setError('')
    
    try {
      const success = await processWithdrawal(user.id, amount)
      
      if (success) {
        // Close modal and refresh wallet data
        setShowWithdrawalModal(false)
        await loadWalletData()
      } else {
        throw new Error('Withdrawal failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Error processing withdrawal:', error)
      setError(error.message || 'Failed to process withdrawal. Please try again.')
    } finally {
      setIsProcessingWithdrawal(false)
    }
  }

  const handleUpdatePayPalEmail = async (email: string) => {
    if (!user) return
    
    try {
      const success = await updateUserPayPalEmail(user.id, email)
      
      if (success) {
        setPaypalEmail(email)
      } else {
        throw new Error('Failed to update PayPal email')
      }
    } catch (error: any) {
      console.error('Error updating PayPal email:', error)
      setError(error.message || 'Failed to update PayPal email. Please try again.')
    }
  }

  const handleConvertCredits = async (amount: number) => {
    if (!user) return
    
    setIsProcessingConversion(true)
    setError('')
    
    try {
      const success = await transferCreditsToFiatBalance(user.id, amount)
      
      if (success) {
        // Close modal and refresh wallet data
        setShowConvertModal(false)
        await loadWalletData()
      } else {
        throw new Error('Conversion failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Error converting credits:', error)
      setError(error.message || 'Failed to convert credits. Please try again.')
    } finally {
      setIsProcessingConversion(false)
    }
  }

  const handleTransferCredits = async (recipient: string, amount: number) => {
    if (!user) return
    
    setIsProcessingTransfer(true)
    setError('')
    
    try {
      const success = await transferCredits(user.id, recipient, amount)
      
      if (success) {
        // Close modal and refresh wallet data
        setShowTransferModal(false)
        await loadWalletData()
      } else {
        throw new Error('Transfer failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Error transferring credits:', error)
      setError(error.message || 'Failed to transfer credits. Please try again.')
    } finally {
      setIsProcessingTransfer(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return <CreditCard className="h-4 w-4 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-green-500" />
      case 'credit_earning':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'credit_transfer_sent':
        return <Send className="h-4 w-4 text-red-500" />
      case 'credit_transfer_received':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit_purchase':
      case 'refund':
      case 'credit_earning':
      case 'credit_transfer_received':
        return 'text-green-600'
      case 'credit_usage':
      case 'withdrawal':
      case 'credit_transfer_sent':
        return 'text-red-600'
      case 'credit_to_fiat_conversion':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionAmount = (transaction: Transaction) => {
    // For credit transactions, show the credits amount
    if (transaction.type.includes('credit')) {
      return `${transaction.credits > 0 ? '+' : ''}${transaction.credits} credits`
    }
    
    // For monetary transactions, show the dollar amount
    return `${transaction.amount > 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="wallet"
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="wallet"
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
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Wallet
            </h1>
            <p 
              className="text-gray-600 mt-1"
              style={{ fontFamily: 'Inter' }}
            >
              Manage your credits, earnings, and transactions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('purchase')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'purchase'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Purchase Credits
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'withdraw'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Withdraw
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Transaction History
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-700 hover:text-red-800"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Credits Balance */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Credits
                      </h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cash Credits:</span>
                        <span className="font-semibold text-gray-900">{walletStats.currentCredits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Free Credits:</span>
                        <span className="font-semibold text-purple-600">{walletStats.freeCredits}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-green-600">{walletStats.currentCredits + walletStats.freeCredits}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setShowTransferModal(true)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  {/* Cash Balance */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Cash Balance
                      </h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-gray-900">${walletStats.fiatBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-semibold text-yellow-600">${walletStats.pendingEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-blue-600">${(walletStats.fiatBalance + walletStats.pendingEarnings).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
                        disabled={walletStats.fiatBalance <= 0}
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={() => setShowConvertModal(true)}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-medium"
                        disabled={walletStats.currentCredits <= 0}
                      >
                        Convert
                      </button>
                    </div>
                  </div>

                  {/* Earnings Summary */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Earnings Summary
                      </h3>
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <WalletIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Earned:</span>
                        <span className="font-semibold text-green-600">${walletStats.totalEarned.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-semibold text-red-600">${walletStats.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Net:</span>
                        <span className={`font-bold ${walletStats.totalEarned - walletStats.totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(walletStats.totalEarned - walletStats.totalSpent).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('history')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Recent Transactions
                    </h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="h-8 w-8 text-gray-400" />
                      </div>
                      <p 
                        className="text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No transactions yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {getTransactionAmount(transaction)}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Credits Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Buy Credits
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900">10 Credits</h4>
                        <span className="text-lg font-bold">$10</span>
                      </div>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                        Buy Now
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900">50 Credits</h4>
                        <span className="text-lg font-bold">$50</span>
                      </div>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                        Buy Now
                      </button>
                    </div>
                    
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative">
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Best Value
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">100 Credits</h4>
                          <p className="text-green-600 text-xs">+ 200 FREE credits</p>
                        </div>
                        <span className="text-lg font-bold">$100</span>
                      </div>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                        Buy Now
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900">500 Credits</h4>
                        <span className="text-lg font-bold">$500</span>
                      </div>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                        Buy Now
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <p className="font-medium mb-1">Demo Mode</p>
                    <p>This is a demo app. In a real application, this would connect to a payment processor like Stripe or PayPal.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    What You Can Do With Credits
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Post Referral Jobs</h4>
                      <p className="text-gray-600 text-sm mb-2">Create referral opportunities for your business.</p>
                      <p className="text-green-600 font-medium">10 credits per job</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Promote Content</h4>
                      <p className="text-gray-600 text-sm mb-2">Boost visibility of your ideas or referral jobs.</p>
                      <p className="text-green-600 font-medium">From 5 credits per day</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Access Premium Content</h4>
                      <p className="text-gray-600 text-sm mb-2">Unlock premium ideas and tools.</p>
                      <p className="text-green-600 font-medium">Varies by content</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Withdraw Funds
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Cash Balance</h4>
                      <p className="text-3xl font-bold text-blue-600">${walletStats.fiatBalance.toFixed(2)}</p>
                      <p className="text-blue-700 text-sm mt-1">Available for withdrawal</p>
                      
                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        disabled={walletStats.fiatBalance <= 0}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg text-sm font-medium w-full"
                      >
                        Withdraw to PayPal
                      </button>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Credits Balance</h4>
                      <div className="flex items-end space-x-2">
                        <p className="text-3xl font-bold text-purple-600">{walletStats.currentCredits}</p>
                        <p className="text-purple-700 text-sm mb-1">cash credits</p>
                      </div>
                      <p className="text-purple-700 text-sm mt-1">Convert to cash before withdrawal</p>
                      
                      <button
                        onClick={() => setShowConvertModal(true)}
                        disabled={walletStats.currentCredits <= 0}
                        className="mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg text-sm font-medium w-full"
                      >
                        Convert to Cash
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Withdrawal Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">PayPal Email</p>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-800">{paypalEmail || 'Not set'}</p>
                          <button
                            onClick={() => setShowWithdrawalModal(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {paypalEmail ? 'Edit' : 'Set Email'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Withdrawal Fee</p>
                        <p className="font-medium text-gray-800">15% of withdrawal amount</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                        <p className="font-medium text-gray-800">1-3 business days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Recent Withdrawals
                  </h3>
                  
                  {transactions.filter(t => t.type === 'withdrawal').length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowUpRight className="h-8 w-8 text-gray-400" />
                      </div>
                      <p 
                        className="text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No withdrawals yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions
                        .filter(t => t.type === 'withdrawal')
                        .slice(0, 5)
                        .map((transaction) => (
                          <div key={transaction.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-red-600">
                                -${Math.abs(transaction.amount).toFixed(2)}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Transaction History
                  </h3>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="h-8 w-8 text-gray-400" />
                      </div>
                      <p 
                        className="text-gray-500"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No transactions yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                                {transaction.description}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{formatDate(transaction.created_at)}</span>
                                <span>•</span>
                                <span>{formatTime(transaction.created_at)}</span>
                                <span>•</span>
                                <span className="capitalize">{transaction.type.replace(/_/g, ' ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {getTransactionAmount(transaction)}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreditPurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
      
      <WithdrawalModal 
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onWithdraw={handleWithdraw}
        availableBalance={walletStats.fiatBalance}
        paypalEmail={paypalEmail}
        onUpdatePayPalEmail={handleUpdatePayPalEmail}
        isProcessing={isProcessingWithdrawal}
        error={error}
      />
      
      <ConvertCreditsModal 
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvertCredits}
        availableCredits={walletStats.currentCredits}
        isProcessing={isProcessingConversion}
        error={error}
      />
      
      <CreditTransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransferCredits}
        availableCredits={walletStats.currentCredits}
        isProcessing={isProcessingTransfer}
        error={error}
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

export default Wallet