import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import WelcomeBlock from './dashboard/WelcomeBlock'
import MainActions from './dashboard/MainActions'
import FloatingActionButton from './dashboard/FloatingActionButton'
import DailyTip from './dashboard/DailyTip'
import GoalsMilestones from './dashboard/GoalsMilestones'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleNavigation = (page: string) => {
    setCurrentPage(page)
    setSidebarOpen(false) // Close sidebar on mobile after navigation
    
    // Navigate to specific pages
    switch(page) {
      case 'dashboard':
        // Stay on main dashboard
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
        navigate('/dashboard/wallet')
        break
      case 'profile':
        navigate('/dashboard/profile')
        break
      case 'settings':
        navigate('/dashboard/settings')
        break
      default:
        // Stay on dashboard for other nav items for now
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar 
          onMenuClick={toggleSidebar}
          user={user}
        />

        {/* Centered Main Content */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-7xl px-4 lg:px-8">
            {/* Main Dashboard Content */}
            <main className="py-6 space-y-6">
              {/* Welcome Block */}
              <WelcomeBlock user={user} />

              {/* Main Actions */}
              <MainActions onNavigate={handleNavigation} />

              {/* Daily Tip */}
              <DailyTip onNavigate={handleNavigation} />

              {/* Goals & Milestones */}
              <GoalsMilestones user={user} />
            </main>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onNavigate={handleNavigation} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Dashboard