import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Wallet as WalletIcon, CreditCard, DollarSign, ArrowRight, ArrowLeft, Loader, CheckCircle, AlertCircle, ExternalLink, Send, Lightbulb, Building, Wrench, User } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getUserCredits, getUserTransactions, transferCreditsToFiatBalance, processWithdrawalWithPaypal, transferUserCredits, type Transaction } from '../lib/database'
import { supabase } from '../lib/supabase'

// Credit package options
const CREDIT_PACKAGES = [
  { 
    credits: 20, 
    price: 20, 
    popular: false,
    paypalLink: "https://www.paypal.com/ncp/payment/AXVWLDYSE65YU",
    stripeLink: "https://www.creem.io/payment/prod_4DcD1pV6lnQZUeUO3OCF1L"
  },
  { 
    credits: 50, 
    price: 50, 
    popular: false,
    paypalLink: "https://www.paypal.com/ncp/payment/SVHRUH3LJJL64",
    stripeLink: "https://www.creem.io/payment/prod_6qXRLWHFQQmHSjKKKNK87D"
  },
  { 
    credits: 100, 
    price: 100, 
    popular: true, 
    bonus: 200,
    paypalLink: "https://www.paypal.com/ncp/payment/LYEXERLJ7ENTE",
    stripeLink: "https://www.creem.io/payment/prod_4pVvvZGzoipEUzbG1SD7b1"
  },
  { 
    credits: 500, 
    price: 500, 
    popular: false,
    paypalLink: "https://www.paypal.com/ncp/payment/36JVB2CQU2USY",
    stripeLink: "https://www.creem.io/payment/prod_1bkvzEnW0sW836wtlxhn9w"
  }
];


// Referral job posting cost
export const REFERRAL_JOB_POSTING_COST = 10

const Wallet = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('balance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Wallet data
  const [credits, setCredits] = useState({
    freeCredits: 0,
    purchasedCredits: 0,
    cashCredits: 0,
    fiatBalance: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // Conversion states
  const [convertAmount, setConvertAmount] = useState(0)
  const [converting, setConverting] = useState(false)
  
  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [paypalEmail, setPaypalEmail] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  
  // Transfer states
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferAmount, setTransferAmount] = useState(0)
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState('')
  const [transferSuccess, setTransferSuccess] = useState('')

  useEffect(() => {
    // Get active tab from URL if present
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab && ['balance', 'purchase', 'convert', 'withdraw', 'history', 'transfer'].includes(tab)) {
      setActiveTab(tab)
    }
    
    loadWalletData()
  }, [location.search])

  const loadWalletData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      // Get user credits and transactions in parallel
      const [userCredits, userTransactions] = await Promise.all([
        getUserCredits(user.id),
        getUserTransactions(user.id, 20)
      ])
      
      setCredits(userCredits)
      setTransactions(userTransactions)
      
      // Get PayPal email from user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('paypal_email')
        .eq('id', user.id)
        .single()
      
      if (profile?.paypal_email) {
        setPaypalEmail(profile.paypal_email)
      }
    } catch (err) {
      console.error('Error loading wallet data:', err)
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    navigate(`/dashboard/wallet?tab=${tab}`)
    // Clear any error/success messages when changing tabs
    setError('')
    setSuccess('')
    setTransferError('')
    setTransferSuccess('')
  }

  const handleConvertCredits = async () => {
    if (!user || converting || convertAmount <= 0) return
    
    // Validate conversion amount
    if (convertAmount > credits.cashCredits) {
      setError(`You can only convert earned credits. You have ${credits.cashCredits} earned credits available.`)
      return
    }
    
    setConverting(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await transferCreditsToFiatBalance(user.id, convertAmount)
      
      if (result) {
        setSuccess(`Successfully converted ${convertAmount} credits to $${convertAmount} in your cash balance.`)
        setConvertAmount(0)
        
        // Refresh wallet data
        await loadWalletData()
      } else {
        throw new Error('Failed to convert credits')
      }
    } catch (error: any) {
      console.error('Error converting credits:', error)
      setError(error.message || 'Failed to convert credits. Please try again.')
    } finally {
      setConverting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!user || withdrawing || withdrawAmount <= 0 || !paypalEmail) return
    
    // Validate withdrawal amount
    if (withdrawAmount > credits.fiatBalance) {
      setError(`You can only withdraw from your cash balance. You have $${credits.fiatBalance} available.`)
      return
    }
    
    // Validate minimum withdrawal amount
    if (withdrawAmount < 50) {
      setError('Minimum withdrawal amount is $50.')
      return
    }
    
    // Validate PayPal email
    if (!paypalEmail.includes('@') || !paypalEmail.includes('.')) {
      setError('Please enter a valid PayPal email address.')
      return
    }
    
    setWithdrawing(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await processWithdrawalWithPaypal(user.id, withdrawAmount, paypalEmail)
      
      if (result) {
        setSuccess(`Withdrawal request for $${withdrawAmount} has been submitted. You will receive an email when the payment is processed.`)
        setWithdrawAmount(0)
        
        // Refresh wallet data
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
  
  const handleTransferCredits = async () => {
    if (!user || transferring || transferAmount <= 0 || !transferRecipient) return
    
    // Validate transfer amount
    if (transferAmount > credits.cashCredits) {
      setTransferError(`You can only transfer earned credits. You have ${credits.cashCredits} earned credits available.`)
      return
    }
    
    // Validate recipient
    if (!transferRecipient.trim()) {
      setTransferError('Please enter a recipient email or user ID.')
      return
    }
    
    setTransferring(true)
    setTransferError('')
    setTransferSuccess('')
    
    try {
      const result = await transferUserCredits(user.id, transferRecipient, transferAmount)
      
      if (result) {
        setTransferSuccess(`Successfully transferred ${transferAmount} credits to ${transferRecipient}.`)
        setTransferAmount(0)
        setTransferRecipient('')
        
        // Refresh wallet data
        await loadWalletData()
      } else {
        throw new Error('Failed to transfer credits')
      }
    } catch (error: any) {
      console.error('Error transferring credits:', error)
      setTransferError(error.message || 'Failed to transfer credits. Please try again.')
    } finally {
      setTransferring(false)
    }
  }

  const savePaypalEmail = async () => {
    if (!user || !paypalEmail) return
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ paypal_email: paypalEmail })
        .eq('id', user.id)
      
      if (error) throw error
      
      setSuccess('PayPal email saved successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      console.error('Error saving PayPal email:', error)
      setError('Failed to save PayPal email. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return <CreditCard className="h-5 w-5 text-green-500" />
      case 'credit_usage':
        return <ArrowRight className="h-5 w-5 text-red-500" />
      case 'withdrawal':
        return <ArrowLeft className="h-5 w-5 text-blue-500" />
      case 'refund':
        return <ArrowLeft className="h-5 w-5 text-purple-500" />
      case 'credit_earning':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <ArrowRight className="h-5 w-5 text-blue-500" />
      case 'credit_transfer_sent':
        return <Send className="h-5 w-5 text-red-500" />
      case 'credit_transfer_received':
        return <Send className="h-5 w-5 text-green-500" />
      default:
        return <WalletIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return 'text-green-600'
      case 'credit_usage':
        return 'text-red-600'
      case 'withdrawal':
        return 'text-blue-600'
      case 'refund':
        return 'text-purple-600'
      case 'credit_earning':
        return 'text-green-600'
      case 'credit_to_fiat_conversion':
        return 'text-blue-600'
      case 'credit_transfer_sent':
        return 'text-red-600'
      case 'credit_transfer_received':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'credit_purchase':
        return 'Credit Purchase'
      case 'credit_usage':
        return transaction.description || 'Credit Usage'
      case 'withdrawal':
        return 'Withdrawal'
      case 'refund':
        return 'Refund'
      case 'credit_earning':
        return transaction.description || 'Credit Earning'
      case 'credit_to_fiat_conversion':
        return 'Converted to Cash'
      case 'credit_transfer_sent':
        return 'Credit Transfer Sent'
      case 'credit_transfer_received':
        return 'Credit Transfer Received'
      default:
        return transaction.description || 'Transaction'
    }
  }

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Failed</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Cancelled</span>
      default:
        return null
    }
  }

  const renderBalanceTab = () => {
    return (
      <div className="space-y-6">
        {/* Credit Balances */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Your Credits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-green-800">Earned Credits</h4>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{credits.cashCredits}</p>
              <p className="text-xs text-green-700 mt-1">
                Earned from content, referrals, etc.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-blue-800">Purchased Credits</h4>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{credits.purchasedCredits}</p>
              <p className="text-xs text-blue-700 mt-1">
                Credits you've purchased
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-purple-800">Free Credits</h4>
                <WalletIcon className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{credits.freeCredits}</p>
              <p className="text-xs text-purple-700 mt-1">
                For posting referral jobs only
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Cash Balance</h4>
                <p className="text-sm text-gray-600">Available for withdrawal</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">${credits.fiatBalance.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleTabChange('purchase')}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Buy Credits</span>
            </button>
            
            <button
              onClick={() => handleTabChange('transfer')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              disabled={credits.cashCredits <= 0}
            >
              <Send className="h-4 w-4" />
              <span>Transfer</span>
            </button>
            
            <button
              onClick={() => handleTabChange('convert')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              disabled={credits.cashCredits <= 0}
            >
              <ArrowRight className="h-4 w-4" />
              <span>Convert to Cash</span>
            </button>
            
            <button
              onClick={() => handleTabChange('withdraw')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              disabled={credits.fiatBalance <= 0}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Withdraw Cash</span>
            </button>
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
              onClick={() => handleTabChange('history')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {getTransactionTitle(transaction)}
                      </h4>
                      <span className={`font-semibold ${transaction.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {formatDate(transaction.created_at)}
                      </span>
                      {getTransactionStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Credit Usage Guide */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            How to Use Your Credits
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Buy Premium Ideas</h4>
                <p className="text-sm text-gray-600">
                  Use credits to access premium business ideas in the Ideas Vault.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Post Referral Jobs</h4>
                <p className="text-sm text-gray-600">
                  Spend {REFERRAL_JOB_POSTING_COST} credits to post a referral job for your business.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Wrench className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Purchase Tools</h4>
                <p className="text-sm text-gray-600">
                  Buy premium tools and templates to help grow your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPurchaseTab = () => {
    return (
      <div className="space-y-6">
        {/* Current Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Current Balance
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total Credits:</span>
              <span className="font-bold text-gray-900">
                {credits.cashCredits + credits.purchasedCredits + credits.freeCredits}
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">Earned</p>
              <p className="text-xl font-bold text-green-600">{credits.cashCredits}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-blue-800">Purchased</p>
              <p className="text-xl font-bold text-blue-600">{credits.purchasedCredits}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-purple-800">Free</p>
              <p className="text-xl font-bold text-purple-600">{credits.freeCredits}</p>
            </div>
          </div>
        </div>
        
        {/* Credit Packages */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Purchase Credits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.credits}
                className={`border rounded-xl p-4 relative ${
                  pkg.popular ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    BEST VALUE
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{pkg.credits} Credits</h4>
                  <span className="text-xl font-bold text-gray-900">${pkg.price}</span>
                </div>
                
                {pkg.bonus && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium mb-3">
                    + {pkg.bonus} FREE credits for referral jobs
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <a
                    href={pkg.paypalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Pay with PayPal</span>
                  </a>
                  
                  <a
                    href={pkg.stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Pay with Card</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">How credits work:</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">1</span>
                </div>
                <span>1 credit = $1 in value</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">2</span>
                </div>
                <span>Use credits to buy premium content, post referral jobs, or purchase tools</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">3</span>
                </div>
                <span>Free credits can only be used for posting referral jobs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderTransferTab = () => {
    return (
      <div className="space-y-6">
        {/* Current Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Transfer Credits to Another User
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Send className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">How transfers work:</h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• You can only transfer earned credits (not purchased or free credits)</li>
                  <li>• Enter the recipient's email address or user ID</li>
                  <li>• Transfers are instant and cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Earned Credits
                </label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="font-bold text-gray-900">{credits.cashCredits}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email or User ID
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="recipient@example.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Transfer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={credits.cashCredits}
                    value={transferAmount || ''}
                    onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              
              {transferError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700 text-sm">{transferError}</p>
                </div>
              )}
              
              {transferSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-green-700 text-sm">{transferSuccess}</p>
                </div>
              )}
              
              <button
                onClick={handleTransferCredits}
                disabled={transferring || transferAmount <= 0 || transferAmount > credits.cashCredits || !transferRecipient}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {transferring ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Transferring...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Transfer Credits</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderConvertTab = () => {
    return (
      <div className="space-y-6">
        {/* Current Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Convert Credits to Cash
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How conversion works:</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• You can only convert earned credits (not purchased or free credits)</li>
                  <li>• Conversion rate: 1 credit = $1 in your cash balance</li>
                  <li>• Converted cash can be withdrawn to your PayPal account</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Earned Credits
                </label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="font-bold text-gray-900">{credits.cashCredits}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Cash Balance
                </label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="font-bold text-gray-900">${credits.fiatBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Convert
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={credits.cashCredits}
                    value={convertAmount || ''}
                    onChange={(e) => setConvertAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  You'll receive: ${convertAmount} in your cash balance
                </p>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}
              
              <button
                onClick={handleConvertCredits}
                disabled={converting || convertAmount <= 0 || convertAmount > credits.cashCredits}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {converting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    <span>Convert to Cash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderWithdrawTab = () => {
    return (
      <div className="space-y-6">
        {/* Current Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Montserrat' }}
          >
            Withdraw to PayPal
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How withdrawal works:</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Minimum withdrawal amount: $50</li>
                  <li>• Processing fee: 15% (industry standard for micro-payments)</li>
                  <li>• Processing time: 1-3 business days</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Cash Balance
                </label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="font-bold text-gray-900">${credits.fiatBalance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    onClick={savePaypalEmail}
                    className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                  >
                    Save Email
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="50"
                    max={credits.fiatBalance}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Minimum $50"
                  />
                </div>
                {withdrawAmount >= 50 && (
                  <p className="text-sm text-gray-500 mt-1">
                    You'll receive: ${(withdrawAmount * 0.85).toFixed(2)} after 15% fee
                  </p>
                )}
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}
              
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawAmount < 50 || withdrawAmount > credits.fiatBalance || !paypalEmail}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {withdrawing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    <span>Withdraw to PayPal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderHistoryTab = () => {
    return (
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
              <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {getTransactionTitle(transaction)}
                      </h4>
                      <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {transaction.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        {formatDate(transaction.created_at)}
                      </span>
                      {getTransactionStatusBadge(transaction.status)}
                    </div>
                    
                    {transaction.amount > 0 && (
                      <div className="mt-1 text-sm text-gray-500">
                        Amount: ${transaction.amount.toFixed(2)}
                      </div>
                    )}
                    
                    {transaction.payment_method && (
                      <div className="mt-1 text-sm text-gray-500">
                        Method: {transaction.payment_method}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'balance':
        return renderBalanceTab()
      case 'purchase':
        return renderPurchaseTab()
      case 'convert':
        return renderConvertTab()
      case 'withdraw':
        return renderWithdrawTab()
      case 'transfer':
        return renderTransferTab()
      case 'history':
        return renderHistoryTab()
      default:
        return renderBalanceTab()
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
              Manage your credits, cash balance, and transactions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-4 whitespace-nowrap">
              <button
                onClick={() => handleTabChange('balance')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'balance'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Balance
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
                Buy Credits
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
                onClick={() => handleTabChange('convert')}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'convert'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Convert to Cash
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
          <div className="max-w-4xl mx-auto">
            {renderActiveTab()}
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

export default Wallet