import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Chat } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/avatar';

interface ChatListProps {
  chats: Chat[];
}

const ChatList: React.FC<ChatListProps> = ({ chats }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        // For direct chats, show the custom name or fallback to other participant's name
        const otherParticipant = chat.type === 'direct'
          ? chat.participants.find(p => p.user_id !== user?.id)
          : null;
        
        const chatName = chat.name || (chat.type === 'direct'
          ? otherParticipant?.username || 'Unknown User'
          : 'Group Chat');
        
        const lastMessage = chat.last_message || 'No messages yet';
        const lastMessageTime = chat.last_message_at
          ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })
          : '';
        
        return (
          <Link
            key={chat.id}
            to={`/messages/${chat.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {chat.type === 'direct' ? (
                  <Avatar 
                    src={otherParticipant?.profile_image || undefined} 
                    alt={chatName}
                    fallback={chatName.substring(0, 2).toUpperCase()}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {chatName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{chatName}</h3>
                  <span className="text-xs text-gray-500">{lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
              </div>
              {chat.unread_count > 0 && (
                <div className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread_count}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ChatList; 