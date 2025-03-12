import { Request, Response } from 'express';
import * as likeService from '../services/likeService';

/**
 * Create a new like
 */
export const createLike = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if like already exists
    const existingLike = await likeService.getLike(userId, entity_type, entity_id);
    if (existingLike) {
      return res.status(409).json({ message: 'Already liked' });
    }
    
    // Create like
    const like = await likeService.createLike(userId, entity_type, entity_id);
    
    // Update like count on the entity
    await likeService.incrementLikeCount(entity_type, entity_id);
    
    return res.status(201).json(like);
  } catch (error) {
    console.error('Error in createLike:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a like
 */
export const deleteLike = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if like exists
    const existingLike = await likeService.getLike(userId, entity_type, entity_id);
    if (!existingLike) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    // Delete like
    await likeService.deleteLike(existingLike.id);
    
    // Update like count on the entity
    await likeService.decrementLikeCount(entity_type, entity_id);
    
    return res.status(200).json({ message: 'Like removed' });
  } catch (error) {
    console.error('Error in deleteLike:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if a user has liked an entity
 */
export const getLikeStatus = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id } = req.query;
    const userId = req.user.id;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if like exists
    const existingLike = await likeService.getLike(
      userId, 
      entity_type as string, 
      entity_id as string
    );
    
    return res.json({ liked: !!existingLike });
  } catch (error) {
    console.error('Error in getLikeStatus:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get the like count for an entity
 */
export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id } = req.query;
    
    // Validate input
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get like count
    const count = await likeService.getLikeCount(
      entity_type as string, 
      entity_id as string
    );
    
    return res.json({ count });
  } catch (error) {
    console.error('Error in getLikeCount:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 