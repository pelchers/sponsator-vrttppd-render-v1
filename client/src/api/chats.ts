import { api } from './api';
import { Chat, ChatParticipant, Message } from '@/types/chat';

// Fetch all chats for the current user
export const fetchUserChats = async (): Promise<Chat[]> => {
  const response = await api.get('/chats');
  return response.data;
};

// Fetch a specific chat by ID
export const fetchChat = async (chatId: string): Promise<Chat> => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};

// Create a new chat
export const createChat = async (data: {
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
}): Promise<Chat> => {
  try {
    console.log('Creating chat with data:', data);
    const response = await api.post('/chats', data);
    console.log('Chat created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// Update a chat
export const updateChat = async (
  chatId: string,
  data: { name?: string }
): Promise<Chat> => {
  const response = await api.put(`/chats/${chatId}`, data);
  return response.data;
};

// Delete a chat
export const deleteChat = async (chatId: string): Promise<void> => {
  await api.delete(`/chats/${chatId}`);
};

// Leave a chat
export const leaveChat = async (chatId: string): Promise<void> => {
  await api.post(`/chats/${chatId}/leave`);
};

// Fetch messages for a chat
export const fetchMessages = async (chatId: string): Promise<Message[]> => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
};

// Send a message
export const sendMessage = async (
  chatId: string,
  content: string,
  mediaFiles?: File[]
): Promise<Message> => {
  const formData = new FormData();
  formData.append('content', content);
  
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });
  }
  
  const response = await api.post(`/chats/${chatId}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Edit a message
export const editMessage = async (
  chatId: string,
  messageId: string,
  content: string
): Promise<Message> => {
  const response = await api.put(`/chats/${chatId}/messages/${messageId}`, { content });
  return response.data;
};

// Delete a message
export const deleteMessage = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  await api.delete(`/chats/${chatId}/messages/${messageId}`);
};

// Pin a message
export const pinMessage = async (
  chatId: string,
  messageId: string
): Promise<Message> => {
  try {
    const response = await api.post(`/chats/${chatId}/messages/${messageId}/pin`);
    return response.data;
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

// Unpin a message
export const unpinMessage = async (
  chatId: string,
  messageId: string
): Promise<Message> => {
  try {
    const response = await api.delete(`/chats/${chatId}/messages/${messageId}/pin`);
    return response.data;
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw error;
  }
};

// Add a participant to a chat
export const addChatParticipant = async (
  chatId: string,
  data: { userId: string; roleId: string }
): Promise<ChatParticipant> => {
  const response = await api.post(`/chats/${chatId}/participants`, data);
  return response.data;
};

// Update a participant's role
export const updateParticipantRole = async (
  chatId: string,
  userId: string,
  roleId: string
): Promise<ChatParticipant> => {
  const response = await api.put(`/chats/${chatId}/participants/${userId}`, { roleId });
  return response.data;
};

// Remove a participant from a chat
export const removeParticipant = async (
  chatId: string,
  userId: string
): Promise<void> => {
  await api.delete(`/chats/${chatId}/participants/${userId}`);
}; 