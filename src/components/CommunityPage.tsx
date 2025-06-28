import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import CommunityNewsfeed from './community/CommunityNewsfeed'
import CommunityGroups from './community/CommunityGroups'
import CommunityEvents from './community/CommunityEvents'
import CommunityMarketplace from './community/CommunityMarketplace'
import InviteNeighbors from './community/InviteNeighbors'

const CommunityPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('newsfeed')

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
    { id: 'newsfeed', label: 'Newsfeed' },
    { id: 'groups', label: 'Groups' },
    { id: 'events', label: 'Events' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'invite', label: 'Invite Neighbors' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'newsfeed':
        return <CommunityNewsfeed user={user} />
      case 'groups':
        return <CommunityGroups />
      case 'events':
        return <CommunityEvents />
      case 'marketplace':
        return <CommunityMarketplace />
      case 'invite':
        return <InviteNeighbors />
      default:
        return <CommunityNewsfeed user={user} />
    }
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
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-4 whitespace-nowrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderTabContent()}
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