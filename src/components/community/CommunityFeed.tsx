import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getCommunityPosts, 
  getCommentsByContent, 
  createComment, 
  likeComment, 
  deleteCommunityPost,
  subscribeToCommunityPosts,
  type CommunityPost, 
  type Comment 
} from '../../lib/database'
import CommunityPostForm from './CommunityPostForm'
import CommunityPostCard from './CommunityPostCard'
import CommentsSection from './CommentsSection'

const CommunityFeed: React.FC = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  
  // Comments state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  
  // Infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  useEffect(() => {
    loadPosts()
    
    // Set up real-time subscription for new posts
    const subscription = subscribeToCommunityPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new post to the top of the list
        const newPost = payload.new as CommunityPost
        
        // Fetch user profile data for the new post
        supabase
          .from('user_profiles')
          .select('name, avatar_url, user_type')
          .eq('id', newPost.user_id)
          .single()
          .then(({ data }) => {
            if (data) {
              setPosts(prev => [{
                ...newPost,
                user_profile: data,
                liked_by_user: false
              }, ...prev])
            }
          })
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted post
        setPosts(prev => prev.filter(post => post.id !== payload.old.id))
      } else if (payload.eventType === 'UPDATE') {
        // Update existing post
        setPosts(prev => prev.map(post => 
          post.id === payload.new.id ? { ...post, ...payload.new } : post
        ))
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadPosts = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
      } else {
        setLoadingMore(true)
      }
      
      setError('')
      
      const limit = 10
      const offset = reset ? 0 : page * limit
      
      const fetchedPosts = await getCommunityPosts(limit, offset, user?.id)
      
      if (reset) {
        setPosts(fetchedPosts)
      } else {
        setPosts(prev => [...prev, ...fetchedPosts])
      }
      
      setHasMore(fetchedPosts.length === limit)
      setPage(prev => reset ? 1 : prev + 1)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false)
    }
  }

  const handlePostCreated = () => {
    // Reload posts to get the latest data
    loadPosts()
  }

  const handleCommentClick = async (postId: string) => {
    setSelectedPostId(postId)
    setLoadingComments(true)
    
    try {
      const postComments = await getCommentsByContent(postId, 'community_post', user?.id)
      setComments(postComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCloseComments = () => {
    setSelectedPostId(null)
    setComments([])
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return
    
    try {
      const success = await deleteCommunityPost(postId)
      if (success) {
        // Remove post from state
        setPosts(prev => prev.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleCommentSubmit = async (content: string) => {
    if (!user || !selectedPostId || !content.trim()) return
    
    try {
      const newComment = await createComment({
        content_id: selectedPostId,
        content_type: 'community_post',
        user_id: user.id,
        content: content.trim()
      })
      
      if (newComment) {
        // Add new comment to the list
        setComments(prev => [newComment, ...prev])
        
        // Update post's comment count
        setPosts(prev => prev.map(post => 
          post.id === selectedPostId 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        ))
      }
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) return
    
    try {
      const success = await likeComment(commentId, user.id)
      if (success) {
        // Update comment in state
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                liked_by_user: !comment.liked_by_user,
                likes: comment.liked_by_user ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        ))
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Post creation form */}
      <CommunityPostForm onPostCreated={handlePostCreated} />
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
          <button
            onClick={() => loadPosts()}
            className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* No posts state */}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 
            className="text-xl font-semibold text-gray-900 mb-2"
            style={{ fontFamily: 'Montserrat' }}
          >
            No posts yet
          </h3>
          <p 
            className="text-gray-600 mb-4"
            style={{ fontFamily: 'Inter' }}
          >
            Be the first to share something with your community!
          </p>
        </div>
      )}
      
      {/* Posts list */}
      {posts.map((post, index) => {
        const isLastItem = index === posts.length - 1
        
        return (
          <div
            key={post.id}
            ref={isLastItem ? lastPostElementRef : null}
          >
            <CommunityPostCard
              post={post}
              onCommentClick={handleCommentClick}
              onDeleteClick={handleDeletePost}
            />
          </div>
        )
      })}
      
      {/* Load more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* End of feed message */}
      {!loading && !loadingMore && !hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          You've reached the end of the feed
        </div>
      )}
      
      {/* Comments modal */}
      {selectedPostId && (
        <CommentsSection
          contentId={selectedPostId}
          contentType="community_post"
          comments={comments}
          loading={loadingComments}
          onClose={handleCloseComments}
          onCommentSubmit={handleCommentSubmit}
          onCommentLike={handleCommentLike}
        />
      )}
    </div>
  )
}

export default CommunityFeed