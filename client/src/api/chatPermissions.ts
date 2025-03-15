import { api } from './api';

interface ChatRole {
  id: string;
  name: string;
  description?: string;
}

// Check if the current user has specific permissions in a chat
export const checkPermission = async (chatId: string): Promise<string[]> => {
  const response = await api.get(`/chats/${chatId}/permissions`);
  return response.data.permissions;
};

// Get all available chat roles
export const getChatRoles = async (): Promise<ChatRole[]> => {
  const response = await api.get('/chat-roles');
  return response.data;
};

// Get all available chat permissions
export const getChatPermissions = async () => {
  const response = await api.get('/chat-permissions');
  return response.data;
}; 