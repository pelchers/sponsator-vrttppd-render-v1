import { Request, Response } from 'express';
import * as commentService from '../services/commentService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createComment = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id, text } = req.body;
    const user_id = req.user?.id; // From auth middleware

    if (!user_id || !entity_type || !entity_id || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const comment = await commentService.createComment({
      user_id,
      entity_type,
      entity_id,
      text
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error in createComment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  console.log('getComments controller called');
  try {
    const { entityType, entityId } = req.params;
    console.log('Getting comments for:', { entityType, entityId });

    if (!entityType || !entityId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Verify prisma is available
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return res.status(500).json({ message: 'Database connection error' });
    }

    try {
      const comments = await commentService.getComments(entityType, entityId);
      console.log('Found comments:', comments);
      return res.json(comments);
    } catch (dbError) {
      console.error('Database error in getComments:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      throw dbError;
    }
  } catch (error) {
    console.error('Error in getComments controller:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ 
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const comment = await commentService.getCommentById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow comment author to delete
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await commentService.deleteComment(id);
    return res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 