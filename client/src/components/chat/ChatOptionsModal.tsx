import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chat, ChatParticipant } from '@/types/chat';
import { updateChat, deleteChat, leaveChat } from '@/api/chats';
import { Loader } from '@/components/ui/loader';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ChatOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  participants: ChatParticipant[];
  userPermissions: string[];
  currentUserId: string;
}

const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  isOpen,
  onClose,
  chat,
  participants,
  userPermissions,
  currentUserId
}) => {
  const [chatName, setChatName] = useState(chat.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const isOwner = chat.created_by === currentUserId;
  const canEditChat = userPermissions.includes('change_roles');
  const canDeleteChat = userPermissions.includes('delete_chat');
  
  const handleUpdateChat = async () => {
    if (!chatName.trim() || chat.type !== 'group') return;
    
    try {
      setIsLoading(true);
      await updateChat(chat.id, { name: chatName });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteChat(chat.id);
      navigate('/messages');
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLeaveChat = async () => {
    if (!window.confirm('Are you sure you want to leave this chat?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await leaveChat(chat.id);
      navigate('/messages');
    } catch (error) {
      console.error('Error leaving chat:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Chat Settings</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label className="block mb-1">Chat Type</Label>
              <div className="text-gray-700">
                {chat.type === 'direct' ? 'Direct Message' : 'Group Chat'}
              </div>
            </div>
            
            {chat.type === 'group' && (
              <div>
                <Label className="block mb-1">Chat Name</Label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Input
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      placeholder="Enter chat name"
                    />
                    <Button 
                      onClick={handleUpdateChat}
                      disabled={isLoading || !chatName.trim()}
                    >
                      {isLoading ? <Loader size="sm" /> : 'Save'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-gray-700">{chat.name}</div>
                    {canEditChat && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label className="block mb-1">Created</Label>
              <div className="text-gray-700">
                {format(new Date(chat.created_at), 'MMMM d, yyyy')}
              </div>
            </div>
            
            <div>
              <Label className="block mb-1">Participants</Label>
              <div className="text-gray-700">
                {participants.length} {participants.length === 1 ? 'member' : 'members'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            {canDeleteChat && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteChat}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader size="sm" /> : 'Delete Chat'}
              </Button>
            )}
            
            {!isOwner && (
              <Button 
                variant="outline" 
                onClick={handleLeaveChat}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader size="sm" /> : 'Leave Chat'}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ChatOptionsModal; 