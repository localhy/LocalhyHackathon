import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Send, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Info, 
  Loader, 
  Mail, 
  User, 
  Search, 
  Filter, 
  ArrowRight, 
  Gift, 
  Zap, 
  Shield
} from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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

// Credit Purchase Card Component
const CreditPurchaseCard = ({ 
  credits, 
  price, 
  bonusCredits = 0, 
  popular = false, 
  onPurchase 
}: { 
  credits: number
  price: number
  bonusCredits?: number
  popular?: boolean
  onPurchase: (credits: number, price: number) => void
}) => {
  return (
    <div className={`border rounded-xl p-6 ${popular ? 'border-green-500 bg-green-50' : 'border-gray-200'} relative`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Most Popular
        </div>
      )}
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {credits} <span className="text-green-500">Credits</span>
        </div>
        {bonusCredits > 0 && (
          <div className="text-sm text-green-600 font-medium mt-1">
            + {bonusCredits} FREE Credits
          </div>
        )}
        <div className="text-xl font-semibold mt-2">
          ${price}
        </div>
        <div className="text-gray-500 text-sm mt-1">
          {(price / (credits + bonusCredits)).toFixed(2)} per credit
        </div>
      </div>
      
      <button
        onClick={() => onPurchase(credits, price)}
        className={`w-full py-2 px-4 rounded-lg font-medium ${
          popular 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }`}
      >
        Buy Now
      </button>
    </div>
  )
}

// PayPal Email Modal Component
const PayPalEmailModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentEmail = '', 
  saving = false 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (email: string) => void
  currentEmail?: string
  saving?: boolean
}) => {
  const [email, setEmail] = useState(currentEmail)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail)
      setError('')
    }
  }, [isOpen, currentEmail])

  const handleSubmit = () => {
    // Validate email
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    onSave(email)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Set PayPal Email
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          Enter the PayPal email address where you want to receive your withdrawals. Make sure this email is associated with your PayPal account.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PayPal Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Transfer Credits Modal Component
const TransferCreditsModal = ({ 
  isOpen, 
  onClose, 
  onTransfer, 
  availableCredits = 0, 
  transferring = false 
}: { 
  isOpen: boolean
  onClose: () => void
  onTransfer: (recipient: string, amount: number) => void
  availableCredits?: number
  transferring?: boolean
}) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRecipient('')
      setAmount(0)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = () => {
    // Validate recipient
    if (!recipient.trim()) {
      setError('Recipient email or ID is required')
      return
    }
    
    // Validate amount
    if (amount <= 0) {
      setError('Amount must be greater than zero')
      return
    }
    
    if (amount > availableCredits) {
      setError(`You can only transfer up to ${availableCredits} credits`)
      return
    }
    
    onTransfer(recipient, amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transfer Credits
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <p className="text-blue-700 text-sm font-medium">
              You can only transfer earned credits
            </p>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Available to transfer: <span className="font-semibold">{availableCredits} credits</span>
          </p>
        </div>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient (Email or User ID)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                min="1"
                max={availableCredits}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={transferring || amount <= 0 || amount > availableCredits}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            {transferring ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Transfer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const Wallet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({ cashCredits: 0, purchasedCredits: 0, freeCredits: 0 })
  const [walletStats, setWalletStats] = useState<WalletStats>({
    currentCredits: 0,
    purchasedCredits: 0,
    freeCredits: 0,
    fiatBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    pendingEarnings: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Conversion states
  const [conversionAmount, setConversionAmount] = useState(0)
  const [converting, setConverting] = useState(false)
  
  // Withdrawal states
  const [withdrawalAmount, setWithdrawalAmount] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [paypalEmail, setPaypalEmail] = useState('')
  const [showPaypalModal, setShowPaypalModal] = useState(false)
  const [savingPaypalEmail, setSavingPaypalEmail] = useState(false)
  
  // Transfer states
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferring, setTransferring] = useState(false)
  
  // Transaction filter states
  const [transactionType, setTransactionType] = useState('all')
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)

  // Get tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'purchase', 'withdraw', 'transfer', 'history'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

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
      
      // Fetch all wallet data in parallel
      const [credits, stats, userTransactions] = await Promise.all([
        getUserCredits(user.id),
        getWalletStats(user.id),
        getUserTransactions(user.id)
      ])
      
      setCreditBalance(credits)
      setWalletStats(stats)
      setTransactions(userTransactions)
      
      // Get PayPal email from user profile
      const userProfile = await supabase
        .from('user_profiles')
        .select('paypal_email')
        .eq('id', user.id)
        .single()
      
      if (userProfile?.data?.paypal_email) {
        setPaypalEmail(userProfile.data.paypal_email)
      }
    } catch (error: any) {
      console.error('Error loading wallet data:', error)
      setError(error.message || 'Failed to load wallet data. Please try again.')
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL without reloading the page
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
  }

  const handlePurchaseCredits = (credits: number, price: number) => {
    // In a real app, this would open a payment modal or redirect to a payment page
    console.log(`Purchase ${credits} credits for $${price}`)
    
    // For demo purposes, show a success message
    setSuccess(`This would initiate a payment flow for ${credits} credits ($${price})`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleConvertCredits = async () => {
    if (!user || conversionAmount <= 0 || converting) return
    
    if (conversionAmount > creditBalance.cashCredits) {
      setError('You can only convert earned credits to cash. Purchased credits cannot be converted.')
      return
    }
    
    setConverting(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await transferCreditsToFiatBalance(user.id, conversionAmount)
      
      if (result) {
        setSuccess(`Successfully converted ${conversionAmount} credits to $${conversionAmount} cash balance`)
        setConversionAmount(0)
        
        // Reload wallet data to reflect changes
        await loadWalletData()
      } else {
        throw new Error('Failed to convert credits to cash')
      }
    } catch (error: any) {
      console.error('Error converting credits:', error)
      setError(error.message || 'Failed to convert credits to cash. Please try again.')
    } finally {
      setConverting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!user || withdrawalAmount <= 0 || withdrawing) return
    
    if (withdrawalAmount < 50) {
      setError('Minimum withdrawal amount is $50')
      return
    }
    
    if (withdrawalAmount > walletStats.fiatBalance) {
      setError('Insufficient balance for withdrawal')
      return
    }
    
    if (!paypalEmail) {
      setShowPaypalModal(true)
      return
    }
    
    setWithdrawing(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await processWithdrawal(user.id, withdrawalAmount)
      
      if (result) {
        setSuccess(`Withdrawal request for $${withdrawalAmount} has been submitted`)
        setWithdrawalAmount(0)
        
        // Reload wallet data to reflect changes
        await loadWalletData()
      } else {
        throw new Error('Failed to process withdrawal')
      }
    } catch (error: any) {
      console.error('Error processing withdrawal:', error)
      setError(error.message || 'Failed to process withdrawal. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  const handleSavePaypalEmail = async (email: string) => {
    if (!user) return
    
    setSavingPaypalEmail(true)
    
    try {
      const success = await updateUserPayPalEmail(user.id, email)
      
      if (success) {
        setPaypalEmail(email)
        setShowPaypalModal(false)
        
        // If we were in the middle of a withdrawal, continue
        if (withdrawalAmount > 0) {
          handleWithdraw()
        }
      } else {
        throw new Error('Failed to update PayPal email')
      }
    } catch (error: any) {
      console.error('Error saving PayPal email:', error)
      setError(error.message || 'Failed to save PayPal email. Please try again.')
    } finally {
      setSavingPaypalEmail(false)
    }
  }

  const handleTransferCredits = async (recipient: string, amount: number) => {
    if (!user || amount <= 0 || transferring) return
    
    if (amount > creditBalance.cashCredits) {
      setError('You can only transfer earned credits. Purchased credits cannot be transferred.')
      return
    }
    
    setTransferring(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await transferCredits(user.id, recipient, amount)
      
      if (result) {
        setSuccess(`Successfully transferred ${amount} credits to ${recipient}`)
        setShowTransferModal(false)
        
        // Reload wallet data to reflect changes
        await loadWalletData()
      } else {
        throw new Error('Failed to transfer credits')
      }
    } catch (error: any) {
      console.error('Error transferring credits:', error)
      setError(error.message || 'Failed to transfer credits. Please try again.')
    } finally {
      setTransferring(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />
      case 'refund':
        return <RefreshCw className="h-5 w-5 text-purple-500" />
      case 'credit_earning':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <RefreshCw className="h-5 w-5 text-blue-500" />
      case 'credit_transfer_sent':
        return <Send className="h-5 w-5 text-red-500" />
      case 'credit_transfer_received':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilteredTransactions = () => {
    if (transactionType === 'all') {
      return transactions
    }
    
    return transactions.filter(transaction => transaction.type === transactionType)
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Credit Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Earned Credits
            </h3>
            <WalletIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {creditBalance.cashCredits}
          </div>
          <p className="text-sm text-gray-600">
            Earned from content sales and referrals
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-medium">Withdrawable</span> • Can be converted to cash
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Purchased Credits
            </h3>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {creditBalance.purchasedCredits}
          </div>
          <p className="text-sm text-gray-600">
            Credits you've purchased
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-medium">Non-withdrawable</span> • For platform use only
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Free Credits
            </h3>
            <Gift className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {creditBalance.freeCredits}
          </div>
          <p className="text-sm text-gray-600">
            Bonus credits from promotions
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-medium">Non-withdrawable</span> • For posting referral jobs
          </div>
        </div>
      </div>

      {/* Cash Balance & Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Cash Balance
          </h3>
          <DollarSign className="h-5 w-5 text-green-500" />
        </div>
        
        <div className="text-3xl font-bold text-gray-900 mb-4">
          ${walletStats.fiatBalance.toFixed(2)}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Convert Credits to Cash
            </h4>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={conversionAmount || ''}
                  onChange={(e) => setConversionAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max={creditBalance.cashCredits}
                  placeholder="Amount"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                onClick={handleConvertCredits}
                disabled={conversionAmount <= 0 || conversionAmount > creditBalance.cashCredits || converting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                {converting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Convert</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              1 credit = $1 in cash balance
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Withdraw to PayPal
            </h4>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={withdrawalAmount || ''}
                  onChange={(e) => setWithdrawalAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="50"
                  max={walletStats.fiatBalance}
                  placeholder="Min $50"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawalAmount < 50 || withdrawalAmount > walletStats.fiatBalance || withdrawing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                {withdrawing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                <span>Withdraw</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {paypalEmail ? `To: ${paypalEmail}` : 'Set your PayPal email first'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earnings Stats
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Earned</div>
            <div className="text-xl font-semibold text-gray-900">${walletStats.totalEarned.toFixed(2)}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Spent</div>
            <div className="text-xl font-semibold text-gray-900">${walletStats.totalSpent.toFixed(2)}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Pending Earnings</div>
            <div className="text-xl font-semibold text-gray-900">${walletStats.pendingEarnings.toFixed(2)}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Available Credits</div>
            <div className="text-xl font-semibold text-gray-900">
              {creditBalance.cashCredits + creditBalance.purchasedCredits + creditBalance.freeCredits}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h3>
          <button
            onClick={() => handleTabChange('history')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`font-medium ${
                  transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                </div>
                {getTransactionStatusIcon(transaction.status)}
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPurchaseTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Purchase Credits
        </h3>
        <p className="text-gray-600 mb-6">
          Credits can be used to purchase premium content, promote your posts, and more.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CreditPurchaseCard
            credits={20}
            price={20}
            onPurchase={handlePurchaseCredits}
          />
          
          <CreditPurchaseCard
            credits={50}
            price={45}
            onPurchase={handlePurchaseCredits}
          />
          
          <CreditPurchaseCard
            credits={100}
            price={80}
            bonusCredits={200}
            popular={true}
            onPurchase={handlePurchaseCredits}
          />
          
          <CreditPurchaseCard
            credits={200}
            price={150}
            onPurchase={handlePurchaseCredits}
          />
          
          <CreditPurchaseCard
            credits={500}
            price={350}
            onPurchase={handlePurchaseCredits}
          />
          
          <CreditPurchaseCard
            credits={1000}
            price={650}
            onPurchase={handlePurchaseCredits}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What You Can Do With Credits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Promote Your Content</h4>
            <p className="text-sm text-gray-600">
              Boost visibility of your ideas, referral jobs, or tools with promotions.
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Access Premium Content</h4>
            <p className="text-sm text-gray-600">
              Unlock premium ideas, tools, and resources shared by other users.
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Megaphone className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Post Referral Jobs</h4>
            <p className="text-sm text-gray-600">
              Create referral job listings to find people who can refer customers to your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWithdrawTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Withdraw Funds
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-2">
              Available Balance
            </h4>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${walletStats.fiatBalance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              This is your cash balance available for withdrawal
            </p>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-2">
              Withdrawal Method
            </h4>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">P</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">PayPal</div>
                <div className="text-sm text-gray-600">
                  {paypalEmail || 'No PayPal email set'}
                </div>
              </div>
              <button
                onClick={() => setShowPaypalModal(true)}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {paypalEmail ? 'Change' : 'Set Email'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Important Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                <li>Minimum withdrawal amount is $50</li>
                <li>A 15% fee is applied to all withdrawals</li>
                <li>Withdrawals are processed within 3-5 business days</li>
                <li>Only cash balance can be withdrawn (not credits)</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Request Withdrawal
          </h4>
          
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={withdrawalAmount || ''}
                onChange={(e) => setWithdrawalAmount(Math.max(0, parseInt(e.target.value) || 0))}
                min="50"
                max={walletStats.fiatBalance}
                placeholder="Minimum $50"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              />
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={withdrawalAmount < 50 || withdrawalAmount > walletStats.fiatBalance || withdrawing || !paypalEmail}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
            >
              {withdrawing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Withdraw</span>
                </>
              )}
            </button>
          </div>
          
          {withdrawalAmount > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${withdrawalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Fee (15%):</span>
                <span className="font-medium">-${(withdrawalAmount * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-200">
                <span>You'll receive:</span>
                <span className="text-green-600">${(withdrawalAmount * 0.85).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Withdrawals
        </h3>
        
        {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length > 0 ? (
          <div className="space-y-3">
            {transactions
              .filter(t => t.type === 'withdrawal' && t.status === 'pending')
              .map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        Withdrawal to PayPal
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Processing
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending withdrawals</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderTransferTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Transfer Credits
        </h3>
        <p className="text-gray-600 mb-6">
          Send credits to other users on the platform. Only earned credits can be transferred.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Available for Transfer</h4>
              <p className="text-blue-700">
                <span className="font-semibold">{creditBalance.cashCredits} earned credits</span> available to transfer
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Note: Purchased credits ({creditBalance.purchasedCredits}) and free credits ({creditBalance.freeCredits}) cannot be transferred.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowTransferModal(true)}
          disabled={creditBalance.cashCredits <= 0}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <Send className="h-5 w-5" />
          <span>Transfer Credits</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transfers
        </h3>
        
        {transactions.filter(t => t.type === 'credit_transfer_sent' || t.type === 'credit_transfer_received').length > 0 ? (
          <div className="space-y-3">
            {transactions
              .filter(t => t.type === 'credit_transfer_sent' || t.type === 'credit_transfer_received')
              .slice(0, 5)
              .map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${
                      transaction.type === 'credit_transfer_sent' 
                        ? 'bg-red-100' 
                        : 'bg-green-100'
                    } flex items-center justify-center`}>
                      {transaction.type === 'credit_transfer_sent' ? (
                        <Send className="h-5 w-5 text-red-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-medium ${
                    transaction.type === 'credit_transfer_sent' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Send className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transfers yet</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          About Credit Transfers
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Only Earned Credits</h4>
              <p className="text-sm text-gray-600">
                You can only transfer credits that you've earned on the platform. Purchased credits and free credits cannot be transferred.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Recipient Identification</h4>
              <p className="text-sm text-gray-600">
                You can transfer credits using either the recipient's email address or their user ID.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Security</h4>
              <p className="text-sm text-gray-600">
                Transfers are final and cannot be reversed. Make sure you're sending to the correct recipient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transaction History
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setTransactionType('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'all' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTransactionType('credit_purchase')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'credit_purchase' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setTransactionType('credit_earning')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'credit_earning' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setTransactionType('credit_usage')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'credit_usage' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setTransactionType('withdrawal')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'withdrawal' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setTransactionType('credit_to_fiat_conversion')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'credit_to_fiat_conversion' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Conversions
          </button>
        </div>
        
        <div className="space-y-3">
          {getFilteredTransactions().length > 0 ? (
            getFilteredTransactions().map((transaction) => (
              <div key={transaction.id}>
                <div 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`font-medium ${
                      transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTransactionStatusIcon(transaction.status)}
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedTransaction === transaction.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedTransaction === transaction.id && (
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="ml-2 text-gray-900">{transaction.id.substring(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          transaction.status === 'failed' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900">
                          {transaction.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 text-gray-900">
                          {transaction.amount ? `$${transaction.amount.toFixed(2)}` : 'N/A'}
                        </span>
                      </div>
                      {transaction.payment_method && (
                        <div>
                          <span className="text-gray-500">Payment Method:</span>
                          <span className="ml-2 text-gray-900">{transaction.payment_method}</span>
                        </div>
                      )}
                      {transaction.withdrawal_method && (
                        <div>
                          <span className="text-gray-500">Withdrawal Method:</span>
                          <span className="ml-2 text-gray-900">{transaction.withdrawal_method}</span>
                        </div>
                      )}
                      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                        <div className="col-span-2 mt-2">
                          <span className="text-gray-500">Details:</span>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                            {JSON.stringify(transaction.metadata, null, 2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'purchase':
        return renderPurchaseTab()
      case 'withdraw':
        return renderWithdrawTab()
      case 'transfer':
        return renderTransferTab()
      case 'history':
        return renderHistoryTab()
      default:
        return renderOverviewTab()
    }
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
          <div className="max-w-6xl mx-auto">
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
              Manage your credits, earnings, and withdrawals
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-4 whitespace-nowrap">
              <button
                onClick={() => handleTabChange('overview')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('purchase')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'purchase'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Purchase Credits
              </button>
              <button
                onClick={() => handleTabChange('withdraw')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'withdraw'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Withdraw
              </button>
              <button
                onClick={() => handleTabChange('transfer')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transfer'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Transfer
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                History
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Error/Success Messages */}
            {(error || success) && (
              <div className="mb-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{success}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content */}
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* PayPal Email Modal */}
      <PayPalEmailModal
        isOpen={showPaypalModal}
        onClose={() => setShowPaypalModal(false)}
        onSave={handleSavePaypalEmail}
        currentEmail={paypalEmail}
        saving={savingPaypalEmail}
      />

      {/* Transfer Credits Modal */}
      <TransferCreditsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransferCredits}
        availableCredits={creditBalance.cashCredits}
        transferring={transferring}
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