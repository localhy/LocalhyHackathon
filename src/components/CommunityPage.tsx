import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Newspaper, ShoppingBag, Calendar, UserPlus, MessageCircle, Search, Filter, Plus, User, Heart, Share2, MapPin, Clock, ChevronDown, Image, X, Send, Loader, AlertCircle, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost, getCommentsByContent, createComment, uploadFile, subscribeToCommunityPosts, type CommunityPost, type Comment } from '../lib/database'
import CommunityPostCard from './CommunityPostCard'
import { supabase } from '../lib/supabase'

interface TabProps {
  id: string
  label: string
  icon: React.ComponentType<any>
  count?: number
  isActive: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ id, label, icon: Icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
)

const CommunityPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState<File | null>(null)
  const [newPostLocation, setNewPostLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabs = [
    { id: 'all', label: 'All Posts', icon: Newspaper, count: posts.length },
    { id: 'trending', label: 'Trending', icon: Users },
    { id: 'local', label: 'Local', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
  ]

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCommunityPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (!user) return

    const subscription = subscribeToCommunityPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        setPosts(prev => [payload.new as CommunityPost, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setPosts(prev => prev.map(post => 
          post.id === payload.new.id ? payload.new as CommunityPost : post
        ))
      } else if (payload.eventType === 'DELETE') {
        setPosts(prev => prev.filter(post => post.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return

    try {
      setIsSubmitting(true)
      
      let imageUrl = null
      if (newPostImage) {
        imageUrl = await uploadFile(newPostImage, 'community-posts')
      }

      await createCommunityPost({
        user_id: user.id,
        content: newPostContent.trim(),
        image_url: imageUrl,
        location: newPostLocation.trim() || null
      })

      setNewPostContent('')
      setNewPostImage(null)
      setNewPostLocation('')
      setShowCreatePost(false)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPostImage(file)
    }
  }

  const removeImage = () => {
    setNewPostImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.user_profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes || 0) - (a.likes || 0)
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
              <p className="text-gray-600">Connect with entrepreneurs, share insights, and build your network</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  {...tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create Post
              </button>
            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Create Post</h3>
                      <button
                        onClick={() => setShowCreatePost(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                      />

                      <input
                        type="text"
                        value={newPostLocation}
                        onChange={(e) => setNewPostLocation(e.target.value)}
                        placeholder="Location (optional)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <div className="flex items-center gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Image size={20} />
                          Add Image
                        </button>
                      </div>

                      {newPostImage && (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(newPostImage)}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                          onClick={() => setShowCreatePost(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim() || isSubmitting}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Send size={16} />
                          )}
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-600" size={32} />
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                sortedPosts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CommunityPage