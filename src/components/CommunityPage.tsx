import React, { useState, useEffect } from 'react'
import { Users, Newspaper, ShoppingBag, Calendar, UserPlus, MessageCircle, Search, Filter, Plus, User, Heart, Share2, MapPin, Clock, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import CommunityFeed from './community/CommunityFeed'
import CommunitySidebar from './community/CommunitySidebar'

interface TabProps {
  id: string
  label: string
  icon: React.ComponentType<any>
  count?: number
  isActive: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ id, label, icon: Icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-50 text-blue-600 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
)

const CommunityPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('news-feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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
        // Stay on current page
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
        navigate('/dashboard/wallet')
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

  const tabs = [
    { id: 'news-feed', label: 'News Feed', icon: Newspaper, count: 0 },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, count: 0 },
    { id: 'groups', label: 'Groups', icon: Users, count: 0 },
    { id: 'events', label: 'Events', icon: Calendar, count: 0 },
    { id: 'invite', label: 'Invite Neighbors', icon: UserPlus }
  ]

  const renderTabContent = () => {
    if (activeTab === 'news-feed') {
      return (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Community Feed */}
          <div className="lg:col-span-2">
            <CommunityFeed />
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block">
            <CommunitySidebar />
          </div>
        </div>
      )
    }
    
    // For other tabs, show coming soon message
    const comingSoonMessage = (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {activeTab === 'marketplace' && <ShoppingBag className="h-8 w-8 text-blue-500" />}
          {activeTab === 'groups' && <Users className="h-8 w-8 text-blue-500" />}
          {activeTab === 'events' && <Calendar className="h-8 w-8 text-blue-500" />}
          {activeTab === 'invite' && <UserPlus className="h-8 w-8 text-blue-500" />}
        </div>
        <h3 
          className="text-xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          Coming Soon
        </h3>
        <p 
          className="text-gray-600 mb-6 max-w-md mx-auto"
          style={{ fontFamily: 'Inter' }}
        >
          {activeTab === 'marketplace' && "Soon you'll be able to buy, sell, and trade items with people in your local area."}
          {activeTab === 'groups' && "Join interest-based groups in your community to connect with like-minded neighbors."}
          {activeTab === 'events' && "Discover and create local events happening in your neighborhood."}
          {activeTab === 'invite' && "Help grow your local community by inviting your neighbors to join Localhy."}
        </p>
        <button
          onClick={() => setActiveTab('news-feed')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          style={{ fontFamily: 'Inter' }}
        >
          Back to News Feed
        </button>
      </div>
    )

    return comingSoonMessage
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="community"
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
              Community
            </h1>
            <p 
              className="text-gray-600 mt-1"
              style={{ fontFamily: 'Inter' }}
            >
              Connect with your local community
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar space-x-2 py-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  count={tab.count}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters (only for certain tabs) */}
        {['news-feed', 'marketplace', 'groups', 'events'].includes(activeTab) && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'news-feed' ? 'posts' : activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>Filter</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
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

export default CommunityPage