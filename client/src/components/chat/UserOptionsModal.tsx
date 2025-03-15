import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChatParticipant } from '@/types/chat';
import { updateParticipantRole, removeParticipant } from '@/api/chats';
import { getChatRoles } from '@/api/chatPermissions';
import { Loader } from '@/components/ui/loader';
import { Avatar } from '@/components/ui/avatar';

interface UserOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: ChatParticipant | null;
  chatId: string;
  userPermissions: string[];
  currentUserId: string;
  onParticipantUpdated: (updatedParticipant: ChatParticipant) => void;
  onParticipantRemoved: (userId: string) => void;
}

interface Role {
  id: string;
  name: string;
}

const UserOptionsModal: React.FC<UserOptionsModalProps> = ({
  isOpen,
  onClose,
  participant,
  chatId,
  userPermissions,
  currentUserId,
  onParticipantUpdated,
  onParticipantRemoved
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getChatRoles();
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Error loading roles:', error);
        setError('Failed to load roles');
      }
    };
    
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);
  
  // Reset state when participant changes
  useEffect(() => {
    if (participant) {
      setSelectedRole(participant.role_id);
    }
  }, [participant]);
  
  if (!participant) return null;
  
  const isCurrentUser = participant.user_id === currentUserId;
  const canChangeRoles = userPermissions.includes('change_roles') && !isCurrentUser;
  const canRemoveUsers = userPermissions.includes('remove_users') && !isCurrentUser;
  
  const handleUpdateRole = async () => {
    if (!participant || !selectedRole || selectedRole === participant.role_id) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const updatedParticipant = await updateParticipantRole(
        chatId,
        participant.user_id,
        selectedRole
      );
      onParticipantUpdated(updatedParticipant);
      onClose();
    } catch (error) {
      console.error('Error updating participant role:', error);
      setError('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveUser = async () => {
    if (!participant) return;
    
    if (!window.confirm(`Are you sure you want to remove ${participant.username || 'this user'} from the chat?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await removeParticipant(chatId, participant.user_id);
      onParticipantRemoved(participant.user_id);
      onClose();
    } catch (error) {
      console.error('Error removing participant:', error);
      setError('Failed to remove user');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Options</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Avatar 
                src={participant.profile_image || undefined} 
                alt={participant.username || ''}
                fallback={(participant.username || 'U').substring(0, 2).toUpperCase()}
                className="w-12 h-12 mr-4"
              />
              <div>
                <div className="font-medium text-lg">
                  {participant.username || 'Unknown User'}
                  {isCurrentUser && <span className="ml-2 text-sm text-gray-500">(You)</span>}
                </div>
                <div className="text-sm text-gray-500">
                  Current role: {participant.role_name || 'Member'}
                </div>
              </div>
            </div>
            
            {canChangeRoles && (
              <div className="mb-4">
                <Label htmlFor="role" className="block mb-2">Change Role</Label>
                <div className="flex space-x-2">
                  <Select
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                  >
                    <SelectTrigger id="role" className="flex-1">
                      <SelectValue placeholder="Select a role">
                        {availableRoles.find(r => r.id === selectedRole)?.name || 'Select a role'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleUpdateRole}
                    disabled={isLoading || !selectedRole || selectedRole === participant?.role_id}
                  >
                    {isLoading ? <Loader size="sm" /> : 'Update'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            {canRemoveUsers && (
              <Button 
                variant="destructive" 
                onClick={handleRemoveUser}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader size="sm" /> : 'Remove from Chat'}
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

export default UserOptionsModal; 