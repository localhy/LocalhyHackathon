import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Search, MoreVertical, User, Phone, Video, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { 
  subscribeToUserMessages,
  createMessage,
  getConversations, // Add this
  getMessagesByConversationId, // Add this
  markMessagesAsRead, // Add this
  type Message, // Keep this
  type Conversation // Add this
} from '../lib/database'

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  created_at: string
  other_user: {
    id: string
    name: string
    avatar_url?: string
  }
  last_message?: Message
  unread_count: number
}

const Messages = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
  if (user) {
    loadConversations() // Call loadConversations on component mount

    // Set up real-time subscription for messages
    const subscription = supabase
      .channel('messages') // Use a generic channel name or a more specific one if you have RLS set up
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})` // Filter for relevant conversations
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // If the new message belongs to the currently selected conversation
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, newMessage])
            // Mark the message as read if the current user is the recipient and the conversation is open
            if (newMessage.sender_id !== user.id) {
              markMessagesAsRead(selectedConversation.id, user.id)
            }
          }
          
          // Update conversation list with new message
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id
                ? { 
                    ...conv, 
                    last_message_content: newMessage.content,
                    last_message_at: newMessage.created_at,
                    unread_count: newMessage.sender_id !== user.id ? conv.unread_count + 1 : conv.unread_count
                  }
                : conv
            ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}, [user, selectedConversation, conversations.length]) // Add conversations.length to dependency array

  const loadConversations = async () => {
    // For now, start with empty conversations since this would require complex database queries
    // In a real implementation, you would fetch conversations from the database
    setConversations([])
    setLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    // For now, start with empty messages since this would require database queries
    // In a real implementation, you would fetch messages for the conversation
    setMessages([])
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
      case 'business-pages':
        navigate('/dashboard/business-pages')
        break
      case 'community':
        navigate('/dashboard/community')
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sending) return

    setSending(true)
    try {
      const messageData = {
        sender_id: user.id,
        recipient_id: selectedConversation.other_user.id,
        content: newMessage.trim()
      }

      const createdMessage = await createMessage(messageData)
      if (createdMessage) {
        setMessages(prev => [...prev, createdMessage])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
    
    // Mark conversation as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
      )
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="messages"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="messages"
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
          <div className="max-w-6xl mx-auto">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Messages
            </h1>
            <p 
              className="text-gray-600 mt-1"
              style={{ fontFamily: 'Inter' }}
            >
              Connect with other community members
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-white rounded-lg h-full flex overflow-hidden">
              {/* Conversations List */}
              <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto h-full">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p 
                        className="text-gray-500 text-sm"
                        style={{ fontFamily: 'Inter' }}
                      >
                        No conversations yet
                      </p>
                      <p 
                        className="text-gray-400 text-xs mt-1"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Start engaging with the community to receive messages
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                          }`}
                          onClick={() => handleConversationSelect(conversation)}
                        >
                          <div className="flex items-center space-x-3">
                            {conversation.other_user.avatar_url ? (
                              <img
                                src={conversation.other_user.avatar_url}
                                alt={conversation.other_user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p 
                                  className="font-medium text-gray-900 truncate"
                                  style={{ fontFamily: 'Inter' }}
                                >
                                  {conversation.other_user.name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  {conversation.unread_count > 0 && (
                                    <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                      {conversation.unread_count}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatTime(conversation.last_message_at)}
                                  </span>
                                </div>
                              </div>
                              {conversation.last_message && (
                                <p 
                                  className="text-sm text-gray-600 truncate mt-1"
                                  style={{ fontFamily: 'Inter' }}
                                >
                                  {conversation.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        {selectedConversation.other_user.avatar_url ? (
                          <img
                            src={selectedConversation.other_user.avatar_url}
                            alt={selectedConversation.other_user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div>
                          <h3 
                            className="font-medium text-gray-900"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {selectedConversation.other_user.name}
                          </h3>
                          <p className="text-sm text-gray-500">Online</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                          <Phone className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                          <Video className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p 
                            className="text-gray-500"
                            style={{ fontFamily: 'Inter' }}
                          >
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p style={{ fontFamily: 'Inter' }}>{message.content}</p>
                              <p 
                                className={`text-xs mt-1 ${
                                  message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ fontFamily: 'Inter' }}
                          disabled={sending}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 
                        className="text-xl font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        Select a conversation
                      </h3>
                      <p 
                        className="text-gray-600"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Choose a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

export default Messages