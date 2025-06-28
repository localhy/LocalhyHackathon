import React, { useState, useEffect } from 'react'
import { Wallet as WalletIcon, DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter, Search, Download, Mail, Save, Loader, AlertCircle, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
const PurchaseCreditsModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  if (!isVisible) return null

  const creditPackages = [
    { credits: 20, price: 20, popular: false },
    { credits: 50, price: 50, popular: false },
    { credits: 100, price: 100, popular: true, bonus: 200 },
    { credits: 200, price: 200, popular: false }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Purchase Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {creditPackages.map((pkg) => (
            <div 
              key={pkg.credits}
              className={`border ${pkg.popular ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg p-4 relative hover:shadow-md transition-shadow cursor-pointer`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Best Value
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{pkg.credits} Credits</h4>
                  {pkg.bonus && (
                    <p className="text-green-600 text-sm font-medium">+ {pkg.bonus} FREE Credits</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${pkg.price}</p>
                  {pkg.bonus && (
                    <p className="text-xs text-gray-500">
                      ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} per credit
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-800 mb-2">How Credits Work</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use credits to post referral jobs (10 credits)</li>
            <li>• Promote your content for more visibility</li>
            <li>• Access premium ideas and tools</li>
            <li>• Credits never expire</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Payment processing is not implemented in this demo')
              onClose()
            }}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Continue to Payment</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Withdrawal Modal
const WithdrawalModal = ({ 
  isVisible, 
  onClose, 
  fiatBalance, 
  paypalEmail, 
  onUpdatePayPal, 
  onWithdraw 
}: { 
  isVisible: boolean
  onClose: () => void
  fiatBalance: number
  paypalEmail: string | null
  onUpdatePayPal: (email: string) => Promise<boolean>
  onWithdraw: (amount: number) => Promise<boolean>
}) => {
  const [amount, setAmount] = useState<number>(0)
  const [email, setEmail] = useState(paypalEmail || '')
  const [editingEmail, setEditingEmail] = useState(!paypalEmail)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isVisible) {
      setAmount(0)
      setEmail(paypalEmail || '')
      setEditingEmail(!paypalEmail)
      setError('')
      setSuccess('')
    }
  }, [isVisible, paypalEmail])

  const handleSaveEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      const success = await onUpdatePayPal(email)
      if (success) {
        setEditingEmail(false)
        setSuccess('PayPal email updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update PayPal email')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update PayPal email')
    } finally {
      setSaving(false)
    }
  }

  const handleWithdraw = async () => {
    if (amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > fiatBalance) {
      setError('Withdrawal amount exceeds your available balance')
      return
    }

    if (!paypalEmail && !email) {
      setError('Please set your PayPal email first')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      // If email was just updated but not saved yet, save it first
      if (editingEmail) {
        await handleSaveEmail()
      }
      
      const success = await onWithdraw(amount)
      if (success) {
        setSuccess('Withdrawal request submitted successfully')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to process withdrawal')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process withdrawal')
    } finally {
      setSaving(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Withdraw Funds
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Success!</h4>
            <p className="text-gray-600 mb-6">{success}</p>
            <button
              onClick={onClose}
              className="bg-green-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-600"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Available Balance:</span>
                <span className="text-blue-800 font-bold">${fiatBalance.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* PayPal Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Email
                </label>
                {editingEmail ? (
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={saving}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center space-x-1"
                    >
                      {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{paypalEmail}</span>
                    </div>
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      Edit
                    </button>
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
                    min="1"
                    max={fiatBalance}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, fiatBalance))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum withdrawal: $10.00. A 15% fee applies to all withdrawals.
                </p>
              </div>

              {/* Fee Calculation */}
              {amount > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Withdrawal Amount:</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fee (15%):</span>
                    <span className="font-medium">-${(amount * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">You'll Receive:</span>
                    <span className="font-bold">${(amount * 0.85).toFixed(2)}</span>
                  </div>
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
              <button
                onClick={handleWithdraw}
                disabled={saving || amount <= 0 || amount > fiatBalance || (editingEmail && !email)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                {saving ? (
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
          </>
        )}
      </div>
    </div>
  )
}

// Credit Transfer Modal
const TransferCreditsModal = ({ 
  isVisible, 
  onClose, 
  cashCredits,
  onTransfer
}: { 
  isVisible: boolean
  onClose: () => void
  cashCredits: number
  onTransfer: (recipient: string, amount: number) => Promise<boolean>
}) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isVisible) {
      setRecipient('')
      setAmount(0)
      setError('')
      setSuccess('')
    }
  }, [isVisible])

  const handleTransfer = async () => {
    if (!recipient.trim()) {
      setError('Please enter a recipient email or ID')
      return
    }

    if (amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > cashCredits) {
      setError('Transfer amount exceeds your available cash credits')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      const success = await onTransfer(recipient, amount)
      if (success) {
        setSuccess('Credits transferred successfully')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to transfer credits')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to transfer credits')
    } finally {
      setSaving(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Transfer Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Success!</h4>
            <p className="text-gray-600 mb-6">{success}</p>
            <button
              onClick={onClose}
              className="bg-green-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-600"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Available Cash Credits:</span>
                <span className="text-blue-800 font-bold">{cashCredits}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Note: Only cash credits can be transferred, not free credits.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email or ID
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com or user ID"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Transfer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={cashCredits}
                    value={amount}
                    onChange={(e) => setAmount(Math.min(parseInt(e.target.value) || 0, cashCredits))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                onClick={handleTransfer}
                disabled={saving || amount <= 0 || amount > cashCredits || !recipient.trim()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Transfer</span>
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

// Convert Credits Modal
const ConvertCreditsModal = ({ 
  isVisible, 
  onClose, 
  cashCredits,
  onConvert
}: { 
  isVisible: boolean
  onClose: () => void
  cashCredits: number
  onConvert: (amount: number) => Promise<boolean>
}) => {
  const [amount, setAmount] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isVisible) {
      setAmount(0)
      setError('')
      setSuccess('')
    }
  }, [isVisible])

  const handleConvert = async () => {
    if (amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > cashCredits) {
      setError('Conversion amount exceeds your available cash credits')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      const success = await onConvert(amount)
      if (success) {
        setSuccess('Credits converted to cash successfully')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to convert credits')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to convert credits')
    } finally {
      setSaving(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Convert Credits to Cash
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Success!</h4>
            <p className="text-gray-600 mb-6">{success}</p>
            <button
              onClick={onClose}
              className="bg-green-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-600"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Available Cash Credits:</span>
                <span className="text-blue-800 font-bold">{cashCredits}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Convert your cash credits to cash balance at a 1:1 ratio. Free credits cannot be converted.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Convert
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={cashCredits}
                    value={amount}
                    onChange={(e) => setAmount(Math.min(parseInt(e.target.value) || 0, cashCredits))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {amount > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Credits to Convert:</span>
                    <span className="font-medium">{amount}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Cash to Receive:</span>
                    <span className="font-bold">${amount.toFixed(2)}</span>
                  </div>
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
              <button
                onClick={handleConvert}
                disabled={saving || amount <= 0 || amount > cashCredits}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Convert</span>
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

const Wallet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [cashCredits, setCashCredits] = useState(0)
  const [freeCredits, setFreeCredits] = useState(0)
  const [fiatBalance, setFiatBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paypalEmail, setPaypalEmail] = useState<string | null>(null)
  
  // Modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [convertModalOpen, setConvertModalOpen] = useState(false)

  // Get active tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'transactions', 'purchase', 'withdraw'].includes(tab)) {
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
      const [credits, walletStats, userTransactions, userProfile] = await Promise.all([
        getUserCredits(user.id),
        getWalletStats(user.id),
        getUserTransactions(user.id),
        // Get user profile to check for PayPal email
        fetch(`/api/user-profile?userId=${user.id}`).then(res => res.json())
      ])

      setCashCredits(credits.cashCredits)
      setFreeCredits(credits.freeCredits)
      setFiatBalance(walletStats.fiatBalance)
      setStats(walletStats)
      setTransactions(userTransactions)
      setPaypalEmail(userProfile?.paypal_email || null)
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
    // Update URL query parameter
    navigate(`/dashboard/wallet?tab=${tab}`, { replace: true })
  }

  const handleUpdatePayPalEmail = async (email: string): Promise<boolean> => {
    try {
      if (!user) return false
      
      const success = await updateUserPayPalEmail(user.id, email)
      if (success) {
        setPaypalEmail(email)
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating PayPal email:', error)
      throw error
    }
  }

  const handleWithdraw = async (amount: number): Promise<boolean> => {
    try {
      if (!user) return false
      
      const success = await processWithdrawal(user.id, amount)
      if (success) {
        // Reload wallet data to reflect the new balance
        await loadWalletData()
        return true
      }
      return false
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      throw error
    }
  }

  const handleTransferCredits = async (recipient: string, amount: number): Promise<boolean> => {
    try {
      if (!user) return false
      
      const success = await transferCredits(user.id, recipient, amount)
      if (success) {
        // Reload wallet data to reflect the new balance
        await loadWalletData()
        return true
      }
      return false
    } catch (error) {
      console.error('Error transferring credits:', error)
      throw error
    }
  }

  const handleConvertCredits = async (amount: number): Promise<boolean> => {
    try {
      if (!user) return false
      
      const success = await transferCreditsToFiatBalance(user.id, amount)
      if (success) {
        // Reload wallet data to reflect the new balance
        await loadWalletData()
        return true
      }
      return false
    } catch (error) {
      console.error('Error converting credits:', error)
      throw error
    }
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
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'credit_earning':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <ArrowDownLeft className="h-5 w-5 text-blue-500" />
      case 'credit_transfer_sent':
        return <ArrowUpRight className="h-5 w-5 text-purple-500" />
      case 'credit_transfer_received':
        return <ArrowDownLeft className="h-5 w-5 text-purple-500" />
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
      day: 'numeric'
    })
  }

  const formatTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'credit_purchase':
        return `Purchased ${transaction.credits} credits`
      case 'credit_usage':
        return transaction.description || 'Used credits'
      case 'withdrawal':
        return `Withdrawal to ${transaction.withdrawal_method || 'bank'}`
      case 'refund':
        return 'Refund received'
      case 'credit_earning':
        return transaction.description || 'Earned credits'
      case 'credit_to_fiat_conversion':
        return 'Converted credits to cash'
      case 'credit_transfer_sent':
        return 'Sent credits to user'
      case 'credit_transfer_received':
        return 'Received credits from user'
      default:
        return transaction.description || 'Transaction'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
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
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar space-x-6">
              <button
                onClick={() => handleTabChange('overview')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('transactions')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Transactions
              </button>
              <button
                onClick={() => handleTabChange('purchase')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'purchase'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Buy Credits
              </button>
              <button
                onClick={() => handleTabChange('withdraw')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'withdraw'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={loadWalletData}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cash Credits */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                        Cash Credits
                      </h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <WalletIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {cashCredits}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Use for purchases, transfers, or convert to cash
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTransferModalOpen(true)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={() => setConvertModalOpen(true)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        Convert to Cash
                      </button>
                    </div>
                  </div>

                  {/* Free Credits */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                        Free Credits
                      </h3>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <WalletIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {freeCredits}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Bonus credits from promotions and purchases
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTabChange('purchase')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        Get More Credits
                      </button>
                    </div>
                  </div>

                  {/* Cash Balance */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                        Cash Balance
                      </h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      ${fiatBalance.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Available for withdrawal to your PayPal account
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setWithdrawalModalOpen(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        disabled={fiatBalance < 10}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                      Earnings Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                        <p className="text-xl font-bold text-gray-900">${stats.totalEarned.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                        <p className="text-xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Pending Earnings</p>
                        <p className="text-xl font-bold text-gray-900">${stats.pendingEarnings.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                        <p className="text-xl font-bold text-gray-900">${(fiatBalance + cashCredits + freeCredits).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                      Recent Transactions
                    </h3>
                    <button
                      onClick={() => handleTabChange('transactions')}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        No transactions yet
                      </h4>
                      <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
                        Your transaction history will appear here
                      </p>
                      <button
                        onClick={() => handleTabChange('purchase')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Buy Credits
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {formatTransactionTitle(transaction)}
                              </h4>
                              {getTransactionStatusIcon(transaction.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-semibold ${
                              ['credit_purchase', 'credit_usage', 'withdrawal', 'credit_transfer_sent'].includes(transaction.type)
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {['credit_purchase', 'credit_usage', 'withdrawal', 'credit_transfer_sent'].includes(transaction.type) ? '-' : '+'}
                              {transaction.credits ? `${Math.abs(transaction.credits)} credits` : `$${Math.abs(Number(transaction.amount)).toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                    
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Filter</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Export</span>
                    </button>
                  </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        No transactions yet
                      </h4>
                      <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
                        Your transaction history will appear here
                      </p>
                      <button
                        onClick={() => handleTabChange('purchase')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Buy Credits
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {formatTransactionTitle(transaction)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {transaction.type.replace(/_/g, ' ')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  {getTransactionStatusIcon(transaction.status)}
                                  <span className={`text-sm ${
                                    transaction.status === 'completed' ? 'text-green-600' :
                                    transaction.status === 'pending' ? 'text-yellow-600' :
                                    transaction.status === 'failed' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                <span className={`${
                                  ['credit_purchase', 'credit_usage', 'withdrawal', 'credit_transfer_sent'].includes(transaction.type)
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}>
                                  {['credit_purchase', 'credit_usage', 'withdrawal', 'credit_transfer_sent'].includes(transaction.type) ? '-' : '+'}
                                  {transaction.credits ? `${Math.abs(transaction.credits)} credits` : `$${Math.abs(Number(transaction.amount)).toFixed(2)}`}
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
            )}

            {/* Buy Credits Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Buy Credits
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { credits: 20, price: 20, popular: false },
                      { credits: 50, price: 50, popular: false },
                      { credits: 100, price: 100, popular: true, bonus: 200 },
                      { credits: 200, price: 200, popular: false }
                    ].map((pkg) => (
                      <div 
                        key={pkg.credits}
                        className={`border ${pkg.popular ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg p-4 relative hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => setPurchaseModalOpen(true)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Best Value
                          </div>
                        )}
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900 text-lg">{pkg.credits} Credits</h4>
                          {pkg.bonus && (
                            <p className="text-green-600 text-sm font-medium">+ {pkg.bonus} FREE Credits</p>
                          )}
                          <p className="text-xl font-bold text-gray-900 mt-2">${pkg.price}</p>
                          {pkg.bonus && (
                            <p className="text-xs text-gray-500">
                              ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} per credit
                            </p>
                          )}
                          <button
                            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">How Credits Work</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use credits to post referral jobs (10 credits)</li>
                      <li>• Promote your content for more visibility</li>
                      <li>• Access premium ideas and tools</li>
                      <li>• Credits never expire</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Current Balance
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Cash Credits</p>
                      <p className="text-xl font-bold text-gray-900">{cashCredits}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Free Credits</p>
                      <p className="text-xl font-bold text-gray-900">{freeCredits}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Withdraw Funds
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">Available for Withdrawal</h4>
                        <span className="text-xl font-bold text-blue-800">${fiatBalance.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        This is your cash balance that can be withdrawn to your PayPal account.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">PayPal Email</h4>
                        <button
                          onClick={() => setWithdrawalModalOpen(true)}
                          className="text-blue-600 text-sm hover:text-blue-700"
                        >
                          {paypalEmail ? 'Edit' : 'Set Up'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">
                        {paypalEmail || 'No PayPal email set up yet. Click "Set Up" to add your PayPal email.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => setWithdrawalModalOpen(true)}
                      disabled={fiatBalance < 10}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Withdraw to PayPal</span>
                    </button>
                  </div>
                  
                  {fiatBalance < 10 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Minimum withdrawal amount is $10.00
                    </p>
                  )}
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Convert Credits to Cash
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">Available Cash Credits</h4>
                      <span className="text-xl font-bold text-gray-900">{cashCredits}</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Convert your cash credits to cash balance at a 1:1 ratio. Free credits cannot be converted.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => setConvertModalOpen(true)}
                      disabled={cashCredits <= 0}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      <span>Convert Credits to Cash</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Withdrawal Policy
                  </h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Minimum withdrawal amount: $10.00</p>
                    <p>• Processing time: 1-3 business days</p>
                    <p>• A 15% fee applies to all withdrawals</p>
                    <p>• Withdrawals are processed via PayPal</p>
                    <p>• You must set up your PayPal email before withdrawing</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PurchaseCreditsModal 
        isVisible={purchaseModalOpen} 
        onClose={() => setPurchaseModalOpen(false)} 
      />
      
      <WithdrawalModal 
        isVisible={withdrawalModalOpen} 
        onClose={() => setWithdrawalModalOpen(false)}
        fiatBalance={fiatBalance}
        paypalEmail={paypalEmail}
        onUpdatePayPal={handleUpdatePayPalEmail}
        onWithdraw={handleWithdraw}
      />
      
      <TransferCreditsModal 
        isVisible={transferModalOpen} 
        onClose={() => setTransferModalOpen(false)}
        cashCredits={cashCredits}
        onTransfer={handleTransferCredits}
      />
      
      <ConvertCreditsModal 
        isVisible={convertModalOpen} 
        onClose={() => setConvertModalOpen(false)}
        cashCredits={cashCredits}
        onConvert={handleConvertCredits}
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