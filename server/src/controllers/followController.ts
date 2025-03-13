import { Request, Response } from 'express';
import * as followService from '../services/followService';

/**
 * Create a new follow
 */
export const createFollow = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if follow already exists
    const existingFollow = await followService.getFollow(userId, entity_type, entity_id);
    if (existingFollow) {
      return res.status(409).json({ message: 'Already following this entity' });
    }
    
    // Create follow
    const result = await followService.createFollow(userId, entity_type, entity_id);
    
    // Return response
    return res.status(201).json({
      message: 'Follow created successfully',
      follow: result.follow
    });
  } catch (error) {
    console.error('[FOLLOW CONTROLLER] Error creating follow:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a follow
 */
export const deleteFollow = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Delete follow
    const result = await followService.deleteFollow(userId, entity_type, entity_id);
    
    // Check if follow was found and deleted
    if (!result) {
      return res.status(404).json({ message: 'Follow not found' });
    }
    
    // Return response
    return res.status(200).json({
      message: 'Follow deleted successfully',
      follow: result
    });
  } catch (error) {
    console.error('[FOLLOW CONTROLLER] Error deleting follow:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user is following an entity
 */
export const getFollowStatus = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type, entity_id } = req.query;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get follow
    const follow = await followService.getFollow(
      userId, 
      entity_type as string, 
      entity_id as string
    );
    
    // Return response
    return res.status(200).json({
      following: !!follow
    });
  } catch (error) {
    console.error('[FOLLOW CONTROLLER] Error checking follow status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get follow count for an entity
 */
export const getFollowCount = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type, entity_id } = req.query;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get follow count
    const count = await followService.getFollowCount(
      entity_type as string, 
      entity_id as string
    );
    
    // Return response
    return res.json({ count });
  } catch (error) {
    console.error('[FOLLOW CONTROLLER] Error getting follow count:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get count of entities a user is following by type
 */
export const getUserFollowsCount = async (req: Request, res: Response) => {
  try {
    // Extract data from query parameters
    const { entity_type } = req.query;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get follow count
    const count = await followService.getUserFollowsCount(
      userId,
      entity_type as string
    );
    
    // Return response
    return res.json({ count });
  } catch (error) {
    console.error('[FOLLOW CONTROLLER] Error getting user follows count:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 