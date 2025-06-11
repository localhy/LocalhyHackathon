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
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  currentPage: string
  onNavigate: (page: string) => void
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onNavigate, onClose }) => {
  const { signOut } = useAuth()

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'ideas-vault', label: 'Ideas Vault', icon: Lightbulb },
    { id: 'referral-jobs', label: 'Referral Jobs', icon: Megaphone },
    { id: 'starter-tools', label: 'Starter Tools', icon: Wrench },
    { id: 'my-posts', label: 'My Posts', icon: FileText },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
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
                  currentPage === item.id
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