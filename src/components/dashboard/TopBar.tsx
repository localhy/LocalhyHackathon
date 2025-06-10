import React, { useState, useEffect } from 'react'
import { Search, Bell, MessageCircle, User, Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationTooltip from './NotificationTooltip'
import MessageTooltip from './MessageTooltip'
import { getUserProfile } from '../../lib/database'

interface TopBarProps {
  onMenuClick: () => void
  user: any
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, user }) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationTooltipOpen, setNotificationTooltipOpen] = useState(false)
  const [messageTooltipOpen, setMessageTooltipOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) return

      try {
        // Try to get avatar from database first
        const dbProfile = await getUserProfile(user.id)
        if (dbProfile?.avatar_url) {
          setAvatarUrl(dbProfile.avatar_url)
        } else {
          // Fallback to user metadata
          setAvatarUrl(user.user_metadata?.avatar_url || null)
        }
      } catch (error) {
        console.error('Error loading user avatar:', error)
        // Fallback to user metadata on error
        setAvatarUrl(user.user_metadata?.avatar_url || null)
      }
    }

    loadUserAvatar()
  }, [user])

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
    setNotificationTooltipOpen(false)
    navigate('/dashboard/notifications')
  }

  const handleMessageClick = () => {
    setMessageTooltipOpen(false)
    navigate('/dashboard/messages')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationTooltipOpen(!notificationTooltipOpen)
                setMessageTooltipOpen(false)
                setDropdownOpen(false)
              }}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {/* Remove red dot for new users with no notifications */}
            </button>
            
            <NotificationTooltip
              isOpen={notificationTooltipOpen}
              onClose={() => setNotificationTooltipOpen(false)}
              onViewAll={handleNotificationClick}
            />
          </div>

          {/* Messages */}
          <div className="relative">
            <button 
              onClick={() => {
                setMessageTooltipOpen(!messageTooltipOpen)
                setNotificationTooltipOpen(false)
                setDropdownOpen(false)
              }}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              {/* Remove green dot for new users with no messages */}
            </button>
            
            <MessageTooltip
              isOpen={messageTooltipOpen}
              onClose={() => setMessageTooltipOpen(false)}
              onViewAll={handleMessageClick}
            />
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen)
                setNotificationTooltipOpen(false)
                setMessageTooltipOpen(false)
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => setAvatarUrl(null)} // Fallback if image fails to load
                />
              ) : (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter' }}>
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" 
                  style={{ fontFamily: 'Inter' }}
                >
                  Profile
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" 
                  style={{ fontFamily: 'Inter' }}
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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