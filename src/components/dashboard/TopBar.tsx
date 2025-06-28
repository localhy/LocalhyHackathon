import React, { useState } from 'react'
import { Search, Bell, MessageCircle, User, Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  onMenuClick: () => void
  user: any
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, user }) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleProfileClick = () => {
    setDropdownOpen(false)
    navigate('/dashboard/profile')
  }

  const handleSettingsClick = () => {
    setDropdownOpen(false)
    navigate('/dashboard/settings')
  }

  const handleNotificationClick = () => {
    navigate('/dashboard/notifications')
  }

  const handleMessageClick = () => {
    navigate('/dashboard/messages')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <button 
            onClick={handleNotificationClick}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Messages */}
          <button 
            onClick={handleMessageClick}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Messages"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`}>
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate" style={{ fontFamily: 'Inter' }}>
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={handleProfileClick}
                  className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" 
                  style={{ fontFamily: 'Inter' }}
                >
                  Profile
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" 
                  style={{ fontFamily: 'Inter' }}
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar