import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet as WalletIcon, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, History, Send, Plus, User, Loader, AlertCircle, CheckCircle, X } from 'lucide-react'
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
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal')
  
  const creditPackages = [
    { credits: 20, price: 20, popular: false },
    { credits: 50, price: 50, popular: false },
    { credits: 100, price: 100, popular: true, bonus: 200 },
    { credits: 200, price: 200, popular: false }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Buy Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
            Credits can be used to post referral jobs, promote your content, or purchase premium ideas and tools.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {creditPackages.map((pkg) => (
              <div 
                key={pkg.credits}
                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                  selectedPackage === pkg.credits 
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-100' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setSelectedPackage(pkg.credits)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                    Popular
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{pkg.credits}</div>
                  <div className="text-sm text-gray-500">Credits</div>
                  {pkg.bonus && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      +{pkg.bonus} FREE credits
                    </div>
                  )}
                  <div className="mt-2 text-lg font-semibold text-green-600">${pkg.price}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Payment Method</div>
            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  paymentMethod === 'paypal' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                PayPal
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                Credit Card
              </button>
            </div>
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
            disabled={!selectedPackage}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Proceed to Payment</span>
          </button>
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
  const [amount, setAmount] = useState<number>(0)

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
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
              Send credits to another Localhy user. You can transfer to any user by their email address.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <WalletIcon className="h-5 w-5" />
                <span className="font-medium">Available Credits: {availableCredits}</span>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email or User ID
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Transfer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={availableCredits}
                    value={amount || ''}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: 1 credit, Max: {availableCredits} credits
                </p>
              </div>
            </div>
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
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
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
  onUpdatePayPal,
  isProcessing,
  error
}: { 
  isOpen: boolean
  onClose: () => void
  onWithdraw: (amount: number) => void
  availableBalance: number
  paypalEmail: string
  onUpdatePayPal: (email: string) => void
  isProcessing: boolean
  error: string
}) => {
  const [amount, setAmount] = useState<number>(0)
  const [newPayPalEmail, setNewPayPalEmail] = useState(paypalEmail)
  const [isEditingPayPal, setIsEditingPayPal] = useState(!paypalEmail)
  const [savingPayPal, setSavingPayPal] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0 && amount <= availableBalance && paypalEmail) {
      onWithdraw(amount)
    }
  }

  const handleSavePayPal = async () => {
    if (!newPayPalEmail) return
    
    setSavingPayPal(true)
    try {
      await onUpdatePayPal(newPayPalEmail)
      setIsEditingPayPal(false)
    } finally {
      setSavingPayPal(false)
    }
  }

  // Calculate fee (15%)
  const fee = amount * 0.15
  const netAmount = amount - fee

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Withdraw to PayPal
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Available Balance: ${availableBalance.toFixed(2)}</span>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* PayPal Email */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    PayPal Email
                  </label>
                  {!isEditingPayPal && (
                    <button
                      type="button"
                      onClick={() => setIsEditingPayPal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingPayPal ? (
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newPayPalEmail}
                      onChange={(e) => setNewPayPalEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSavePayPal}
                      disabled={!newPayPalEmail || savingPayPal}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center space-x-1"
                    >
                      {savingPayPal ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">
                    {paypalEmail}
                  </div>
                )}
              </div>
              
              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="10"
                    max={availableBalance}
                    step="0.01"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={isEditingPayPal || !paypalEmail}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: $10.00, Max: ${availableBalance.toFixed(2)}
                </p>
              </div>
              
              {/* Fee Calculation */}
              {amount > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fee (15%):</span>
                    <span className="text-gray-900">-${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-700">You'll receive:</span>
                    <span className="text-green-600">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
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
              disabled={amount <= 0 || amount > availableBalance || isEditingPayPal || !paypalEmail || isProcessing}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
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
  const [amount, setAmount] = useState<number>(0)

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
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
              Convert your credits to cash balance at a 1:1 ratio. Cash balance can be withdrawn to your PayPal account.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Available Credits: {availableCredits}</span>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits to Convert
              </label>
              <input
                type="number"
                min="1"
                max={availableCredits}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: 1 credit, Max: {availableCredits} credits
              </p>
            </div>
            
            {amount > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Credits to convert:</span>
                  <span className="text-gray-900">{amount}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-700">Cash balance to receive:</span>
                  <span className="text-green-600">${amount.toFixed(2)}</span>
                </div>
              </div>
            )}
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
              disabled={amount <= 0 || amount > availableCredits || isProcessing}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4" />
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
  
  // Modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // User's PayPal email
  const [paypalEmail, setPaypalEmail] = useState('')

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
      
      // Fetch wallet data in parallel
      const [stats, transactions] = await Promise.all([
        getWalletStats(user.id),
        getUserTransactions(user.id, 50) // Get last 50 transactions
      ])
      
      setWalletStats(stats)
      setTransactions(transactions)
      
      // Extract PayPal email from user profile if available
      if (transactions.length > 0) {
        const withdrawalTx = transactions.find(tx => 
          tx.type === 'withdrawal' && 
          tx.withdrawal_method === 'paypal' && 
          tx.withdrawal_details?.paypal_email
        )
        
        if (withdrawalTx && withdrawalTx.withdrawal_details?.paypal_email) {
          setPaypalEmail(withdrawalTx.withdrawal_details.paypal_email)
        }
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

  const handleTransferCredits = async (recipient: string, amount: number) => {
    if (!user) return
    
    setIsProcessing(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await transferCredits(user.id, recipient, amount)
      
      if (result) {
        setSuccess(`Successfully transferred ${amount} credits to ${recipient}`)
        setShowTransferModal(false)
        
        // Reload wallet data to reflect the changes
        await loadWalletData()
      }
    } catch (err: any) {
      console.error('Error transferring credits:', err)
      setError(err.message || 'Failed to transfer credits. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConvertCredits = async (amount: number) => {
    if (!user) return
    
    setIsProcessing(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await transferCreditsToFiatBalance(user.id, amount)
      
      if (result) {
        setSuccess(`Successfully converted ${amount} credits to $${amount.toFixed(2)} cash balance`)
        setShowConvertModal(false)
        
        // Reload wallet data to reflect the changes
        await loadWalletData()
      }
    } catch (err: any) {
      console.error('Error converting credits:', err)
      setError(err.message || 'Failed to convert credits. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async (amount: number) => {
    if (!user) return
    
    setIsProcessing(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await processWithdrawal(user.id, amount)
      
      if (result) {
        setSuccess(`Withdrawal request for $${amount.toFixed(2)} has been submitted`)
        setShowWithdrawalModal(false)
        
        // Reload wallet data to reflect the changes
        await loadWalletData()
      }
    } catch (err: any) {
      console.error('Error processing withdrawal:', err)
      setError(err.message || 'Failed to process withdrawal. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdatePayPalEmail = async (email: string) => {
    if (!user) return
    
    try {
      const result = await updateUserPayPalEmail(user.id, email)
      
      if (result) {
        setPaypalEmail(email)
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating PayPal email:', err)
      return false
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return <CreditCard className="h-5 w-5 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />
      case 'refund':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
      case 'credit_earning':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <ArrowDownRight className="h-5 w-5 text-blue-500" />
      case 'credit_transfer_sent':
        return <Send className="h-5 w-5 text-red-500" />
      case 'credit_transfer_received':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
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
        return 'text-orange-600'
      case 'refund':
        return 'text-green-600'
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
    if (transaction.credits !== 0) {
      return `${transaction.credits > 0 ? '+' : ''}${transaction.credits} credits`
    }
    
    // For fiat transactions, show the dollar amount
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
              Manage your credits, earnings, and withdrawals
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
                Buy Credits
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
            {/* Success/Error Messages */}
            {(error || success) && (
              <div className="mb-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
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

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Credits Balance */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Credits Balance
                      </h2>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cash Credits:</span>
                        <span className="text-xl font-bold text-green-600">{walletStats.currentCredits}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Free Credits:</span>
                        <span className="text-xl font-bold text-purple-600">{walletStats.freeCredits}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-700 font-medium">Total Credits:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {walletStats.currentCredits + walletStats.freeCredits}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Buy Credits</span>
                      </button>
                      
                      <button
                        onClick={() => setShowTransferModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Transfer</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Cash Balance */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Cash Balance
                      </h2>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available Balance:</span>
                        <span className="text-2xl font-bold text-blue-600">${walletStats.fiatBalance.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Pending Earnings:</span>
                        <span className="text-lg font-medium text-yellow-600">${walletStats.pendingEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        disabled={walletStats.fiatBalance <= 0}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        <span>Withdraw</span>
                      </button>
                      
                      <button
                        onClick={() => setShowConvertModal(true)}
                        disabled={walletStats.currentCredits <= 0}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <ArrowDownRight className="h-4 w-4" />
                        <span>Convert Credits</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Stats Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Earnings Summary
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                      <p className="text-xl font-bold text-green-600">${walletStats.totalEarned.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-red-600">${walletStats.totalSpent.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Available Credits</p>
                      <p className="text-xl font-bold text-blue-600">{walletStats.currentCredits + walletStats.freeCredits}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Cash Balance</p>
                      <p className="text-xl font-bold text-purple-600">${walletStats.fiatBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Recent Transactions
                    </h2>
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
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {getTransactionAmount(transaction)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
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

            {/* Purchase Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Buy Credits
                  </h2>
                  
                  <p 
                    className="text-gray-600 mb-6"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Credits can be used to post referral jobs, promote your content, or purchase premium ideas and tools.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">20</div>
                        <div className="text-sm text-gray-500 mb-3">Credits</div>
                        <div className="text-lg font-semibold text-green-600">$20</div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">50</div>
                        <div className="text-sm text-gray-500 mb-3">Credits</div>
                        <div className="text-lg font-semibold text-green-600">$50</div>
                      </div>
                    </div>
                    
                    <div className="border border-green-300 bg-green-50 rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer relative">
                      <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                        Popular
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">100</div>
                        <div className="text-sm text-gray-500 mb-1">Credits</div>
                        <div className="text-xs text-green-600 font-medium mb-2">
                          +200 FREE credits
                        </div>
                        <div className="text-lg font-semibold text-green-600">$100</div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">200</div>
                        <div className="text-sm text-gray-500 mb-3">Credits</div>
                        <div className="text-lg font-semibold text-green-600">$200</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Purchase Credits</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Credit Usage Guide
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Post Referral Jobs</h3>
                        <p className="text-sm text-gray-600">
                          Spend 10 credits to post a referral job and reach potential referrers in your area.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Promote Your Content</h3>
                        <p className="text-sm text-gray-600">
                          Boost visibility of your ideas, referral jobs, or tools with promotional packages starting at 5 credits per day.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Access Premium Content</h3>
                        <p className="text-sm text-gray-600">
                          Use credits to unlock premium ideas and tools created by other community members.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Convert to Cash</h3>
                        <p className="text-sm text-gray-600">
                          Convert your credits to cash balance at a 1:1 ratio, which can be withdrawn to your PayPal account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 
                    className="text-lg font-semibold text-gray-900 mb-4"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Transaction History
                  </h2>
                  
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
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {getTransactionAmount(transaction)}
                            </p>
                            {transaction.payment_method && (
                              <p className="text-xs text-gray-500">
                                via {transaction.payment_method}
                              </p>
                            )}
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
      
      <CreditTransferModal 
        isOpen={showTransferModal} 
        onClose={() => setShowTransferModal(false)} 
        onTransfer={handleTransferCredits}
        availableCredits={walletStats.currentCredits}
        isProcessing={isProcessing}
        error={error}
      />
      
      <WithdrawalModal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)} 
        onWithdraw={handleWithdraw}
        availableBalance={walletStats.fiatBalance}
        paypalEmail={paypalEmail}
        onUpdatePayPal={handleUpdatePayPalEmail}
        isProcessing={isProcessing}
        error={error}
      />
      
      <ConvertCreditsModal 
        isOpen={showConvertModal} 
        onClose={() => setShowConvertModal(false)} 
        onConvert={handleConvertCredits}
        availableCredits={walletStats.currentCredits}
        isProcessing={isProcessing}
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