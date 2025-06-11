import React, { useState, useEffect } from 'react'
import { MessageCircle, User, X, Send } from 'lucide-react'
import { 
  subscribeToUserMessages,
  type Message 
} from '../../lib/database'
import { useAuth } from '../../contexts/AuthContext'

interface MessagePreview {
  id: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  read: boolean
  conversation_id: string
}

interface MessageTooltipProps {
  isOpen: boolean
  onClose: () => void
  onViewAll: () => void
}

const MessageTooltip: React.FC<MessageTooltipProps> = ({ isOpen, onClose, onViewAll }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MessagePreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isOpen) {
      loadRecentMessages()
      
      // Set up real-time subscription for new messages
      const subscription = subscribeToUserMessages(user.id, (payload) => {
        console.log('Message tooltip update:', payload)
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message
          
          // Only show messages sent TO the current user (not from them)
          if (newMessage.sender_id !== user.id) {
            // In a real implementation, you would fetch sender details from user_profiles
            const messagePreview: MessagePreview = {
              id: newMessage.id,
              senderName: 'Community Member', // Would be fetched from database
              senderAvatar: undefined, // Would be fetched from database
              content: newMessage.content,
              timestamp: newMessage.created_at,
              read: newMessage.read,
              conversation_id: newMessage.conversation_id
            }
            
            setMessages(prev => [messagePreview, ...prev].slice(0, 5)) // Keep only latest 5
          }
        } else if (payload.eventType === 'UPDATE') {
          // Update message read status
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, read: payload.new.read }
                : msg
            )
          )
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, isOpen])

  const loadRecentMessages = async () => {
    if (!user) return

    try {
      setLoading(true)
      // For now, start with empty messages since this would require complex database queries
      // In a real implementation, you would fetch recent messages for the user
      setMessages([])
    } catch (error) {
      console.error('Error loading recent messages:', error)
    } finally {
      setLoading(false)
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

  const unreadMessages = messages.filter(m => !m.read)

  if (!isOpen) return null

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 
            className="font-semibold text-gray-900"
            style={{ fontFamily: 'Inter' }}
          >
            Messages
            {unreadMessages.length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadMessages.length}
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
        ) : messages.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p 
              className="text-gray-500 text-sm"
              style={{ fontFamily: 'Inter' }}
            >
              No new messages
            </p>
            <p 
              className="text-gray-400 text-xs mt-1"
              style={{ fontFamily: 'Inter' }}
            >
              Connect with the community to start conversations
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !message.read ? 'bg-green-50' : ''
                }`}
                onClick={() => {
                  // Navigate to the specific conversation
                  onViewAll()
                  onClose()
                }}
              >
                <div className="flex items-start space-x-3">
                  {message.senderAvatar ? (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p 
                        className={`text-sm font-medium truncate ${
                          !message.read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                        style={{ fontFamily: 'Inter' }}
                      >
                        {message.senderName}
                      </p>
                      {!message.read && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p 
                      className="text-xs text-gray-600 mt-1 line-clamp-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(message.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Send className="h-3 w-3 text-gray-400" />
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
          View All Messages
        </button>
      </div>
    </div>
  )
}

export default MessageTooltip