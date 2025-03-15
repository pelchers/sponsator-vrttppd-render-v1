import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatList from '@/components/chat/ChatList';
import CreateChatModal from '@/components/chat/CreateChatModal';
import { fetchUserChats } from '@/api/chats';
import { Chat } from '@/types/chat';
import { Loader } from '@/components/ui/loader';

const MessagesListPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const fetchedChats = await fetchUserChats();
        setChats(fetchedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  const handleChatCreated = (newChat: Chat) => {
    setChats(prevChats => [newChat, ...prevChats]);
    navigate(`/messages/${newChat.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          New Chat
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Start a conversation with someone to see it here.
          </p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="mt-4"
          >
            Start a Conversation
          </Button>
        </div>
      ) : (
        <ChatList chats={chats} />
      )}

      <CreateChatModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default MessagesListPage; 