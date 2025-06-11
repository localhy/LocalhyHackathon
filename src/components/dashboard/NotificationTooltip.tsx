import React, { useState, useEffect } from 'react'
import { Bell, User, X, AlertCircle, CheckCircle } from 'lucide-react'
import { 
  getUserNotifications, 
  markNotificationAsRead,
  subscribeToUserNotifications,
  type Notification 
} from '../../lib/database'
import { useAuth } from '../../contexts/AuthContext'

interface NotificationTooltipProps {
  isOpen: boolean
  onClose: () => void
  onViewAll: () => void
}

const NotificationTooltip: React.FC<NotificationTooltipProps> = ({ isOpen, onClose, onViewAll }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications()
      
      // Set up real-time subscription
      const subscription = subscribeToUserNotifications(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Add new notification to the top of the list
          setNotifications(prev => [payload.new, ...prev].slice(0, 5)) // Keep only latest 5
        } else if (payload.eventType === 'UPDATE') {
          // Update existing notification
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id ? payload.new : notif
            )
          )
        } else if (payload.eventType === 'DELETE') {
          // Remove deleted notification
          setNotifications(prev => 
            prev.filter(notif => notif.id !== payload.old.id)
          )
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, isOpen])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userNotifications = await getUserNotifications(user.id)
      // Show only the latest 5 notifications in tooltip
      setNotifications(userNotifications.slice(0, 5))
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const unreadNotifications = notifications.filter(n => !n.read)

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
            {unreadNotifications.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
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
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : notifications.length === 0 ? (
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
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                  if (notification.action_url) {
                    window.location.href = notification.action_url
                  }
                  onClose()
                }}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p 
                        className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                        style={{ fontFamily: 'Inter' }}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p 
                      className="text-xs text-gray-600 mt-1 line-clamp-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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