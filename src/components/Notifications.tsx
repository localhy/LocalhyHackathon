import React, { useState, useEffect } from 'react'
import { Bell, Check, X, Eye, Trash2, Filter, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  subscribeToUserNotifications,
  type Notification 
} from '../lib/database'

const Notifications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadNotifications()
      
      // Set up real-time subscription
      const subscription = subscribeToUserNotifications(user.id, (payload) => {
        console.log('Notification update:', payload)
        
        if (payload.eventType === 'INSERT') {
          // Add new notification to the top of the list
          setNotifications(prev => [payload.new, ...prev])
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
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const userNotifications = await getUserNotifications(user.id)
      setNotifications(userNotifications)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Failed to load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const success = await markAllNotificationsAsRead(user.id)
      if (success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const success = await deleteNotification(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        )
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type: string, read: boolean) => {
    const baseColor = read ? 'bg-white' : 'bg-blue-50'
    
    switch (type) {
      case 'success':
        return read ? 'bg-white' : 'bg-green-50'
      case 'warning':
        return read ? 'bg-white' : 'bg-yellow-50'
      case 'error':
        return read ? 'bg-white' : 'bg-red-50'
      default:
        return baseColor
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'read') return notif.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="notifications"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="notifications"
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
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Montserrat' }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p 
                className="text-gray-600 mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                Stay updated with your latest activities
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                style={{ fontFamily: 'Inter' }}
              >
                <Check className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              {['all', 'unread', 'read'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === filterType
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
                <button
                  onClick={loadNotifications}
                  className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                </h3>
                <p 
                  className="text-gray-600 mb-4"
                  style={{ fontFamily: 'Inter' }}
                >
                  {filter === 'all' 
                    ? 'Start engaging with the community to receive notifications about your activities.'
                    : `You don't have any ${filter} notifications at the moment.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/create-new')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Create Your First Post
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/ideas-vault')}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Explore Ideas
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${getNotificationBgColor(notification.type, notification.read)} border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      notification.action_url ? 'cursor-pointer' : ''
                    } ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 
                              className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                              style={{ fontFamily: 'Inter' }}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p 
                            className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Inter' }}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification.id)
                          }}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default Notifications