import React, { useState, useEffect } from 'react'
import { Wallet as WalletIcon, DollarSign, TrendingUp, Download, Plus, CreditCard, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, getUserTransactions, getWalletStats, type Transaction } from '../lib/database'

const Wallet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletData, setWalletData] = useState({
    currentCredits: 0,
    totalSpent: 0,
    totalEarned: 0,
    pendingEarnings: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'purchase'>('overview')

  // Payment links - these would be configured from your PayPal/Creem.io accounts
  const paymentOptions = [
    {
      amount: 20,
      credits: 20,
      popular: false,
      paypalLink: 'https://www.paypal.com/ncp/payment/AXVWLDYSE65YU', // Replace with actual PayPal link
      creemLink: 'https://www.creem.io/payment/prod_4DcD1pV6lnQZUeUO3OCF1L', // Replace with actual Creem.io link
      description: 'Perfect for trying out premium features'
    },
    {
      amount: 50,
      credits: 50,
      popular: true,
      paypalLink: 'https://www.paypal.com/ncp/payment/SVHRUH3LJJL640', // Replace with actual PayPal link
      creemLink: 'https://www.creem.io/payment/prod_6qXRLWHFQQmHSjKKKNK87D', // Replace with actual Creem.io link
      description: 'Most popular choice for regular users'
    },
    {
      amount: 100,
      credits: 100,
      popular: false,
      paypalLink: 'https://www.paypal.com/ncp/payment/LYEXERLJ7ENTE', // Replace with actual PayPal link
      creemLink: 'https://www.creem.io/payment/prod_4pVvvZGzoipEUzbG1SD7b1', // Replace with actual Creem.io link
      description: 'Best value for power users'
    }
  ]

  useEffect(() => {
    if (user) {
      loadWalletData()
    }
  }, [user])

  const loadWalletData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load wallet stats and transactions in parallel
      const [stats, userTransactions] = await Promise.all([
        getWalletStats(user.id),
        getUserTransactions(user.id, 20)
      ])

      setWalletData(stats)
      setTransactions(userTransactions)
    } catch (error) {
      console.error('Error loading wallet data:', error)
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

  const handlePayment = (paymentLink: string) => {
    // Open payment link in new tab
    window.open(paymentLink, '_blank', 'noopener,noreferrer')
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

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-500" />
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />
    
    switch (type) {
      case 'credit_purchase':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'credit_usage':
        return <Download className="h-4 w-4 text-blue-500" />
      case 'withdrawal':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      case 'refund':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return 'text-green-600'
      case 'credit_usage':
        return 'text-blue-600'
      case 'withdrawal':
        return 'text-purple-600'
      case 'refund':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
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
              Manage your credits, earnings, and payment methods
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'purchase', label: 'Buy Credits' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <WalletIcon className="h-8 w-8" />
                      <h2 
                        className="text-xl font-semibold"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Current Balance
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => setActiveTab('purchase')}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add Credits
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat' }}>
                    {showBalance ? `${walletData.currentCredits} Credits` : '••• Credits'}
                  </div>
                  
                  <p className="text-green-100" style={{ fontFamily: 'Inter' }}>
                    ${walletData.currentCredits.toFixed(2)} USD equivalent
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Total Spent
                      </h3>
                    </div>
                    <p 
                      className="text-2xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      ${walletData.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      On credit purchases
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Credits Earned
                      </h3>
                    </div>
                    <p 
                      className="text-2xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      {walletData.totalEarned}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      From your activities
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h3 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Pending Earnings
                      </h3>
                    </div>
                    <p 
                      className="text-2xl font-bold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      {walletData.pendingEarnings}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Being processed
                    </p>
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
                      onClick={() => setActiveTab('transactions')}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p 
                        className="text-gray-500 mb-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No transactions yet
                      </p>
                      <p 
                        className="text-gray-400 text-sm"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Your transaction history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div>
                              <p className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Inter' }}>
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold text-sm ${getTransactionColor(transaction.type)}`}>
                              {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                            </p>
                            {transaction.amount > 0 && (
                              <p className="text-xs text-gray-500">
                                ${transaction.amount.toFixed(2)}
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

            {activeTab === 'transactions' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Transaction History
                  </h3>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p 
                      className="text-gray-500 mb-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      No transactions yet
                    </p>
                    <p 
                      className="text-gray-400 text-sm mb-6"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Start by purchasing credits or earning through activities
                    </p>
                    <button
                      onClick={() => setActiveTab('purchase')}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Buy Credits
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getTransactionIcon(transaction.type, transaction.status)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                                {transaction.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-sm text-gray-500">
                                  {formatDate(transaction.created_at)}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.status}
                                </span>
                                {transaction.payment_method && (
                                  <span className="text-xs text-gray-500">
                                    via {transaction.payment_method}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                            </p>
                            {transaction.amount > 0 && (
                              <p className="text-sm text-gray-500">
                                ${transaction.amount.toFixed(2)} {transaction.currency}
                              </p>
                            )}
                            {transaction.payment_id && (
                              <button
                                onClick={() => copyToClipboard(transaction.payment_id!)}
                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center space-x-1 mt-1"
                              >
                                <span>ID: {transaction.payment_id.slice(0, 8)}...</span>
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Buy Credits
                  </h2>
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Choose a credit package that works for you. 1 credit = $1 USD
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {paymentOptions.map((option) => (
                    <div
                      key={option.amount}
                      className={`relative bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
                        option.popular 
                          ? 'border-green-500 ring-2 ring-green-100' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {option.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                          {option.credits} Credits
                        </div>
                        <div className="text-2xl font-semibold text-green-600 mb-2">
                          ${option.amount}
                        </div>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                          {option.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handlePayment(option.paypalLink)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                          <span>Pay with PayPal</span>
                          <ExternalLink className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handlePayment(option.creemLink)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                          <span>Pay with Creem.io</span>
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Instant credit delivery</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter' }}>
                        How it works
                      </h4>
                      <ul className="text-blue-800 text-sm space-y-1" style={{ fontFamily: 'Inter' }}>
                        <li>• Click on your preferred payment method</li>
                        <li>• Complete the payment on PayPal or Creem.io</li>
                        <li>• Credits are automatically added to your account</li>
                        <li>• Use credits to unlock premium content and features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-3" style={{ fontFamily: 'Inter' }}>
                    Need help?
                  </h4>
                  <p className="text-gray-600 text-sm mb-3" style={{ fontFamily: 'Inter' }}>
                    If you experience any issues with your payment or don't receive your credits within 5 minutes, please contact our support team.
                  </p>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Contact Support
                  </button>
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