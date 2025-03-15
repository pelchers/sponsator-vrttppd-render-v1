import { Request, Response } from 'express';
import * as permissionService from '../services/permissionService';

/**
 * Get all available chat roles
 */
export const getChatRoles = async (req: Request, res: Response) => {
  try {
    const roles = await permissionService.getChatRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error getting chat roles:', error);
    res.status(500).json({ message: 'Failed to get chat roles' });
  }
};

/**
 * Get all available chat permissions
 */
export const getChatPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getChatPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Error getting chat permissions:', error);
    res.status(500).json({ message: 'Failed to get chat permissions' });
  }
};

/**
 * Get a user's permissions in a chat
 */
export const getUserChatPermissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.id;
    const permissions = await permissionService.getUserChatPermissions(chatId, userId);
    res.json({ permissions });
  } catch (error) {
    console.error('Error getting user chat permissions:', error);
    
    if (error.message === 'User is not a participant in this chat') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to get permissions' });
  }
}; 