import React, { useState } from 'react'
import { Plus, Lightbulb, Megaphone, Wrench, X } from 'lucide-react'

interface FloatingActionButtonProps {
  onNavigate: (page: string) => void
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      id: 'idea',
      label: 'Post an Idea',
      icon: Lightbulb,
      page: '/dashboard/create-new?tab=idea',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'referral',
      label: 'Post Referral Job',
      icon: Megaphone,
      page: '/dashboard/create-new?tab=referral',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'tool',
      label: 'Submit a Tool',
      icon: Wrench,
      page: '/dashboard/create-new?tab=tool',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const handleActionClick = (page: string) => {
    if (page.startsWith('/dashboard/create-new?tab=')) {
      // Navigate directly to the URL with query parameter
      window.location.href = page
    } else {
      onNavigate(page)
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Action Options */}
      {isOpen && (
        <div className="absolute bottom-12 sm:bottom-16 right-0 space-y-2 sm:space-y-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center space-x-2 sm:space-x-3 animate-in slide-in-from-bottom duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span 
                className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap"
                style={{ fontFamily: 'Inter' }}
              >
                {action.label}
              </span>
              <button
                onClick={() => handleActionClick(action.page)}
                className={`w-10 h-10 sm:w-12 sm:h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
              >
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Plus className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>
    </div>
  )
}

export default FloatingActionButton