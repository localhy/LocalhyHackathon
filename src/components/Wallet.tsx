import React, { useState, useEffect } from 'react'
import { Wallet as WalletIcon, DollarSign, TrendingUp, Download, Plus, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'

const Wallet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingEarnings: 0,
    totalEarned: 0,
    transactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading wallet data
    const timer = setTimeout(() => {
      setWalletData({
        balance: 0,
        pendingEarnings: 0,
        totalEarned: 0,
        transactions: []
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
      case 'tool-submission':
        navigate('/dashboard/tool-submission')
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
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="bg-white p-6 rounded-xl">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
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
              Manage your earnings and payment methods
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
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
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors">
                  Withdraw
                </button>
              </div>
              
              <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat' }}>
                ${walletData.balance.toFixed(2)}
              </div>
              
              <p className="text-green-100" style={{ fontFamily: 'Inter' }}>
                Available for withdrawal
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
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
                  ${walletData.pendingEarnings.toFixed(2)}
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
                    Total Earned
                  </h3>
                </div>
                <p 
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  ${walletData.totalEarned.toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Payment Method
                  </h3>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Add Payment Method
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="h-8 w-8 text-gray-400" />
              </div>
              
              <h3 
                className="text-xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                Start Earning Today
              </h3>
              
              <p 
                className="text-gray-600 mb-6"
                style={{ fontFamily: 'Inter' }}
              >
                Create posts, share ideas, and refer businesses to start building your earnings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard/create-new')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                  style={{ fontFamily: 'Inter' }}
                >
                  Create Your First Post
                </button>
                <button
                  onClick={() => navigate('/dashboard/referral-jobs')}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                  style={{ fontFamily: 'Inter' }}
                >
                  Find Referral Jobs
                </button>
              </div>
            </div>
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