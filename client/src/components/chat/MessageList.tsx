import React, { useState } from 'react';
import { format } from 'date-fns';
import { Message, ChatParticipant } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import MessageOptionsModal from './MessageOptionsModal';

interface MessageListProps {
  messages: Message[];
  participants: ChatParticipant[];
  currentUserId: string;
  userPermissions: string[];
  onUserClick?: (participant: ChatParticipant) => void;
  onMessageUpdated?: (updatedMessage: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  participants, 
  currentUserId,
  userPermissions,
  onUserClick,
  onMessageUpdated
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const handleMessageClick = (message: Message, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.avatar-click-area')) {
      return;
    }
    setSelectedMessage(message);
    setIsOptionsModalOpen(true);
  };

  const handleAvatarClick = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const participant = participants.find(p => p.user_id === userId);
    if (participant && onUserClick) {
      onUserClick(participant);
    }
  };

  const getParticipantByUserId = (userId: string) => {
    return participants.find(p => p.user_id === userId);
  };

  // Group messages by date
  const messagesByDate: { [date: string]: Message[] } = {};
  messages.forEach(message => {
    const date = new Date(message.created_at).toDateString();
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div className="space-y-4">
      {Object.entries(messagesByDate).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="text-center my-4">
            <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
              {format(new Date(date), 'MMMM d, yyyy')}
            </span>
          </div>
          
          <div className="space-y-4">
            {dateMessages.map(message => {
              const sender = getParticipantByUserId(message.sender_id);
              const isCurrentUser = message.sender_id === currentUserId;
              
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[70%] relative ${isCurrentUser ? 'order-2' : 'order-1'}`}
                    onClick={(e) => handleMessageClick(message, e)}
                  >
                    {message.is_pinned && (
                      <div className="absolute -top-2 right-2 text-lg" title="Pinned Message">
                        📌
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      {!isCurrentUser && (
                        <div 
                          className="avatar-click-area cursor-pointer"
                          onClick={(e) => handleAvatarClick(message.sender_id, e)}
                        >
                          <Avatar
                            src={sender?.profile_image || undefined}
                            alt={sender?.username || ''}
                            fallback={(sender?.username || 'U').substring(0, 2).toUpperCase()}
                            className="w-8 h-8 mr-2 mt-1 hover:opacity-80"
                          />
                        </div>
                      )}
                      
                      <div>
                        {!isCurrentUser && (
                          <div className="text-xs text-gray-500 mb-1">
                            {sender?.username || 'Unknown User'}
                          </div>
                        )}
                        
                        <div 
                          className={`p-3 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white rounded-tr-none' 
                              : 'bg-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {message.content}
                          
                          {message.media_url && (
                            <div className="mt-2">
                              {message.media_type?.startsWith('image/') ? (
                                <img 
                                  src={message.media_url} 
                                  alt="Attachment" 
                                  className="rounded max-w-full h-auto"
                                />
                              ) : message.media_type?.startsWith('video/') ? (
                                <video 
                                  src={message.media_url} 
                                  controls 
                                  className="rounded max-w-full h-auto"
                                />
                              ) : (
                                <div className="flex items-center p-2 bg-gray-100 rounded">
                                  <span className="text-sm">📎 Attachment</span>
                                  <a 
                                    href={message.media_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-500 text-sm"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs mt-1 text-right">
                            {format(new Date(message.created_at), 'h:mm a')}
                            {message.is_edited && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      )}
      
      <MessageOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        message={selectedMessage}
        userPermissions={userPermissions}
        currentUserId={currentUserId}
        onMessageUpdated={onMessageUpdated}
      />
    </div>
  );
};

export default MessageList; 