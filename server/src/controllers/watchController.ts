import { Request, Response } from 'express';
import * as watchService from '../services/watchService';

/**
 * Create a new watch
 */
export const createWatch = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if watch already exists
    const existingWatch = await watchService.getWatch(userId, entity_type, entity_id);
    if (existingWatch) {
      return res.status(409).json({ message: 'Already watching this entity' });
    }
    
    // Create watch
    const result = await watchService.createWatch(userId, entity_type, entity_id);
    
    // Return response
    return res.status(201).json({
      message: 'Watch created successfully',
      watch: result.watch
    });
  } catch (error) {
    console.error('[WATCH CONTROLLER] Error creating watch:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a watch
 */
export const deleteWatch = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Delete watch
    const result = await watchService.deleteWatch(userId, entity_type, entity_id);
    
    // Check if watch was found and deleted
    if (!result) {
      return res.status(404).json({ message: 'Watch not found' });
    }
    
    // Return response
    return res.status(200).json({
      message: 'Watch deleted successfully',
      watch: result
    });
  } catch (error) {
    console.error('[WATCH CONTROLLER] Error deleting watch:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user is watching an entity
 */
export const getWatchStatus = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type, entity_id } = req.query;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get watch
    const watch = await watchService.getWatch(
      userId, 
      entity_type as string, 
      entity_id as string
    );
    
    // Return response
    return res.status(200).json({
      watching: !!watch
    });
  } catch (error) {
    console.error('[WATCH CONTROLLER] Error checking watch status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get watch count for an entity
 */
export const getWatchCount = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type, entity_id } = req.query;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get watch count
    const count = await watchService.getWatchCount(
      entity_type as string, 
      entity_id as string
    );
    
    // Return response
    return res.json({ count });
  } catch (error) {
    console.error('[WATCH CONTROLLER] Error getting watch count:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get count of entities a user is watching by type
 */
export const getUserWatchesCount = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type } = req.query;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get watch count
    const count = await watchService.getUserWatchesCount(
      userId,
      entity_type as string
    );
    
    // Return response
    return res.json({ count });
  } catch (error) {
    console.error('[WATCH CONTROLLER] Error getting user watches count:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 