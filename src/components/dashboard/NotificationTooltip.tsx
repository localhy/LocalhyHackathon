import React, { useState, useEffect } from 'react'
import { Bell, Eye, X } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface NotificationTooltipProps {
  isOpen: boolean
  onClose: () => void
  onViewAll: () => void
}

const NotificationTooltip: React.FC<NotificationTooltipProps> = ({ isOpen, onClose, onViewAll }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // For new users, start with empty notifications
    // In a real app, this would fetch from the database
    setNotifications([])
  }, [])

  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3)

  if (!isOpen) return null

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 
            className="font-semibold text-gray-900"
            style={{ fontFamily: 'Inter' }}
          >
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <div className="p-4 text-center">
          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p 
            className="text-gray-500 text-sm"
            style={{ fontFamily: 'Inter' }}
          >
            No new notifications
          </p>
          <p 
            className="text-gray-400 text-xs mt-1"
            style={{ fontFamily: 'Inter' }}
          >
            Start engaging to receive updates
          </p>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onViewAll}
          className="w-full text-center text-green-600 hover:text-green-700 font-medium text-sm"
          style={{ fontFamily: 'Inter' }}
        >
          View All Notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationTooltip