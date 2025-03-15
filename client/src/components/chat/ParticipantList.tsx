import React from 'react';
import { ChatParticipant } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import UserOptionsModal from './UserOptionsModal';

interface ParticipantListProps {
  participants: ChatParticipant[];
  currentUserId: string;
  userPermissions: string[];
  onOpenUserOptions: (participant: ChatParticipant) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  userPermissions,
  onOpenUserOptions
}) => {
  // Sort participants: current user first, then by role importance, then by username
  const sortedParticipants = [...participants].sort((a, b) => {
    // Current user first
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    
    // Then by role (assuming role_name is available)
    const roleOrder = ['owner', 'admin', 'moderator', 'helper', 'chatter', 'spectator'];
    const aRoleIndex = roleOrder.indexOf(a.role_name || '');
    const bRoleIndex = roleOrder.indexOf(b.role_name || '');
    
    if (aRoleIndex !== bRoleIndex) {
      return aRoleIndex - bRoleIndex;
    }
    
    // Then by username
    return (a.username || '').localeCompare(b.username || '');
  });

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">Participants ({participants.length})</h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedParticipants.map(participant => (
          <div 
            key={participant.user_id}
            className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer"
            onClick={() => onOpenUserOptions(participant)}
          >
            <div className="flex items-center">
              <Avatar
                src={participant.profile_image || undefined}
                alt={participant.username || ''}
                fallback={(participant.username || 'U').substring(0, 2).toUpperCase()}
                className="w-8 h-8 mr-3"
              />
              
              <div>
                <div className="font-medium">
                  {participant.username || 'Unknown User'}
                  {participant.user_id === currentUserId && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {participant.role_name || 'Member'}
                </div>
              </div>
            </div>
            
            {participant.is_online && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList; 