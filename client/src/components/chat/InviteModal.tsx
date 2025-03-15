import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchUsers } from '@/api/users';
import { addChatParticipant } from '@/api/chats';
import { User } from '@/types/user';
import { ChatParticipant } from '@/types/chat';
import { Loader } from '@/components/ui/loader';
import { Avatar } from '@/components/ui/avatar';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  onUserAdded: (participant: ChatParticipant) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  chatId,
  onUserAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('chatter');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      setError('');
      const users = await searchUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setSearching(false);
    }
  };
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
  };
  
  const handleAddUser = async () => {
    if (!selectedUser) return;
    
    try {
      setAdding(true);
      setError('');
      
      const newParticipant = await addChatParticipant(chatId, {
        userId: selectedUser.id,
        roleId: selectedRole
      });
      
      onUserAdded(newParticipant);
      handleClose();
    } catch (error) {
      console.error('Error adding user to chat:', error);
      setError('Failed to add user to chat');
    } finally {
      setAdding(false);
    }
  };
  
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedRole('chatter');
    setError('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add People</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <Label htmlFor="searchUsers" className="block mb-2">Search Users</Label>
            <div className="flex space-x-2">
              <Input
                id="searchUsers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? <Loader size="sm" /> : 'Search'}
              </Button>
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
                    src={user.profile_image || undefined} 
                    alt={user.username || ''}
                    fallback={(user.username || 'U').substring(0, 2).toUpperCase()}
                    className="w-8 h-8"
                  />
                  <span className="ml-2">{user.username}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected user */}
          {selectedUser && (
            <div className="mb-4">
              <Label className="block mb-2">Selected User</Label>
              <div className="p-2 border rounded flex items-center">
                <Avatar 
                  src={selectedUser.profile_image || undefined} 
                  alt={selectedUser.username || ''}
                  fallback={(selectedUser.username || 'U').substring(0, 2).toUpperCase()}
                  className="w-8 h-8"
                />
                <span className="ml-2">{selectedUser.username}</span>
              </div>
            </div>
          )}
          
          {/* Role selection */}
          {selectedUser && (
            <div className="mb-4">
              <Label htmlFor="role" className="block mb-2">Assign Role</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatter">Chatter</SelectItem>
                  <SelectItem value="helper">Helper</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={adding || !selectedUser}
            >
              {adding ? <Loader size="sm" /> : 'Add to Chat'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InviteModal; 