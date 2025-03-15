import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';
import { format } from 'date-fns';
import { 
  deleteMessage, 
  editMessage, 
  pinMessage, 
  unpinMessage 
} from '@/api/chats';
import { Loader } from '@/components/ui/loader';

interface MessageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  userPermissions: string[];
  currentUserId: string;
  onMessageUpdated?: (updatedMessage: Message) => void;
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  isOpen,
  onClose,
  message,
  userPermissions,
  currentUserId,
  onMessageUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!message) return null;
  
  const isOwnMessage = message.sender_id === currentUserId;
  const canEdit = isOwnMessage || userPermissions.includes('edit_messages');
  const canDelete = isOwnMessage || userPermissions.includes('delete_messages');
  const canPin = userPermissions.includes('pin_messages');
  
  const handleStartEditing = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };
  
  const handleSaveEdit = async () => {
    if (!editedContent.trim() || !message) return;
    
    try {
      setIsLoading(true);
      await editMessage(message.chat_id, message.id, editedContent);
      onClose();
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!message) return;
    
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteMessage(message.chat_id, message.id);
      onClose();
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTogglePin = async () => {
    if (!message) return;
    
    try {
      setIsLoading(true);
      let updatedMessage;
      if (message.is_pinned) {
        updatedMessage = await unpinMessage(message.chat_id, message.id);
      } else {
        updatedMessage = await pinMessage(message.chat_id, message.id);
      }
      // Update the message in the parent component
      onMessageUpdated?.(updatedMessage);
      onClose();
    } catch (error) {
      console.error('Error toggling pin status:', error);
      setError('Failed to toggle pin status');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4">Message Options</h2>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">
              {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
              {message.is_edited && <span className="ml-1">(edited)</span>}
            </div>
            
            {isEditing ? (
              <textarea
                className="w-full border rounded p-2 mt-2"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-gray-800">{message.content}</p>
            )}
            
            {message.media_url && (
              <div className="mt-2">
                <a 
                  href={message.media_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm"
                >
                  View attachment
                </a>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {isEditing ? (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={isLoading || !editedContent.trim()}
                  className="flex-1"
                >
                  {isLoading ? <Loader size="sm" /> : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                {canEdit && (
                  <Button 
                    variant="outline" 
                    onClick={handleStartEditing}
                    className="w-full"
                  >
                    Edit Message
                  </Button>
                )}
                
                {canPin && (
                  <Button 
                    variant="outline" 
                    onClick={handleTogglePin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader size="sm" /> : message.is_pinned ? 'Unpin Message' : 'Pin Message'}
                  </Button>
                )}
                
                {canDelete && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader size="sm" /> : 'Delete Message'}
                  </Button>
                )}
              </>
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

export default MessageOptionsModal; 