import React, { useState } from 'react'
import { X, User, Heart, Send, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { type Comment } from '../../lib/database'

interface CommentsSectionProps {
  comments: Comment[]
  loading: boolean
  onSubmit: (content: string) => Promise<boolean>
  onLike: (commentId: string) => void
  onClose: () => void
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  comments, 
  loading, 
  onSubmit, 
  onLike, 
  onClose 
}) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || submitting) return
    
    setSubmitting(true)
    setError('')
    
    try {
      const success = await onSubmit(newComment)
      
      if (success) {
        setNewComment('')
      } else {
        throw new Error('Failed to submit comment')
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      setError(error.message || 'Failed to submit comment. Please try again.')
    } finally {
      setSubmitting(false)
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
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Comments ({comments.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200">
          <div className="flex space-x-3">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontFamily: 'Inter' }}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:text-gray-300"
                >
                  {submitting ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-1">{error}</p>
              )}
            </div>
          </div>
        </form>
      )}
      
      {/* Comments list */}
      <div className="max-h-96 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              {comment.user_profile?.avatar_url ? (
                <img
                  src={comment.user_profile.avatar_url}
                  alt={comment.user_profile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.user_profile?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1 ml-2">
                  <button
                    onClick={() => onLike(comment.id)}
                    className={`flex items-center space-x-1 text-xs ${
                      comment.liked_by_user ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                    <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentsSection