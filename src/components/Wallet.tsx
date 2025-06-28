import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Wallet as WalletIcon, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, History, Gift, Send, Plus, Loader, AlertCircle, CheckCircle, User, ChevronRight, ExternalLink } from 'lucide-react'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getUserCredits, 
  getUserTransactions, 
  getWalletStats, 
  updateUserPayPalEmail, 
  transferCreditsToFiatBalance, 
  processWithdrawal,
  transferCredits,
  type Transaction,
  type WalletStats
} from '../lib/database'

// Credit Purchase Modal
const CreditPurchaseModal = ({ 
  isOpen, 
  onClose, 
  onPurchase, 
  selectedPackage, 
  processing 
}: { 
  isOpen: boolean
  onClose: () => void
  onPurchase: () => void
  selectedPackage: { credits: number, price: number, bonus?: number } | null
  processing: boolean
}) => {
  if (!isOpen || !selectedPackage) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Confirm Purchase
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-green-800">Credit Package</h4>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-green-700">Credits:</span>
              <span className="font-semibold text-green-800">{selectedPackage.credits}</span>
            </div>
            {selectedPackage.bonus && (
              <div className="flex justify-between mb-2">
                <span className="text-green-700">Bonus Credits:</span>
                <span className="font-semibold text-green-800">+{selectedPackage.bonus}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-green-200">
              <span className="text-green-700 font-medium">Price:</span>
              <span className="font-semibold text-green-800">${selectedPackage.price.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You'll be redirected to our secure payment processor to complete your purchase. After payment, credits will be instantly added to your account.
          </p>

          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">Note:</p>
            <p>This is a demo. In a real app, you would be redirected to a payment processor.</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onPurchase}
            disabled={processing}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Withdrawal Modal
const WithdrawalModal = ({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  maxAmount, 
  processing,
  paypalEmail,
  onUpdatePayPalEmail
}: { 
  isOpen: boolean
  onClose: () => void
  onWithdraw: (amount: number) => void
  maxAmount: number
  processing: boolean
  paypalEmail: string
  onUpdatePayPalEmail: (email: string) => void
}) => {
  const [amount, setAmount] = useState('')
  const [newPayPalEmail, setNewPayPalEmail] = useState('')
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setNewPayPalEmail(paypalEmail || '')
      setEditingEmail(!paypalEmail)
      setEmailError('')
    }
  }, [isOpen, paypalEmail])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSaveEmail = () => {
    if (!validateEmail(newPayPalEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    setEmailError('')
    onUpdatePayPalEmail(newPayPalEmail)
    setEditingEmail(false)
  }

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount)
    if (numAmount > 0 && numAmount <= maxAmount) {
      onWithdraw(numAmount)
    }
  }

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Withdraw Funds
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-blue-800">Available Balance</h4>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-blue-700 font-medium">Available for withdrawal:</span>
              <span className="font-semibold text-blue-800">${maxAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* PayPal Email Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PayPal Email
            </label>
            {editingEmail ? (
              <div>
                <input
                  type="email"
                  value={newPayPalEmail}
                  onChange={(e) => setNewPayPalEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  placeholder="your-paypal-email@example.com"
                />
                {emailError && (
                  <p className="text-red-600 text-sm mb-2">{emailError}</p>
                )}
                <button
                  onClick={handleSaveEmail}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Save Email
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{paypalEmail}</span>
                <button
                  onClick={() => setEditingEmail(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                disabled={editingEmail || !paypalEmail}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Minimum withdrawal: $10.00
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-yellow-800">Fee Information:</p>
            <p className="text-yellow-700">
              A 15% processing fee will be deducted from your withdrawal amount.
            </p>
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <div className="flex justify-between text-yellow-800">
                  <span>Withdrawal amount:</span>
                  <span>${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-yellow-800">
                  <span>Fee (15%):</span>
                  <span>-${(parseFloat(amount) * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-yellow-800 pt-1">
                  <span>You'll receive:</span>
                  <span>${(parseFloat(amount) * 0.85).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={!isValidAmount || editingEmail || !paypalEmail || processing}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4" />
                <span>Withdraw Funds</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Transfer Credits Modal
const TransferCreditsModal = ({ 
  isOpen, 
  onClose, 
  onTransfer, 
  maxAmount, 
  processing
}: { 
  isOpen: boolean
  onClose: () => void
  onTransfer: (recipient: string, amount: number) => void
  maxAmount: number
  processing: boolean
}) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRecipient('')
      setAmount('')
      setError('')
    }
  }, [isOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow integers
    if (/^\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleTransfer = () => {
    setError('')
    
    // Validate recipient
    if (!recipient.trim()) {
      setError('Please enter a recipient email or ID')
      return
    }
    
    // Validate amount
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    
    if (numAmount > maxAmount) {
      setError(`You can only transfer up to ${maxAmount} credits`)
      return
    }
    
    onTransfer(recipient, numAmount)
  }

  const isValidAmount = amount && parseInt(amount) > 0 && parseInt(amount) <= maxAmount

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Transfer Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Send className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-purple-800">Transfer Information</h4>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-purple-700 font-medium">Available credits:</span>
              <span className="font-semibold text-purple-800">{maxAmount} credits</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Recipient Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email or ID
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="email@example.com or user ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the email address or user ID of the recipient
            </p>
          </div>

          {/* Amount Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Transfer
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter amount"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                credits
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Only cash credits can be transferred (not free credits)
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-yellow-800">Important:</p>
            <p className="text-yellow-700">
              Credit transfers are final and cannot be reversed. Please double-check the recipient information before confirming.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!recipient || !isValidAmount || processing}
            className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
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
  )
}

const Wallet = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<{ credits: number, price: number, bonus?: number } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paypalEmail, setPaypalEmail] = useState('')

  // Credit packages
  const creditPackages = [
    { credits: 20, price: 20 },
    { credits: 50, price: 50 },
    { credits: 100, price: 100, bonus: 200 } // 100 credits + 200 free credits
  ]

  useEffect(() => {
    loadWalletData()
    
    // Check if there's a tab parameter in the URL
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'purchase', 'withdraw', 'transfer', 'history'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  const loadWalletData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      
      // Fetch wallet data in parallel
      const [stats, userTransactions, credits] = await Promise.all([
        getWalletStats(user.id),
        getUserTransactions(user.id),
        getUserCredits(user.id)
      ])
      
      setWalletStats(stats)
      setTransactions(userTransactions)
      
      // Get PayPal email from user profile
      const { data } = await supabase
        .from('user_profiles')
        .select('paypal_email')
        .eq('id', user.id)
        .single()
      
      if (data && data.paypal_email) {
        setPaypalEmail(data.paypal_email)
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
    // Update URL without reloading the page
    navigate(`/dashboard/wallet?tab=${tab}`, { replace: true })
  }

  const handlePurchaseCredits = (pkg: { credits: number, price: number, bonus?: number }) => {
    setSelectedPackage(pkg)
    setPurchaseModalOpen(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !user) return

    setProcessing(true)
    setError('')
    
    try {
      // In a real app, this would redirect to a payment processor
      // For demo purposes, we'll simulate a successful purchase
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful purchase
      const { data } = await supabase.rpc('add_credits_to_user', {
        p_user_id: user.id,
        p_credits: selectedPackage.credits,
        p_amount: selectedPackage.price,
        p_description: `Purchased ${selectedPackage.credits} credits${selectedPackage.bonus ? ` with ${selectedPackage.bonus} bonus credits` : ''}`,
        p_payment_method: 'Demo',
        p_payment_id: `demo-${Date.now()}`
      })
      
      if (data) {
        setSuccess(`Successfully purchased ${selectedPackage.credits} credits${selectedPackage.bonus ? ` with ${selectedPackage.bonus} bonus credits` : ''}!`)
        setPurchaseModalOpen(false)
        
        // Reload wallet data
        await loadWalletData()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        throw new Error('Failed to process purchase')
      }
    } catch (err: any) {
      console.error('Error processing purchase:', err)
      setError(err.message || 'Failed to process purchase. Please try again.')
    } finally {
      setProcessing(false)
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
    } catch (err: any) {
      console.error('Error updating PayPal email:', err)
      setError(err.message || 'Failed to update PayPal email. Please try again.')
    }
  }

  const handleWithdraw = async (amount: number) => {
    if (!user || !paypalEmail) return

    setProcessing(true)
    setError('')
    
    try {
      const success = await processWithdrawal(user.id, amount)
      
      if (success) {
        setSuccess(`Withdrawal request for $${amount.toFixed(2)} has been submitted!`)
        setWithdrawalModalOpen(false)
        
        // Reload wallet data
        await loadWalletData()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        throw new Error('Failed to process withdrawal')
      }
    } catch (err: any) {
      console.error('Error processing withdrawal:', err)
      setError(err.message || 'Failed to process withdrawal. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleTransferCredits = async (recipient: string, amount: number) => {
    if (!user) return

    setProcessing(true)
    setError('')
    
    try {
      const success = await transferCredits(user.id, recipient, amount)
      
      if (success) {
        setSuccess(`Successfully transferred ${amount} credits!`)
        setTransferModalOpen(false)
        
        // Reload wallet data
        await loadWalletData()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        throw new Error('Failed to transfer credits')
      }
    } catch (err: any) {
      console.error('Error transferring credits:', err)
      setError(err.message || 'Failed to transfer credits. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleConvertCreditsToFiat = async () => {
    if (!user || walletStats.currentCredits <= 0) return

    try {
      setProcessing(true)
      setError('')
      
      const success = await transferCreditsToFiatBalance(user.id, walletStats.currentCredits)
      
      if (success) {
        setSuccess(`Successfully converted ${walletStats.currentCredits} credits to $${walletStats.currentCredits.toFixed(2)}!`)
        
        // Reload wallet data
        await loadWalletData()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        throw new Error('Failed to convert credits to cash')
      }
    } catch (err: any) {
      console.error('Error converting credits:', err)
      setError(err.message || 'Failed to convert credits to cash. Please try again.')
    } finally {
      setProcessing(false)
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
        return <CreditCard className="h-5 w-5 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />
      case 'refund':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'credit_earning':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <ArrowUpRight className="h-5 w-5 text-purple-500" />
      case 'credit_transfer_sent':
        return <Send className="h-5 w-5 text-red-500" />
      case 'credit_transfer_received':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      default:
        return <History className="h-5 w-5 text-gray-500" />
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
        return 'text-green-600'
      case 'credit_earning':
        return 'text-green-600'
      case 'credit_to_fiat_conversion':
        return 'text-purple-600'
      case 'credit_transfer_sent':
        return 'text-red-600'
      case 'credit_transfer_received':
        return 'text-green-600'
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credits Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Credits Balance
            </h3>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <WalletIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cash Credits:</span>
              <span className="text-xl font-bold text-green-600">{walletStats.currentCredits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Free Credits:</span>
              <span className="text-xl font-bold text-purple-600">{walletStats.freeCredits}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="text-xl font-bold text-gray-900">{walletStats.currentCredits + walletStats.freeCredits}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleTabChange('purchase')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium"
            >
              Buy More Credits
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
              <span className="text-xl font-bold text-blue-600">${walletStats.fiatBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending:</span>
              <span className="text-xl font-bold text-yellow-600">${walletStats.pendingEarnings.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setWithdrawalModalOpen(true)}
              disabled={walletStats.fiatBalance <= 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium"
            >
              Withdraw Funds
            </button>
            
            {walletStats.currentCredits > 0 && (
              <button
                onClick={handleConvertCreditsToFiat}
                disabled={processing}
                className="w-full border border-purple-500 text-purple-500 hover:bg-purple-50 py-2 px-4 rounded-lg font-medium"
              >
                Convert Credits to Cash
              </button>
            )}
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
              <History className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earned:</span>
              <span className="text-xl font-bold text-green-600">${walletStats.totalEarned.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spent:</span>
              <span className="text-xl font-bold text-red-600">${walletStats.totalSpent.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleTabChange('history')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
            >
              View Transaction History
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
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
        
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <p 
                className="text-gray-500 text-sm"
                style={{ fontFamily: 'Inter' }}
              >
                No transactions yet
              </p>
            </div>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-4"
          style={{ fontFamily: 'Montserrat' }}
        >
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleTabChange('purchase')}
            className="flex items-center justify-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg transition-colors"
          >
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Buy Credits</span>
          </button>
          
          <button
            onClick={() => setTransferModalOpen(true)}
            disabled={walletStats.currentCredits <= 0}
            className="flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 text-purple-700 p-4 rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
            <span className="font-medium">Transfer Credits</span>
          </button>
          
          <button
            onClick={() => setWithdrawalModalOpen(true)}
            disabled={walletStats.fiatBalance <= 0}
            className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-700 p-4 rounded-lg transition-colors"
          >
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">Withdraw Funds</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderPurchaseTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-6"
          style={{ fontFamily: 'Montserrat' }}
        >
          Purchase Credits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg, index) => (
            <div 
              key={index}
              className="border border-gray-200 hover:border-green-300 rounded-xl p-6 text-center transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {pkg.credits} Credits
              </h4>
              
              {pkg.bonus && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                  +{pkg.bonus} Free Credits
                </div>
              )}
              
              <p className="text-gray-600 mb-4">
                ${pkg.price.toFixed(2)}
              </p>
              
              <button
                onClick={() => handlePurchaseCredits(pkg)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium"
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">About Credits</h4>
          <p className="text-gray-600 text-sm mb-2">
            Credits are used to post referral jobs, promote your content, and access premium features on Localhy.
          </p>
          <p className="text-gray-600 text-sm">
            You can earn credits by referring customers to businesses, sharing ideas that get views, and more.
          </p>
        </div>
      </div>
    </div>
  )

  const renderWithdrawTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-6"
          style={{ fontFamily: 'Montserrat' }}
        >
          Withdraw Funds
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Balance Card */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Available Balance</h4>
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              ${walletStats.fiatBalance.toFixed(2)}
            </div>
            <p className="text-blue-600 text-sm">
              This is the amount you can withdraw to your account
            </p>
          </div>
          
          {/* Withdrawal Method */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-800">Withdrawal Method</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">P</span>
                  </div>
                  <span className="font-medium text-gray-700">PayPal</span>
                </div>
                <div className="text-sm text-gray-500">
                  {paypalEmail ? 'Connected' : 'Not connected'}
                </div>
              </div>
              
              <div>
                {paypalEmail ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{paypalEmail}</span>
                    <button
                      onClick={() => setWithdrawalModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add PayPal Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-yellow-800 mb-2">Withdrawal Information</h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li className="flex items-start space-x-2">
              <span className="text-yellow-800 font-bold">•</span>
              <span>Minimum withdrawal amount: $10.00</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-800 font-bold">•</span>
              <span>Processing fee: 15% of withdrawal amount</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-800 font-bold">•</span>
              <span>Processing time: 1-3 business days</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={() => setWithdrawalModalOpen(true)}
          disabled={walletStats.fiatBalance <= 0}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium"
        >
          Withdraw Funds
        </button>
      </div>
    </div>
  )

  const renderTransferTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-6"
          style={{ fontFamily: 'Montserrat' }}
        >
          Transfer Credits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Credits Card */}
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <WalletIcon className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-800">Available Credits</h4>
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {walletStats.currentCredits}
            </div>
            <p className="text-purple-600 text-sm">
              Cash credits available for transfer
            </p>
            <p className="text-purple-600 text-sm mt-2">
              <span className="font-medium">Note:</span> Free credits ({walletStats.freeCredits}) cannot be transferred
            </p>
          </div>
          
          {/* Transfer Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Send className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-800">Transfer Information</h4>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-gray-800 font-bold">•</span>
                <span>You can transfer credits to any Localhy user</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-800 font-bold">•</span>
                <span>Enter the recipient's email address or user ID</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-800 font-bold">•</span>
                <span>Transfers are final and cannot be reversed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-800 font-bold">•</span>
                <span>No fees for transferring credits</span>
              </li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => setTransferModalOpen(true)}
          disabled={walletStats.currentCredits <= 0}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium"
        >
          Transfer Credits
        </button>
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-6"
          style={{ fontFamily: 'Montserrat' }}
        >
          Transaction History
        </h3>
        
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <p 
                className="text-gray-500 text-sm"
                style={{ fontFamily: 'Inter' }}
              >
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(transaction.created_at)}</div>
                        <div className="text-xs">{formatTime(transaction.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">
                            {transaction.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={getTransactionColor(transaction.type)}>
                          {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                        </span>
                        {transaction.amount > 0 && (
                          <div className="text-xs text-gray-500">
                            ${transaction.amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getTransactionStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              Manage your credits, earnings, and transactions
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="max-w-6xl mx-auto">
              {error && (
                <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{success}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar space-x-1 py-1">
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'text-green-600 border-b-2 border-green-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('purchase')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'purchase' 
                    ? 'text-green-600 border-b-2 border-green-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Buy Credits
              </button>
              <button
                onClick={() => handleTabChange('withdraw')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'withdraw' 
                    ? 'text-green-600 border-b-2 border-green-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Withdraw
              </button>
              <button
                onClick={() => handleTabChange('transfer')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'transfer' 
                    ? 'text-green-600 border-b-2 border-green-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Transfer
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'text-green-600 border-b-2 border-green-500' 
                    : 'text-gray-600 hover:text-gray-900'
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
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreditPurchaseModal 
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onPurchase={handleConfirmPurchase}
        selectedPackage={selectedPackage}
        processing={processing}
      />
      
      <WithdrawalModal 
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        onWithdraw={handleWithdraw}
        maxAmount={walletStats.fiatBalance}
        processing={processing}
        paypalEmail={paypalEmail}
        onUpdatePayPalEmail={handleUpdatePayPalEmail}
      />
      
      <TransferCreditsModal 
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransferCredits}
        maxAmount={walletStats.currentCredits}
        processing={processing}
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