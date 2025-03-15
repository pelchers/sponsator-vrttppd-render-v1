import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createChat } from '@/api/chats';
import { searchUsers } from '@/api/users';
import { Chat, ChatType } from '@/types/chat';
import { User } from '@/types/user';
import { Loader } from '@/components/ui/loader';
import { Avatar } from '@/components/ui/avatar';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: Chat) => void;
}

interface SelectedUserTag {
  id: string;
  username: string;
  onRemove: () => void;
}

const UserTag: React.FC<SelectedUserTag> = ({ username, onRemove }) => (
  <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm m-1">
    <span>{username}</span>
    <button
      type="button"
      onClick={onRemove}
      className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
    >
      ×
    </button>
  </div>
);

const CreateChatModal: React.FC<CreateChatModalProps> = ({ 
  isOpen, 
  onClose,
  onChatCreated
}) => {
  const [chatType, setChatType] = useState<ChatType>('direct');
  const [chatName, setChatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Add debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      setError('');
      const users = await searchUsers(searchQuery);
      // Filter out already selected users and current user
      setSearchResults(users.filter(user => 
        !selectedUsers.some(selected => selected.id === user.id) &&
        user.id !== localStorage.getItem('userId')
      ));
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    if (chatType === 'direct' && selectedUsers.length >= 1) {
      // For direct chats, only allow one user
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => {
        // Check if user is already selected
        if (prev.some(u => u.id === user.id)) {
          return prev;
        }
        return [...prev, user];
      });
    }
    
    // Clear search results and query
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    // For direct chats, use the other user's name as chat name
    const defaultChatName = chatType === 'direct' 
      ? selectedUsers[0].username
      : '';

    // For group chats, require a name
    if (chatType === 'group' && !chatName.trim()) {
      setError('Please enter a name for the group chat');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const newChat = await createChat({
        type: chatType,
        name: chatType === 'direct' ? defaultChatName : chatName,
        participants: selectedUsers.map(user => user.id)
      });
      
      onChatCreated(newChat);
      handleClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setChatType('direct');
    setChatName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setError('');
    onClose();
  };

  // Add a suggested name based on chat type and selected users
  const getSuggestedName = () => {
    if (chatType === 'direct' && selectedUsers.length > 0) {
      return selectedUsers[0].username;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Create New Chat</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <Label className="block mb-2">Chat Type</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={chatType === 'direct'}
                  onChange={() => {
                    setChatType('direct');
                    setChatName(getSuggestedName());
                  }}
                  className="form-radio"
                />
                <span>Direct Message</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={chatType === 'group'}
                  onChange={() => setChatType('group')}
                  className="form-radio"
                />
                <span>Group Chat</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="chatName" className="block mb-2">
              {chatType === 'direct' ? 'Chat Name' : 'Group Name'}
            </Label>
            <Input
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder={
                chatType === 'direct' 
                  ? "Enter chat name (optional)" 
                  : "Enter group name"
              }
              className="w-full"
            />
            {chatType === 'direct' && (
              <p className="text-sm text-gray-500 mt-1">
                Leave blank to use participant's name
              </p>
            )}
          </div>
          
          {/* Selected users tags */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <Label className="block mb-2">Selected Users</Label>
              <div className="flex flex-wrap border rounded p-2 min-h-[2.5rem]">
                {selectedUsers.map(user => (
                  <UserTag
                    key={user.id}
                    id={user.id}
                    username={user.username}
                    onRemove={() => handleRemoveUser(user.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Search input - remove the search button since we're searching as you type */}
          <div className="mb-4">
            <Label htmlFor="searchUsers" className="block mb-2">Add Participants</Label>
            <div className="relative">
              <Input
                id="searchUsers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email"
                className="w-full"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader size="sm" />
                </div>
              )}
            </div>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-4 border rounded max-h-40 overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar 
                    src={user.profile_image}
                    alt={user.username}
                    fallback={user.username.substring(0, 2).toUpperCase()}
                    className="w-8 h-8"
                  />
                  <div className="ml-2">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChat}
              disabled={
                creating || 
                selectedUsers.length === 0 || 
                (chatType === 'group' && !chatName.trim())
              }
            >
              {creating ? <Loader size="sm" /> : 'Create Chat'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateChatModal; 