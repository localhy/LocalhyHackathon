import React, { useState, useEffect } from 'react';
import { Send, Loader, MessageCircle, Heart, User, X, Trash2 } from 'lucide-react'; // Added Trash2 icon
import { supabase } from '../../lib/supabase'; // Assuming supabase is accessible
import {
  getGroupComments, // Changed from getCommentsByContent
  createGroupComment, // Changed from createComment
  likeGroupComment, // <--- Changed from likeComment
  deleteGroupComment, // Added deleteGroupComment
  GroupPost, // Assuming GroupPost is imported or defined elsewhere if needed
  GroupComment // Assuming GroupComment is imported or defined elsewhere if needed
} from '../../lib/database'; // Adjust path as necessary

interface CommentsModalProps {
  post: GroupPost;
  isVisible: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ post, isVisible, onClose, currentUserId }) => {
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Move formatDate definition here, before its usage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    if (isVisible && post) {
      loadComments();
    }
  }, [isVisible, post]);

  const loadComments = async () => {
    if (!post) return;
    setLoadingComments(true);
    try {
      // Use getGroupComments for comments on group posts
      const fetchedComments = await getGroupComments(post.id, currentUserId);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setCommentError('Failed to load comments.');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!post || !currentUserId || !newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    setCommentError('');

    try {
      // Use createGroupComment for comments on group posts
      const comment = await createGroupComment({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (comment) {
        const { data: userProfileData } = await supabase
          .from('user_profiles')
          .select('name, avatar_url')
          .eq('id', currentUserId)
          .single();

        setComments(prev => [{
          ...comment,
          user_profile: userProfileData || { name: 'You', avatar_url: '' }
        }, ...prev]);
        setNewComment('');
      } else {
        throw new Error('Failed to create comment');
      }
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setCommentError(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      // Use the new likeGroupComment function
      const success = await likeGroupComment(commentId, currentUserId); // <--- Changed function call
      if (success) {
        setComments(prev => prev.map(c =>
          c.id === commentId
            ? {
                ...c,
                liked_by_user: !c.liked_by_user,
                likes: c.liked_by_user ? c.likes - 1 : c.likes + 1
              }
            : c
        ));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string, commentContent: string) => {
    if (!currentUserId) return;
    if (!window.confirm(`Are you sure you want to delete this comment: "${commentContent.substring(0, 50)}..."? This action cannot be undone.`)) {
      return;
    }

    try {
      const success = await deleteGroupComment(commentId); // Use the new deleteGroupComment
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        setCommentError('Failed to delete comment. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setCommentError('Failed to delete comment. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat' }}>
            Comments ({comments.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.user_profile?.avatar_url ? (
                    <img
                      src={comment.user_profile.avatar_url}
                      alt={comment.user_profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user_profile?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          comment.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                      {currentUserId === comment.user_id && ( // Only show delete for owner
                        <button
                          onClick={() => handleDeleteComment(comment.id, comment.content)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-4 border-t">
          {commentError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
              {commentError}
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submittingComment}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
            >
              {submittingComment ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;