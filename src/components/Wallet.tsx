import React, { useState, useEffect } from 'react'
import { CreditCard, DollarSign, TrendingUp, Download, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle, Loader, Save, Mail, Eye, EyeOff } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getWalletStats, 
  getUserTransactions, 
  transferCreditsToFiatBalance, 
  processWithdrawal,
  getUserProfile,
  updateUserPayPalEmail,
  type Transaction,
  type WalletStats 
} from '../lib/database'

const Wallet = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<WalletStats>({
    currentCredits: 0,
    fiatBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    pendingEarnings: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Tab management
  const searchParams = new URLSearchParams(location.search)
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Convert credits form
  const [convertAmount, setConvertAmount] = useState('')
  const [converting, setConverting] = useState(false)

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  // PayPal email management
  const [paypalEmail, setPaypalEmail] = useState('')
  const [showPaypalEmail, setShowPaypalEmail] = useState(false)
  const [savingPaypal, setSavingPaypal] = useState(false)
  const [paypalSuccess, setPaypalSuccess] = useState('')
  const [paypalError, setPaypalError] = useState('')

  useEffect(() => {
    if (user) {
      loadWalletData()
      loadPayPalEmail()
    }
  }, [user])

  useEffect(() => {
    // Update tab when URL changes
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab') || 'overview'
    setActiveTab(tab)
  }, [location])

  const loadWalletData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const [walletStats, userTransactions] = await Promise.all([
        getWalletStats(user.id),
        getUserTransactions(user.id)
      ])

      setStats(walletStats)
      setTransactions(userTransactions)
    } catch (err: any) {
      console.error('Error loading wallet data:', err)
      setError(err.message || 'Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const loadPayPalEmail = async () => {
    if (!user) return

    try {
      const profile = await getUserProfile(user.id)
      if (profile?.paypal_email) {
        setPaypalEmail(profile.paypal_email)
      }
    } catch (error) {
      console.error('Error loading PayPal email:', error)
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
    // Update URL without triggering a page reload
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('tab', tab)
    window.history.pushState({}, '', newUrl.toString())
    
    // Clear messages when switching tabs
    setError('')
    setSuccess('')
    setPaypalError('')
    setPaypalSuccess('')
  }

  const handleConvertCredits = async () => {
    if (!user || !convertAmount) return

    const amount = parseInt(convertAmount)
    if (amount <= 0 || amount > stats.currentCredits) {
      setError('Invalid amount. Please enter a valid number of credits.')
      return
    }

    setConverting(true)
    setError('')
    setSuccess('')

    try {
      const success = await transferCreditsToFiatBalance(user.id, amount)
      if (success) {
        setSuccess(`Successfully converted ${amount} credits to $${amount.toFixed(2)} cash!`)
        setConvertAmount('')
        await loadWalletData() // Refresh data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert credits')
    } finally {
      setConverting(false)
    }
  }

  const handleSavePayPalEmail = async () => {
    if (!user || !paypalEmail.trim()) {
      setPaypalError('Please enter a valid PayPal email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(paypalEmail)) {
      setPaypalError('Please enter a valid email address')
      return
    }

    setSavingPaypal(true)
    setPaypalError('')
    setPaypalSuccess('')

    try {
      const success = await updateUserPayPalEmail(user.id, paypalEmail.trim())
      if (success) {
        setPaypalSuccess('PayPal email saved successfully!')
        setTimeout(() => setPaypalSuccess(''), 3000)
      } else {
        throw new Error('Failed to save PayPal email')
      }
    } catch (err: any) {
      setPaypalError(err.message || 'Failed to save PayPal email')
    } finally {
      setSavingPaypal(false)
    }
  }

  const handleWithdrawal = async () => {
    if (!user || !withdrawAmount) return

    const amount = parseFloat(withdrawAmount)
    if (amount <= 0 || amount > stats.fiatBalance) {
      setError('Invalid amount. Please enter a valid withdrawal amount.')
      return
    }

    if (!paypalEmail) {
      setError('Please set your PayPal email address first in the Withdrawal Settings section.')
      return
    }

    setWithdrawing(true)
    setError('')
    setSuccess('')

    try {
      const success = await processWithdrawal(user.id, amount)
      if (success) {
        const fee = amount * 0.15
        const netAmount = amount - fee
        setSuccess(`Withdrawal request submitted! You'll receive $${netAmount.toFixed(2)} after the 15% processing fee.`)
        setWithdrawAmount('')
        await loadWalletData() // Refresh data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal')
    } finally {
      setWithdrawing(false)
    }
  }

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'credit_purchase':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'withdrawal':
        return <Download className="h-4 w-4 text-blue-500" />
      case 'credit_earning':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'credit_to_fiat_conversion':
        return <DollarSign className="h-4 w-4 text-purple-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'convert', label: 'Convert Credits' },
    { id: 'withdraw', label: 'Withdraw Cash' },
    { id: 'purchase', label: 'Buy Credits' },
    { id: 'transactions', label: 'Transactions' }
  ]

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
              Manage your credits, cash balance, and transactions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter' }}>
                          Credits
                        </p>
                        <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                          {stats.currentCredits}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter' }}>
                          Cash Balance
                        </p>
                        <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Montserrat' }}>
                          ${stats.fiatBalance.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter' }}>
                          Total Earned
                        </p>
                        <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                          {stats.totalEarned}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter' }}>
                          Pending Earnings
                        </p>
                        <p className="text-2xl font-bold text-yellow-600" style={{ fontFamily: 'Montserrat' }}>
                          {stats.pendingEarnings}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
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
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleTabChange('convert')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                            Convert Credits
                          </h4>
                          <p className="text-sm text-gray-600">Turn credits into cash</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabChange('withdraw')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Download className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                            Withdraw Cash
                          </h4>
                          <p className="text-sm text-gray-600">Transfer to PayPal</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabChange('purchase')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                            Buy Credits
                          </h4>
                          <p className="text-sm text-gray-600">Purchase more credits</p>
                        </div>
                      </div>
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
                      onClick={() => handleTabChange('transactions')}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>
                  
                  {transactions.slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 text-center py-8" style={{ fontFamily: 'Inter' }}>
                      No transactions yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction)}
                            <div>
                              <p className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Inter' }}>
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <span className="font-medium text-sm">
                              {transaction.amount > 0 ? `$${transaction.amount}` : `${transaction.credits} credits`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Convert Credits Tab */}
            {activeTab === 'convert' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Convert Credits to Cash
                  </h2>
                  
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Conversion Rate</h3>
                      <p className="text-blue-700 text-sm">
                        1 Credit = $1.00 USD
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits to Convert
                    </label>
                    <input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      max={stats.currentCredits}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter amount"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {stats.currentCredits} credits
                    </p>
                  </div>

                  {convertAmount && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Credits to convert:</span>
                        <span>{convertAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Cash you'll receive:</span>
                        <span>${parseFloat(convertAmount || '0').toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleConvertCredits}
                    disabled={!convertAmount || converting || parseInt(convertAmount) > stats.currentCredits}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    {converting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        <span>Convert to Cash</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Withdraw Cash Tab */}
            {activeTab === 'withdraw' && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Withdrawal Settings */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Withdrawal Settings
                  </h2>
                  
                  {/* PayPal Email Success/Error Messages */}
                  {(paypalError || paypalSuccess) && (
                    <div className="mb-6">
                      {paypalError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{paypalError}</p>
                        </div>
                      )}
                      {paypalSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{paypalSuccess}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPaypalEmail ? 'text' : 'password'}
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="your-paypal@email.com"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPaypalEmail(!showPaypalEmail)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPaypalEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      This email will be used for all withdrawal payments
                    </p>
                  </div>

                  <button
                    onClick={handleSavePayPalEmail}
                    disabled={!paypalEmail.trim() || savingPaypal}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    {savingPaypal ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save PayPal Email</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Withdrawal Form */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Request Withdrawal
                  </h2>
                  
                  <div className="mb-6">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">Processing Fee</h3>
                      <p className="text-yellow-700 text-sm">
                        A 15% processing fee applies to all withdrawals. This covers payment processing and platform costs.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={stats.fiatBalance}
                      min="1"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter amount"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: ${stats.fiatBalance.toFixed(2)}
                    </p>
                  </div>

                  {withdrawAmount && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Withdrawal amount:</span>
                        <span>${parseFloat(withdrawAmount || '0').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                
                        <span>Processing fee (15%):</span>
                        <span>${(parseFloat(withdrawAmount || '0') * 0.15).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-gray-200">
                        <span>You'll receive:</span>
                        <span>${(parseFloat(withdrawAmount || '0') * 0.85).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {paypalEmail ? 
                          `Funds will be sent to: ${paypalEmail.substring(0, 3)}...${paypalEmail.substring(paypalEmail.indexOf('@'))}` : 
                          'No PayPal email set. Please add one above.'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleWithdrawal}
                    disabled={!withdrawAmount || withdrawing || !paypalEmail || parseFloat(withdrawAmount) > stats.fiatBalance}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    {withdrawing ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Request Withdrawal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Buy Credits Tab */}
            {activeTab === 'purchase' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Buy Credits
                  </h2>
                  
                  <div className="mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Credit Pricing</h3>
                      <p className="text-blue-700 text-sm">
                        1 Credit = $1.00 USD. Credits can be used for posting referral jobs, promoting content, and accessing premium ideas.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* 20 Credits Package */}
                    <div className="border border-gray-200 hover:border-green-300 rounded-lg p-4 text-center cursor-pointer transition-colors bg-black text-white flex flex-col">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-1">20 Credits</h3>
                        <p className="text-green-500 font-semibold mb-3">$20.00</p>
                      </div>
                      <div className="mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              // Space for PayPal URL
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Buy with PayPal
                          </button>
                          <button 
                            onClick={() => {
                              // Space for Creem.io URL
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Pay with Card
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 50 Credits Package */}
                    <div className="border border-gray-200 hover:border-green-300 rounded-lg p-4 text-center cursor-pointer transition-colors bg-black text-white flex flex-col">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-1">50 Credits</h3>
                        <p className="text-green-500 font-semibold mb-1">$45.00</p>
                        <p className="text-xs text-gray-400 mb-3">Save $5.00</p>
                      </div>
                      <div className="mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              // Space for PayPal URL
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Buy with PayPal
                          </button>
                          <button 
                            onClick={() => {
                              // Space for Creem.io URL
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Pay with Card
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 100 Credits Package */}
                    <div className="border-2 border-green-500 rounded-lg p-4 text-center cursor-pointer relative bg-black text-white flex flex-col">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        POPULAR
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-1">100 Credits</h3>
                        <p className="text-green-500 font-semibold mb-1">$85.00</p>
                        <p className="text-xs text-gray-400 mb-1">Save $15.00</p>
                        <p className="text-xs text-yellow-400 mb-3">Get an additional 200 FREE credits!</p>
                      </div>
                      <div className="mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              // Space for PayPal URL
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Buy with PayPal
                          </button>
                          <button 
                            onClick={() => {
                              // Space for Creem.io URL
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Pay with Card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Transaction History
                  </h2>
                  
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8" style={{ fontFamily: 'Inter' }}>
                      No transactions yet
                    </p>
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getTransactionIcon(transaction)}
                                  <span className="text-sm text-gray-900">
                                    {transaction.type.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {transaction.type === 'credit_purchase' || transaction.type === 'withdrawal' ? (
                                  <span className="font-medium text-gray-900">${transaction.amount}</span>
                                ) : (
                                  <span className={`font-medium ${transaction.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(transaction.status)}
                                  <span className="text-sm text-gray-900 capitalize">
                                    {transaction.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.withdrawal_method ? (
                                  <span className="capitalize">{transaction.withdrawal_method}</span>
                                ) : transaction.payment_method ? (
                                  <span className="capitalize">{transaction.payment_method}</span>
                                ) : (
                                  <span>-</span>
                                )}
                                {transaction.withdrawal_method === 'paypal' && transaction.withdrawal_details?.paypal_email && (
                                  <span className="block text-xs text-gray-400">
                                    {transaction.withdrawal_details.paypal_email.substring(0, 3)}...{transaction.withdrawal_details.paypal_email.substring(transaction.withdrawal_details.paypal_email.indexOf('@'))}
                                  </span>
                                )}
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