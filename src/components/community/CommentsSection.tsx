import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Heart, User, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { type Comment } from '../../lib/database'

interface CommentsSectionProps {
  contentId: string
  contentType: 'idea' | 'referral_job' | 'tool' | 'business' | 'community_post'
  comments: Comment[]
  loading: boolean
  onClose: () => void
  onCommentSubmit: (content: string) => Promise<void>
  onCommentLike: (commentId: string) => Promise<void>
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  contentId,
  contentType,
  comments,
  loading,
  onClose,
  onCommentSubmit,
  onCommentLike
}) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    // Focus the comment input when the modal opens
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
    
    // Add event listener for escape key
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscapeKey)
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || submitting) return
    
    setSubmitting(true)
    
    try {
      await onCommentSubmit(newComment)
      setNewComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Comments
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                {comment.user_profile?.avatar_url ? (
                  <img
                    src={comment.user_profile.avatar_url}
                    alt={comment.user_profile.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
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
                  <div className="flex items-center mt-1 ml-1">
                    <button
                      onClick={() => onCommentLike(comment.id)}
                      className={`flex items-center space-x-1 text-xs ${
                        comment.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Comment form */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={1}
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
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsSection