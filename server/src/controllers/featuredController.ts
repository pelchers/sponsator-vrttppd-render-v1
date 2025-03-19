import { Request, Response } from 'express';
import * as featuredService from '../services/featuredService';

export const getFeaturedContent = async (req: Request, res: Response) => {
  try {
    const featuredContent = await featuredService.getFeaturedContent();
    return res.json(featuredContent);
  } catch (error) {
    console.error('Error getting featured content:', error);
    return res.status(500).json({ 
      message: 'Error fetching featured content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}; 