import React from 'react'
import { 
  MapPin,
  Home,
  Lightbulb,
  Megaphone,
  Wrench,
  FileText,
  Wallet,
  User,
  Settings,
  LogOut,
  X,
  Building,
  Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onNavigate: (page: string) => void
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNavigate, onClose }) => {
  const { signOut } = useAuth()
  const location = useLocation()

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'ideas-vault', label: 'Ideas Vault', icon: Lightbulb, path: '/dashboard/ideas-vault' },
    { id: 'referral-jobs', label: 'Referral Jobs', icon: Megaphone, path: '/dashboard/referral-jobs' },
    { id: 'business-pages', label: 'Business Pages', icon: Building, path: '/dashboard/business-pages' },
    { id: 'community', label: 'Community', icon: Users, path: '/dashboard/community' },
    { id: 'starter-tools', label: 'Starter Tools', icon: Wrench, path: '/dashboard/starter-tools' },
    { id: 'my-posts', label: 'My Posts', icon: FileText, path: '/dashboard/my-posts' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/dashboard/wallet' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Determine if a navigation item is active based on the current path
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6 pt-6 sm:pt-8 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <span 
                className="text-lg sm:text-xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Localhy
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors text-sm sm:text-base ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-600 border-r-2 border-green-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base"
              style={{ fontFamily: 'Inter' }}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar