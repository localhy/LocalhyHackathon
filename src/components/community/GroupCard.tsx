import React, { forwardRef } from 'react'; // Import forwardRef
import { Users, MapPin, Lock, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../lib/database';

interface GroupCardProps {
  group: Group;
  isMember: boolean;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  currentUserId: string; // Pass current user ID to check ownership
}

// Use forwardRef to allow parent components to pass a ref to this component's DOM node
const GroupCard = forwardRef<HTMLDivElement, GroupCardProps>(({ group, isMember, onJoin, onLeave, currentUserId }, ref) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/dashboard/community/groups/${group.id}`);
  };

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (isMember) {
      onLeave(group.id);
    } else {
      onJoin(group.id);
    }
  };

  const isOwner = group.owner_id === currentUserId;

  const getGroupTypeColor = (type: Group['type']) => {
    switch (type) {
      case 'business_guild': return 'bg-blue-100 text-blue-800';
      case 'idea_hub': return 'bg-green-100 text-green-800';
      case 'referral_network': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrivacyIcon = (privacy: Group['privacy_setting']) => {
    switch (privacy) {
      case 'public': return <Globe className="h-3 w-3 mr-1" />;
      case 'private': return <Lock className="h-3 w-3 mr-1" />;
      case 'hidden': return <Lock className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div
      ref={ref} // Attach the forwarded ref to the outermost div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(group.type)}`}>
            {group.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
          </span>
          <div className="flex items-center text-gray-500 text-xs">
            {getPrivacyIcon(group.privacy_setting)}
            <span>{group.privacy_setting.charAt(0).toUpperCase() + group.privacy_setting.slice(1)}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" style={{ fontFamily: 'Montserrat' }}>
          {group.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ fontFamily: 'Inter' }}>
          {group.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{/* Placeholder for member count, will fetch in parent */}0 Members</span>
          </div>
          {group.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{group.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {isOwner ? (
            <span className="text-sm text-green-600 font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Your Group
            </span>
          ) : (
            <button
              onClick={handleJoinLeave}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMember
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isMember ? 'Leave Group' : 'Join Group'}
            </button>
          )}
          <button
            onClick={handleViewDetails}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
          >
            View Details <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default GroupCard;