import React from 'react';
import { ChatParticipant } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';

interface ParticipantTagProps {
  participant: ChatParticipant;
  onClick: () => void;
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-orange-100 text-orange-800',
  helper: 'bg-yellow-100 text-yellow-800',
  chatter: 'bg-green-100 text-green-800',
  spectator: 'bg-gray-100 text-gray-800'
};

export const ParticipantTag: React.FC<ParticipantTagProps> = ({ participant, onClick }) => {
  const roleColor = roleColors[participant.role_name as keyof typeof roleColors] || roleColors.chatter;

  return (
    <div
      className={`inline-flex items-center rounded-full px-2 py-1 m-1 cursor-pointer hover:opacity-90 ${roleColor}`}
      onClick={onClick}
    >
      <Avatar
        src={participant.profile_image}
        alt={participant.username}
        fallback={participant.username.substring(0, 2).toUpperCase()}
        className="w-6 h-6 mr-2"
      />
      <span className="text-sm font-medium">{participant.username}</span>
    </div>
  );
}; 