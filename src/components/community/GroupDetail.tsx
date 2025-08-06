import Sidebar from '../dashboard/Sidebar';
import TopBar from './../dashboard/TopBar'; // Corrected import path
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, MapPin, Lock, Globe, Send, Loader, AlertCircle, Check, Heart, MessageCircle,
  Image, Video, User, Plus, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getGroupById, getGroupMembers, getGroupPosts, createGroupPost, likeGroupPost,
  createGroupComment, getGroupComments, joinGroup, leaveGroup, uploadFile,
  Group, GroupPost, GroupComment
} from '../../lib/database'; // Import all necessary types and functions

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<any[]>([]); // Use any[] for now, or define GroupMember interface with user_profile
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add this state

  // Add this function to handle sidebar navigation
  const handleNavigation = (page: string) => {
    setSidebarOpen(false);
    // You might want to add specific navigation logic here if needed,
    // but for now, just closing the sidebar is sufficient.
    // For example, if you want to navigate back to the main community page:
    navigate('/dashboard/community');
  };

  // Post creation states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<File | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Comment modal states
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<GroupPost | null>(null);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!id) {
        setError('Invalid group ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const fetchedGroup = await getGroupById(id);
        if (fetchedGroup) {
          setGroup(fetchedGroup);
          const fetchedMembers = await getGroupMembers(id);
          setMembers(fetchedMembers);
          const fetchedPosts = await getGroupPosts(id, user?.id || undefined);
          setPosts(fetchedPosts);
        } else {
          setError('Group not found');
        }
      } catch (err) {
        console.error('Error loading group data:', err);
        setError('Failed to load group data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [id, user]);

  const isMember = user ? members.some(member => member.user_id === user.id) : false;
  const isOwner = user ? group?.owner_id === user.id : false;

  const handleJoinLeaveGroup = async () => {
    if (!group || !user) {
      navigate('/auth'); // Redirect to auth if not logged in
      return;
    }
    try {
      if (isMember) {
        await leaveGroup(group.id, user.id);
        setMembers(prev => prev.filter(m => m.user_id !== user.id));
      } else {
        await joinGroup(group.id, user.id);
        setMembers(prev => [...prev, { user_id: user.id, user_profile: { name: user.user_metadata?.name, avatar_url: user.user_metadata?.avatar_url } }]);
      }
    } catch (err) {
      console.error('Error joining/leaving group:', err);
      setError('Failed to update group membership. Please try again.');
    }
  };

  const handleCreatePost = async () => {
    if (!group || !user || !newPostContent.trim() || submittingPost) return;

    setSubmittingPost(true);
    setError('');

    let imageUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

    try {
      if (newPostImage) {
        imageUrl = await uploadFile(newPostImage, 'group-posts');
      }
      if (newPostVideo) {
        videoUrl = await uploadFile(newPostVideo, 'group-posts');
      }

      const newPost = await createGroupPost({
        group_id: group.id,
        user_id: user.id,
        content: newPostContent.trim(),
        image_url: imageUrl,
        video_url: videoUrl,
      });

      if (newPost) {
        // Add the new post to the state immediately for better UX
        const enhancedPost: GroupPost = {
          ...newPost,
          user_profile: { name: user.user_metadata?.name, avatar_url: user.user_metadata?.avatar_url },
          liked_by_user: false,
        };
        setPosts(prev => [enhancedPost, ...prev]);
        setNewPostContent('');
        setNewPostImage(null);
        setNewPostVideo(null);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      const success = await likeGroupPost(postId, user.id);
      if (success) {
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                liked_by_user: !post.liked_by_user,
                likes: post.liked_by_user ? post.likes - 1 : post.likes + 1
              }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like/unlike post. Please try again.');
    }
  };

  const handleOpenComments = (post: GroupPost) => {
    setSelectedPostForComments(post);
    setShowCommentsModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      setNewPostVideo(null); // Reset video if image is selected
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostVideo(file);
      setNewPostImage(null); // Reset image if video is selected
    }
  };

  const formatTimeAgo = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-16 w-16 animate-spin text-green-500" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Group not found'}</h2>
          <button
            onClick={() => navigate('/dashboard/community?tab=groups')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        currentPage="community" // Set the current page for sidebar highlighting
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user} // Pass the user prop to TopBar
        />

        {/* Wrap your existing content here */}
        <div className="bg-gray-50 flex-1"> {/* This div replaces the old outer div */}
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Group Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate('/dashboard/community?tab=groups')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                {user && (
                  <button
                    onClick={handleJoinLeaveGroup}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isMember
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isMember ? 'Leave Group' : 'Join Group'}
                  </button>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                {group.name}
              </h1>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
                {group.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{members.length} Members</span>
                </div>
                {group.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{group.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  {group.privacy_setting === 'public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <span>{group.privacy_setting.charAt(0).toUpperCase() + group.privacy_setting.slice(1)}</span>
                </div>
              </div>
            </div>

            {/* Group Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Post Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post Card */}
                {isMember && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex space-x-3">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Your avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Share an update with the group..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          rows={3}
                        />
                        {(newPostImage || newPostVideo) && (
                          <div className="mt-2 relative">
                            {newPostImage && (
                              <div className="relative">
                                <img
                                  src={URL.createObjectURL(newPostImage)}
                                  alt="Post image"
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => setNewPostImage(null)}
                                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            {newPostVideo && (
                              <div className="relative">
                                <video
                                  src={URL.createObjectURL(newPostVideo)}
                                  controls
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => setNewPostVideo(null)}
                                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {error && (
                          <div className="mt-2 text-red-600 text-sm">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-4">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-100"
                          title="Add Image"
                        >
                          <Image className="h-5 w-5" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-100"
                          title="Add Video"
                        >
                          <Video className="h-5 w-5" />
                        </button>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || submittingPost}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2"
                      >
                        {submittingPost ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts List */}
                {posts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to share an update in this group!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <div key={post.id} className="bg-white rounded-lg shadow">
                        <div className="p-4 flex items-start space-x-3">
                          {post.user_profile?.avatar_url ? (
                            <img
                              src={post.user_profile.avatar_url}
                              alt={post.user_profile.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{post.user_profile?.name || 'Anonymous'}</h3>
                                <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-gray-700 whitespace-pre-line">{post.content}</p>
                          </div>
                        </div>
                        {post.image_url && (
                          <div className="px-4 pb-4">
                            <img src={post.image_url} alt="Post media" className="w-full rounded-lg" />
                          </div>
                        )}
                        {post.video_url && (
                          <div className="px-4 pb-4">
                            <video src={post.video_url} controls className="w-full rounded-lg" />
                          </div>
                        )}
                        <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes} likes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments_count} comments</span>
                          </div>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                              post.liked_by_user ? 'text-red-500' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                            <span>Like</span>
                          </button>
                          <button
                            onClick={() => handleOpenComments(post)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>Comment</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar - Members List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Members ({members.length})
                  </h3>
                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <p className="text-gray-500 text-sm">No members yet.</p>
                    ) : (
                      members.map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {member.user_profile?.avatar_url ? (
                            <img
                              src={member.user_profile.avatar_url}
                              alt={member.user_profile.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <span className="text-gray-800 font-medium">{member.user_profile?.name || 'Anonymous'}</span>
                          {member.user_id === group.owner_id && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Owner</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Comments Modal */}
        {showCommentsModal && selectedPostForComments && (
          <CommentsModal
            post={selectedPostForComments}
            isVisible={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
            currentUserId={user?.id}
          />
        )}
      </div>
    );
  };

  export default GroupDetail;
