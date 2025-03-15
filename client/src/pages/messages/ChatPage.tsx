import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ParticipantList from '@/components/chat/ParticipantList';
import ChatOptionsModal from '@/components/chat/ChatOptionsModal';
import InviteModal from '@/components/chat/InviteModal';
import UserOptionsModal from '@/components/chat/UserOptionsModal';
import { fetchChat, fetchMessages, sendMessage } from '@/api/chats';
import { Chat, Message, ChatParticipant } from '@/types/chat';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/useAuth';
import { checkPermission } from '@/api/chatPermissions';
import { ParticipantTag } from '@/components/chat/ParticipantTag';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<ChatParticipant | null>(null);
  const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    
    const loadChat = async () => {
      try {
        setLoading(true);
        const chatData = await fetchChat(chatId);
        setChat(chatData);
        setParticipants(chatData.participants);
        
        const messagesData = await fetchMessages(chatId);
        setMessages(messagesData);
        
        // Get user permissions for this chat
        if (user) {
          const permissions = await checkPermission(chatId);
          setUserPermissions(permissions);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, mediaFiles?: File[]) => {
    if (!chatId || !content.trim()) return;
    
    try {
      setSendingMessage(true);
      const newMessage = await sendMessage(chatId, content, mediaFiles);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const canAddUsers = userPermissions.includes('add_users');

  const handleUserClick = (participant: ChatParticipant) => {
    setSelectedParticipant(participant);
    setIsUserOptionsOpen(true);
  };

  const handleMessageUpdated = (updatedMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Chat not found</h3>
        <Button 
          onClick={() => navigate('/messages')} 
          className="mt-4"
        >
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat header */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-semibold">
                {chat.name || (chat.type === 'direct' 
                  ? participants.find(p => p.user_id !== user?.id)?.username || 'Chat'
                  : 'Group Chat')}
              </h2>
              <span className="text-sm text-gray-500">
                {participants.length} {participants.length === 1 ? 'member' : 'members'}
              </span>
            </div>
            <div className="flex space-x-2">
              {canAddUsers && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Add People
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsChatOptionsOpen(true)}
              >
                Settings
              </Button>
            </div>
          </div>

          {/* Participants list */}
          <div className="flex flex-wrap mt-2 pb-2 overflow-x-auto">
            {participants
              .sort((a, b) => {
                // Sort by role importance
                const roleOrder = ['owner', 'admin', 'moderator', 'helper', 'chatter', 'spectator'];
                const aIndex = roleOrder.indexOf(a.role_name);
                const bIndex = roleOrder.indexOf(b.role_name);
                if (aIndex !== bIndex) return aIndex - bIndex;
                // Then by username
                return (a.username || '').localeCompare(b.username || '');
              })
              .map(participant => (
                <ParticipantTag
                  key={participant.id}
                  participant={participant}
                  onClick={() => {
                    setSelectedParticipant(participant);
                    setIsUserOptionsOpen(true);
                  }}
                />
              ))}
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <MessageList 
            messages={messages} 
            participants={participants}
            currentUserId={user?.id || ''}
            userPermissions={userPermissions}
            onUserClick={handleUserClick}
            onMessageUpdated={handleMessageUpdated}
          />
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="p-4 bg-white border-t">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={sendingMessage || !userPermissions.includes('send_messages')}
            canSendMedia={userPermissions.includes('send_media')}
          />
        </div>
      </div>
      
      {/* Modals */}
      <ChatOptionsModal
        isOpen={isChatOptionsOpen}
        onClose={() => setIsChatOptionsOpen(false)}
        chat={chat}
        participants={participants}
        userPermissions={userPermissions}
        currentUserId={user?.id || ''}
      />
      
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        chatId={chatId || ''}
        onUserAdded={(newParticipant) => {
          setParticipants(prev => [...prev, newParticipant]);
        }}
      />
      
      <UserOptionsModal
        isOpen={isUserOptionsOpen}
        onClose={() => setIsUserOptionsOpen(false)}
        participant={selectedParticipant}
        chatId={chatId || ''}
        userPermissions={userPermissions}
        currentUserId={user?.id || ''}
        onParticipantUpdated={(updatedParticipant) => {
          setParticipants(prev => 
            prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
          );
        }}
        onParticipantRemoved={(userId) => {
          setParticipants(prev => prev.filter(p => p.user_id !== userId));
        }}
      />
    </div>
  );
};

export default ChatPage; 