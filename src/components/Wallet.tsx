import React, { useState, useEffect } from 'react'
import { CreditCard, DollarSign, TrendingUp, Download, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Wallet as WalletIcon, Gift, Star, Zap } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getUserCredits, getUserTransactions, type Transaction } from '../lib/database'

const Wallet = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [credits, setCredits] = useState(0)
  const [fiatBalance, setFiatBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check for tab parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'purchase', 'withdraw', 'history'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location])

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

      const [userCredits, userTransactions] = await Promise.all([
        getUserCredits(user.id),
        getUserTransactions(user.id)
      ])

      setCredits(userCredits)
      setTransactions(userTransactions)
      
      // Calculate fiat balance from transactions
      const fiatTransactions = userTransactions.filter(t => 
        ['withdrawal', 'credit_to_fiat_conversion'].includes(t.type) && t.status === 'completed'
      )
      const totalFiat = fiatTransactions.reduce((sum, t) => sum + t.amount, 0)
      setFiatBalance(totalFiat)
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
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'credit_usage':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'credit_earning':
        return <Gift className="h-4 w-4 text-purple-500" />
      case 'credit_to_fiat_conversion':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />
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
    { id: 'overview', label: 'Overview', icon: WalletIcon },
    { id: 'purchase', label: 'Buy Credits', icon: Plus },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
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

      <div className="flex-1 flex flex-col">
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
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Credits Balance */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 
                            className="text-base sm:text-lg font-semibold text-gray-900"
                            style={{ fontFamily: 'Montserrat' }}
                          >
                            Credits Balance
                          </h3>
                          <p 
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter' }}
                          >
                            Use for purchases and promotions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p 
                          className="text-2xl sm:text-3xl font-bold text-green-600"
                          style={{ fontFamily: 'Montserrat' }}
                        >
                          {credits}
                        </p>
                        <p className="text-sm text-gray-500">Credits</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveTab('purchase')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Buy Credits
                      </button>
                      <button
                        onClick={() => navigate('/dashboard/create-new')}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Earn More
                      </button>
                    </div>
                  </div>

                  {/* Fiat Balance */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 
                            className="text-base sm:text-lg font-semibold text-gray-900"
                            style={{ fontFamily: 'Montserrat' }}
                          >
                            Cash Balance
                          </h3>
                          <p 
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter' }}
                          >
                            Available for withdrawal
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p 
                          className="text-2xl sm:text-3xl font-bold text-blue-600"
                          style={{ fontFamily: 'Montserrat' }}
                        >
                          ${fiatBalance.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">USD</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveTab('withdraw')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={() => navigate('/dashboard/referral-jobs')}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Find Referrals
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 
                      className="text-base sm:text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      Recent Transactions
                    </h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                      style={{ fontFamily: 'Inter' }}
                    >
                      View All
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h4 
                        className="text-base sm:text-lg font-medium text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        No transactions yet
                      </h4>
                      <p 
                        className="text-gray-600 mb-4 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Start earning or purchase credits to see your transaction history
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setActiveTab('purchase')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Buy Credits
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/ideas-vault')}
                          className="bg-white border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Explore Ideas
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.slice(0, 5).map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getTransactionIcon(transaction.type)}
                                  <span className="text-xs sm:text-sm text-gray-900">
                                    {transaction.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3">
                                <div className="text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px] truncate">
                                  {transaction.description}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-xs sm:text-sm font-medium ${
                                    ['credit_purchase', 'refund', 'credit_earning'].includes(transaction.type)
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {['credit_purchase', 'refund', 'credit_earning'].includes(transaction.type) ? '+' : '-'}
                                    {transaction.type === 'credit_to_fiat_conversion' || transaction.type === 'withdrawal'
                                      ? `$${transaction.amount.toFixed(2)}`
                                      : `${transaction.credits} credits`
                                    }
                                  </span>
                                  {transaction.type === 'credit_purchase' && (
                                    <span className="text-xs text-gray-500">
                                      ${transaction.amount.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(transaction.status)}
                                  <span className="text-xs sm:text-sm capitalize">
                                    {transaction.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {formatDate(transaction.created_at)}
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

            {/* Purchase Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Buy Credits
                  </h3>

                  <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* Credit Package Cards */}
                    {[
                      { credits: 50, price: 5, popular: false },
                      { credits: 200, price: 15, popular: true },
                      { credits: 500, price: 30, popular: false }
                    ].map((pkg, index) => (
                      <div 
                        key={index}
                        className={`border rounded-xl p-4 sm:p-6 relative ${
                          pkg.popular 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        } transition-colors`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                            Most Popular
                          </div>
                        )}
                        <div className="text-center mb-3 sm:mb-4">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                            {pkg.credits} Credits
                          </p>
                          <p className="text-lg sm:text-xl font-semibold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                            ${pkg.price}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            ${(pkg.price / pkg.credits).toFixed(2)} per credit
                          </p>
                        </div>
                        <button
                          className={`w-full py-2 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base ${
                            pkg.popular
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          style={{ fontFamily: 'Inter' }}
                        >
                          Purchase
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h4 
                      className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3"
                      style={{ fontFamily: 'Montserrat' }}
                    >
                      What can you do with credits?
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-start space-x-2 text-sm sm:text-base text-blue-800">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span style={{ fontFamily: 'Inter' }}>Unlock premium business ideas</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm sm:text-base text-blue-800">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span style={{ fontFamily: 'Inter' }}>Promote your content to get more visibility</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm sm:text-base text-blue-800">
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span style={{ fontFamily: 'Inter' }}>Download premium tools and templates</span>
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
                  <h3 
                    className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Withdraw Funds
                  </h3>

                  <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 
                        className="text-base sm:text-lg font-semibold text-blue-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Available Balance
                      </h4>
                      <p 
                        className="text-xl sm:text-2xl font-bold text-blue-900"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        ${fiatBalance.toFixed(2)}
                      </p>
                    </div>
                    <p 
                      className="text-sm sm:text-base text-blue-800 mb-2 sm:mb-3"
                      style={{ fontFamily: 'Inter' }}
                    >
                      This is the amount you can withdraw to your bank account or payment method.
                    </p>
                    <p 
                      className="text-xs sm:text-sm text-blue-700"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Minimum withdrawal amount: $10.00
                    </p>
                  </div>

                  {fiatBalance < 10 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h4 
                        className="text-base sm:text-lg font-medium text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Insufficient balance
                      </h4>
                      <p 
                        className="text-gray-600 mb-4 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        You need at least $10.00 to withdraw. Earn more by referring businesses or selling ideas.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => navigate('/dashboard/referral-jobs')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Find Referral Jobs
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/create-new?tab=idea')}
                          className="bg-white border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Create Paid Idea
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-4 sm:space-y-6">
                      <div>
                        <label 
                          className="block text-sm font-medium text-gray-700 mb-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Withdrawal Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type="number"
                            min="10"
                            max={fiatBalance}
                            step="0.01"
                            defaultValue={fiatBalance.toFixed(2)}
                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            style={{ fontFamily: 'Inter' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium text-gray-700 mb-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Payment Method
                        </label>
                        <select
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          <option value="paypal">PayPal</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="venmo">Venmo</option>
                        </select>
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium text-gray-700 mb-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Payment Details
                        </label>
                        <input
                          type="text"
                          placeholder="Email or account information"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        />
                      </div>

                      <div className="pt-2 sm:pt-4">
                        <button
                          type="submit"
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Request Withdrawal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 
                    className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Transaction History
                  </h3>

                  {transactions.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h4 
                        className="text-base sm:text-lg font-medium text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        No transactions yet
                      </h4>
                      <p 
                        className="text-gray-600 mb-4 text-sm sm:text-base"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Your transaction history will appear here once you start earning or spending credits.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setActiveTab('purchase')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Buy Credits
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/ideas-vault')}
                          className="bg-white border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Explore Ideas
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getTransactionIcon(transaction.type)}
                                  <span className="text-xs sm:text-sm text-gray-900">
                                    {transaction.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3">
                                <div className="text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px] lg:max-w-[300px] truncate">
                                  {transaction.description}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`text-xs sm:text-sm font-medium ${
                                    ['credit_purchase', 'refund', 'credit_earning'].includes(transaction.type)
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {['credit_purchase', 'refund', 'credit_earning'].includes(transaction.type) ? '+' : '-'}
                                    {transaction.type === 'credit_to_fiat_conversion' || transaction.type === 'withdrawal'
                                      ? `$${transaction.amount.toFixed(2)}`
                                      : `${transaction.credits} credits`
                                    }
                                  </span>
                                  {transaction.type === 'credit_purchase' && (
                                    <span className="text-xs text-gray-500">
                                      ${transaction.amount.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(transaction.status)}
                                  <span className="text-xs sm:text-sm capitalize">
                                    {transaction.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {formatDate(transaction.created_at)}
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