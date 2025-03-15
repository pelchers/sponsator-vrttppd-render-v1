import { Request, Response } from 'express';
import * as chatService from '../services/chatService';
import * as participantService from '../services/participantService';

/**
 * Get all chats for the current user
 */
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chats = await chatService.getUserChats(userId);
    res.json(chats);
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const chat = await chatService.getChatById(chatId, userId);
    res.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    
    if (error.message === 'User is not a participant in this chat' || error.message === 'Chat not found') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to get chat' });
  }
};

/**
 * Create a new chat
 */
export const createChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { type, name, participants } = req.body;
    
    if (!type || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ 
        message: 'Invalid request data. Required: type (direct/group) and participants (array)' 
      });
    }

    try {
      const chat = await chatService.createChat(userId, {
        type,
        name,
        participants
      });
      
      res.status(201).json(chat);
    } catch (error) {
      if (error.message === 'Direct chats must have exactly one other participant' || 
          error.message === 'Group chats must have a name') {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

/**
 * Update a chat
 */
export const updateChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const { name } = req.body;
    
    const chat = await chatService.updateChat(chatId, userId, { name });
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    
    if (error.message === 'User does not have permission to update this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to update chat' });
  }
};

/**
 * Delete a chat
 */
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    await chatService.deleteChat(chatId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    
    if (error.message === 'User does not have permission to delete this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

/**
 * Leave a chat
 */
export const leaveChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    await chatService.leaveChat(chatId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving chat:', error);
    
    if (error.message === 'User is not a participant in this chat') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to leave chat' });
  }
};

/**
 * Add a participant to a chat
 */
export const addParticipant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const { userId: newUserId, roleId } = req.body;
    
    if (!newUserId || !roleId) {
      return res.status(400).json({ message: 'User ID and role ID are required' });
    }

    const participant = await participantService.addParticipant(chatId, userId, {
      userId: newUserId,
      roleId
    });
    
    res.status(201).json(participant);
  } catch (error) {
    console.error('Error adding participant:', error);
    
    if (error.message === 'User does not have permission to add participants') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message === 'User is already a participant in this chat') {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to add participant' });
  }
};

/**
 * Update a participant's role
 */
export const updateParticipantRole = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const targetUserId = req.params.userId;
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const participant = await participantService.updateParticipantRole(
      chatId,
      userId,
      targetUserId,
      roleId
    );
    
    res.json(participant);
  } catch (error) {
    console.error('Error updating participant role:', error);
    
    if (error.message === 'User does not have permission to change roles') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message === 'Target user is not a participant in this chat') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to update participant role' });
  }
};

/**
 * Remove a participant from a chat
 */
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const targetUserId = req.params.userId;

    await participantService.removeParticipant(chatId, userId, targetUserId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    
    if (error.message === 'User does not have permission to remove participants') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message === 'Target user is not a participant in this chat') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to remove participant' });
  }
}; 