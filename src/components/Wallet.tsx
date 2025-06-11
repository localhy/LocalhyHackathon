import React, { useState, useEffect } from 'react'
import { CreditCard, DollarSign, TrendingUp, Download, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, getUserTransactions, type Transaction } from '../lib/database'

const Wallet = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'purchase', 'withdraw', 'history'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

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

      const [profile, userTransactions] = await Promise.all([
        getUserProfile(user.id),
        getUserTransactions(user.id)
      ])

      setUserProfile(profile)
      setTransactions(userTransactions)
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'credit_earning':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'withdrawal':
        return <ArrowDownLeft className="h-4 w-4 text-blue-500" />
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
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
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'purchase', label: 'Buy Credits', icon: Plus },
    { id: 'withdraw', label: 'Withdraw', icon: Download },
    { id: 'history', label: 'History', icon: Clock }
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

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 
              className="text-xl sm:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Wallet
            </h1>
            <p 
              className="text-gray-600 mt-1 text-sm sm:text-base"
              style={{ fontFamily: 'Inter' }}
            >
              Manage your credits and earnings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
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
              <div className="space-y-4 sm:space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                          Available Credits
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          {userProfile?.credits || 0}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('purchase')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Buy More Credits
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                          Available Balance
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          ${userProfile?.fiat_balance?.toFixed(2) || '0.00'}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('withdraw')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Withdraw Funds
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                          Earnings This Month
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                          $0.00
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate('/dashboard/create-new')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Create Content
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                      Recent Transactions
                    </h2>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                      style={{ fontFamily: 'Inter' }}
                    >
                      View All
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h3 
                        className="text-lg sm:text-xl font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        No transactions yet
                      </h3>
                      <p 
                        className="text-gray-600 mb-4 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Start using Localhy to see your transactions here
                      </p>
                      <button
                        onClick={() => setActiveTab('purchase')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Buy Your First Credits
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.slice(0, 5).map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getTransactionIcon(transaction.type)}
                                  <span className="text-sm sm:text-base text-gray-900">
                                    {transaction.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-sm sm:text-base font-medium ${
                                    ['credit_purchase', 'credit_earning', 'refund'].includes(transaction.type)
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {['credit_purchase', 'credit_earning', 'refund'].includes(transaction.type) ? '+' : '-'}
                                    {transaction.type === 'credit_usage' || transaction.type === 'credit_earning' 
                                      ? `${transaction.credits} credits`
                                      : `$${transaction.amount.toFixed(2)}`
                                    }
                                  </span>
                                  {transaction.type === 'credit_purchase' && (
                                    <span className="text-xs text-gray-500">
                                      {transaction.credits} credits
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(transaction.status)}
                                  <span className="text-sm sm:text-base text-gray-900">
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </div>
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

            {/* Purchase Credits Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Buy Credits
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      { amount: 50, price: 5, popular: false },
                      { amount: 100, price: 10, popular: true },
                      { amount: 250, price: 20, popular: false },
                      { amount: 500, price: 35, popular: false },
                      { amount: 1000, price: 60, popular: false },
                      { amount: 2500, price: 125, popular: false }
                    ].map((option) => (
                      <div 
                        key={option.amount}
                        className={`border rounded-xl p-4 sm:p-6 relative hover:shadow-md transition-shadow cursor-pointer ${
                          option.popular ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        {option.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                            Most Popular
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" style={{ fontFamily: 'Montserrat' }}>
                            {option.amount} Credits
                          </h3>
                          <p className="text-lg sm:text-xl font-semibold text-green-600 mb-3 sm:mb-4" style={{ fontFamily: 'Inter' }}>
                            ${option.price}
                          </p>
                          <button
                            className={`w-full py-2 px-4 rounded-lg font-medium text-sm sm:text-base ${
                              option.popular 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                            style={{ fontFamily: 'Inter' }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3" style={{ fontFamily: 'Montserrat' }}>
                      What can you do with credits?
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base text-blue-700" style={{ fontFamily: 'Inter' }}>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Post referral jobs (10 credits per job)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Promote your content to get more visibility</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Access premium ideas and tools</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Withdraw Funds
                  </h2>
                  
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Inter' }}>
                        Available Balance
                      </h3>
                      <span className="text-xl sm:text-2xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                        ${userProfile?.fiat_balance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (userProfile?.fiat_balance || 0) / 100 * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Minimum withdrawal: $20.00
                    </p>
                  </div>

                  {(userProfile?.fiat_balance || 0) < 20 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-1" style={{ fontFamily: 'Inter' }}>
                            Insufficient Balance
                          </h4>
                          <p className="text-yellow-700 text-sm" style={{ fontFamily: 'Inter' }}>
                            You need a minimum balance of $20.00 to withdraw funds. Keep earning by posting ideas, creating referral jobs, or sharing tools!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                          Withdrawal Method
                        </label>
                        <select
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          <option value="paypal">PayPal</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="crypto">Cryptocurrency</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                          Amount to Withdraw ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            min="20"
                            max={userProfile?.fiat_balance || 0}
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                            style={{ fontFamily: 'Inter' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter' }}>
                          Payment Details
                        </label>
                        <input
                          type="text"
                          placeholder="Email or account details"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Request Withdrawal
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Transaction History
                  </h2>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h3 
                        className="text-lg sm:text-xl font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        No transactions yet
                      </h3>
                      <p 
                        className="text-gray-600 mb-4 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Your transaction history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getTransactionIcon(transaction.type)}
                                  <span className="text-xs sm:text-sm text-gray-900">
                                    {transaction.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-xs sm:text-sm font-medium ${
                                    ['credit_purchase', 'credit_earning', 'refund'].includes(transaction.type)
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {['credit_purchase', 'credit_earning', 'refund'].includes(transaction.type) ? '+' : '-'}
                                    {transaction.type === 'credit_usage' || transaction.type === 'credit_earning' 
                                      ? `${transaction.credits} credits`
                                      : `$${transaction.amount.toFixed(2)}`
                                    }
                                  </span>
                                  {transaction.type === 'credit_purchase' && (
                                    <span className="text-xs text-gray-500">
                                      {transaction.credits} credits
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                <div className="max-w-xs truncate">
                                  {transaction.description}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(transaction.status)}
                                  <span className="text-xs sm:text-sm text-gray-900">
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </div>
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