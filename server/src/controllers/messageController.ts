import { Request, Response } from 'express';
import * as messageService from '../services/messageService';

/**
 * Get messages for a chat
 */
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const messages = await messageService.getChatMessages(chatId, userId, { page, limit });
    res.json(messages);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    
    if (error.message === 'User is not a participant in this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const { content, parentId } = req.body;
    const mediaFile = req.file;
    
    if (!content && !mediaFile) {
      return res.status(400).json({ message: 'Message content or media is required' });
    }

    const message = await messageService.sendMessage(chatId, userId, {
      content: content || '',
      parentId,
      mediaFile
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error.message === 'User does not have permission to send messages in this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message === 'User does not have permission to send media in this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to send message' });
  }
};

/**
 * Edit a message
 */
export const editMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const messageId = req.params.messageId;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await messageService.editMessage(chatId, messageId, userId, content);
    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    
    if (error.message === 'Message not found') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'User does not have permission to edit this message') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const messageId = req.params.messageId;

    await messageService.deleteMessage(chatId, messageId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    
    if (error.message === 'Message not found') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'User does not have permission to delete this message') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

/**
 * Pin a message
 */
export const pinMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const messageId = req.params.messageId;

    const message = await messageService.pinMessage(chatId, messageId, userId);
    res.json(message);
  } catch (error) {
    console.error('Error pinning message:', error);
    
    if (error.message === 'Message not found') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'User does not have permission to pin messages') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to pin message' });
  }
};

/**
 * Unpin a message
 */
export const unpinMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const messageId = req.params.messageId;

    const message = await messageService.unpinMessage(chatId, messageId, userId);
    res.json(message);
  } catch (error) {
    console.error('Error unpinning message:', error);
    
    if (error.message === 'Message not found') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'User does not have permission to unpin messages') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to unpin message' });
  }
}; 