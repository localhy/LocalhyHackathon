import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader, AlertCircle, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getCommunityPosts, 
  subscribeToCommunityPosts,
  getCommentsByContent,
  createComment,
  likeComment,
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
                user_profiles: data,
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

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const fetchedPosts = await getCommunityPosts(10, 0, user?.id)
      setPosts(fetchedPosts)
      setPage(1)
      setHasMore(fetchedPosts.length === 10)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      
      const fetchedPosts = await getCommunityPosts(10, page * 10, user?.id)
      setPosts(prev => [...prev, ...fetchedPosts])
      setPage(prev => prev + 1)
      setHasMore(fetchedPosts.length === 10)
    } catch (err) {
      console.error('Error loading more posts:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePostCreated = () => {
    // Reload posts to get the latest data
    loadPosts()
  }

  const handlePostUpdate = (updatedPost: CommunityPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
  }

  const handleCommentClick = async (postId: string) => {
    setSelectedPostId(postId)
    
    try {
      setLoadingComments(true)
      if (user) {
        const fetchedComments = await getCommentsByContent(postId, 'community_post', user.id)
        setComments(fetchedComments)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCommentSubmit = async (content: string) => {
    if (!selectedPostId || !user || !content.trim()) return
    
    try {
      const newComment = await createComment({
        content_id: selectedPostId,
        content_type: 'community_post',
        user_id: user.id,
        content: content.trim()
      })
      
      if (newComment) {
        setComments(prev => [newComment, ...prev])
        
        // Update the comments count in the post
        setPosts(prev => prev.map(post => 
          post.id === selectedPostId 
            ? { ...post, comments_count: post.comments_count + 1 } 
            : post
        ))
      }
      
      return true
    } catch (error) {
      console.error('Error submitting comment:', error)
      return false
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) return
    
    try {
      const success = await likeComment(commentId, user.id)
      if (success) {
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

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Post creation form */}
      <CommunityPostForm onPostCreated={handlePostCreated} />
      
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadPosts}
            className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Posts list */}
      {posts.length === 0 && !loading ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <h3 
            className="text-xl font-semibold text-gray-900 mb-2"
            style={{ fontFamily: 'Montserrat' }}
          >
            No posts yet
          </h3>
          <p 
            className="text-gray-600 mb-6"
            style={{ fontFamily: 'Inter' }}
          >
            Be the first to share something with your community!
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post, index) => {
            const isLastItem = index === posts.length - 1
            
            return (
              <div
                key={post.id}
                ref={isLastItem ? lastPostElementRef : undefined}
              >
                <CommunityPostCard 
                  post={post} 
                  onCommentClick={handleCommentClick}
                  onPostUpdate={handlePostUpdate}
                />
                
                {/* Show comments section if this post is selected */}
                {selectedPostId === post.id && (
                  <CommentsSection
                    comments={comments}
                    loading={loadingComments}
                    onSubmit={handleCommentSubmit}
                    onLike={handleCommentLike}
                    onClose={() => setSelectedPostId(null)}
                  />
                )}
              </div>
            )
          })}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* End of results indicator */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              You've reached the end of the feed
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CommunityFeed