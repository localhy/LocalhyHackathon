import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Filter, ChevronDown, Users, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getGroups, joinGroup, leaveGroup, Group } from '../../lib/database'; // Import Group interface and functions
import GroupCard from './GroupCard'; // Import the new GroupCard component

const CommunityGroups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my_groups'>('all');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Group['type'] | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGroupElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreGroups();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const groupTypes: Array<Group['type']> = ['business_guild', 'idea_hub', 'referral_network', 'general'];

  useEffect(() => {
    loadGroups(true); // Load all groups initially
    if (user) {
      loadMyGroups(); // Load user's groups
    }
  }, [searchTerm, selectedType, selectedLocation, user]); // Reload when filters or user changes

  const loadGroups = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setAllGroups([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const currentPage = reset ? 0 : page;
      const limit = 12;
      const offset = currentPage * limit;

      const fetchedGroups = await getGroups(
        {
          searchTerm,
          type: selectedType || undefined,
          location: selectedLocation || undefined,
          privacy: 'public' // Only show public groups in the "All Groups" tab
        },
        { limit: limit + 1, offset } // Fetch one extra to check for more
      );

      const hasMoreItems = fetchedGroups.length > limit;
      if (hasMoreItems) {
        fetchedGroups.pop(); // Remove the extra item
      }

      if (reset) {
        setAllGroups(fetchedGroups);
      } else {
        setAllGroups(prev => [...prev, ...fetchedGroups]);
      }

      setHasMore(hasMoreItems);
      setPage(currentPage + 1);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMyGroups = async () => {
    if (!user) return;
    try {
      const fetchedMyGroups = await getGroups(
        { userId: user.id },
        { limit: 100, offset: 0 } // Fetch all user's groups for now
      );
      setMyGroups(fetchedMyGroups);
    } catch (err) {
      console.error('Error loading my groups:', err);
      // Don't set global error, as it's a secondary fetch
    }
  };

  const loadMoreGroups = () => {
    if (!loadingMore && hasMore) {
      loadGroups(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      navigate('/auth'); // Redirect to auth if not logged in
      return;
    }
    try {
      await joinGroup(groupId, user.id);
      // Optimistically update UI
      setAllGroups(prev => prev.map(g => g.id === groupId ? { ...g, isMember: true } : g));
      setMyGroups(prev => [...prev, allGroups.find(g => g.id === groupId)!]); // Add to my groups
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await leaveGroup(groupId, user.id);
      // Optimistically update UI
      setAllGroups(prev => prev.map(g => g.id === groupId ? { ...g, isMember: false } : g));
      setMyGroups(prev => prev.filter(g => g.id !== groupId)); // Remove from my groups
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedLocation('');
    loadGroups(true);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedType,
    selectedLocation,
  ].filter(Boolean).length;

  const displayedGroups = activeTab === 'all' ? allGroups : myGroups;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
            Community Groups
          </h1>
          <button
            onClick={() => navigate('/dashboard/community/groups/create')} // Navigate to create group form
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            style={{ fontFamily: 'Inter' }}
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              All Groups ({allGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('my_groups')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                activeTab === 'my_groups'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              My Groups ({myGroups.length})
            </button>
          </nav>

          {/* Filters */}
          <div className="p-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="text-gray-700" style={{ fontFamily: 'Inter' }}>
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as Group['type'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Types</option>
                    {groupTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Filter by location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {activeFiltersCount > 0 && (
                  <div className="md:col-span-2">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
            <button
              onClick={() => loadGroups(true)}
              className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Group List */}
        {loading && displayedGroups.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader className="h-12 w-12 animate-spin text-green-500" />
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No groups found' : 'You haven\'t joined any groups yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? 'Try adjusting your filters or be the first to create a new group!'
                : 'Explore "All Groups" to find communities to join, or create your own.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/community/groups/create')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                isMember={myGroups.some(mg => mg.id === group.id)}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                currentUserId={user?.id || ''}
                memberCount={group.member_count || 0} // Pass actual member count if available, otherwise 0
                ref={activeTab === 'all' && index === displayedGroups.length - 1 ? lastGroupElementRef : null}
              />
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-green-500" />
          </div>
        )}
        {!hasMore && activeTab === 'all' && displayedGroups.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
              You've seen all available groups! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityGroups;