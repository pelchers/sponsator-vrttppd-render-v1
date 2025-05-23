import { Request, Response } from 'express';
import * as userService from '../services/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Fetch user from database with all related data
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        user_work_experience: true,
        user_education: true,
        user_certifications: true,
        user_accolades: true,
        user_endorsements: true,
        user_featured_projects: true,
        user_case_studies: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    console.log('Update user request received for ID:', id);
    console.log('Update data:', userData);
    
    // Validate input
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    // Check if the user exists
    console.log('Checking if user exists');
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user
    console.log('Updating user in database');
    const updatedUser = await userService.updateUser(id, userData);
    
    // Return the updated user
    console.log('User updated successfully');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
}

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await userService.uploadProfileImage(id, file);

    res.json({
      success: true,
      data: {
        path: result.path,
        display: 'upload'
      }
    });
  } catch (error) {
    console.error('Error in uploadProfileImage controller:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
};

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }
    
    // Check if user exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const newUser = await userService.createUser({
      username,
      email,
      password_hash: hashedPassword,
    });
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    if (!user?.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}

/**
 * Get all content liked by the current user
 */
export const getUserLikes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Parse query parameters
    const contentTypes = req.query.contentTypes 
      ? (req.query.contentTypes as string).split(',') 
      : ['posts', 'articles', 'projects'];
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    
    // Get liked content from service
    const result = await userService.getUserLikedContent(userId, contentTypes, page, limit);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('[USER CONTROLLER] Error getting user likes:', error);
    return res.status(500).json({ message: 'Failed to get liked content' });
  }
};

/**
 * Get user interactions (likes, follows, watches) with filtering
 */
export const getUserInteractions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Parse query parameters
    const contentTypes = req.query.contentTypes 
      ? (req.query.contentTypes as string).split(',') 
      : ['users', 'projects', 'posts', 'articles'];
      
    const interactionTypes = req.query.interactionTypes 
      ? (req.query.interactionTypes as string).split(',') 
      : ['likes', 'follows', 'watches'];
      
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '12', 10);
    
    console.log(`[USER CONTROLLER] Getting interactions for user ${userId}`);
    console.log(`[USER CONTROLLER] Content types: ${contentTypes.join(', ')}`);
    console.log(`[USER CONTROLLER] Interaction types: ${interactionTypes.join(', ')}`);
    
    // Get interactions from service
    const result = await userService.getUserInteractions(
      userId,
      contentTypes,
      interactionTypes,
      page,
      limit
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('[USER CONTROLLER] Error getting user interactions:', error);
    return res.status(500).json({ message: 'Failed to get user interactions' });
  }
};

// Get user's portfolio (content they created)
export async function getUserPortfolio(req: Request, res: Response) {
  try {
    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const contentTypes = req.query.contentTypes 
      ? (req.query.contentTypes as string).split(',') 
      : ['posts', 'articles', 'projects'];
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = (req.query.sortOrder as string || 'desc') === 'asc' ? 'asc' : 'desc';
    
    // Get user ID (from params or from authenticated user)
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[USER CONTROLLER] Getting portfolio for user ${userId}`);
    console.log(`[USER CONTROLLER] Content types: ${contentTypes.join(', ')}`);
    console.log(`[USER CONTROLLER] Sort: ${sortBy} ${sortOrder}`);
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get portfolio data from service
    const portfolioData = await userService.getUserPortfolio(userId, {
      contentTypes,
      page,
      limit,
      sortBy,
      sortOrder
    });
    
    res.status(200).json(portfolioData);
  } catch (error) {
    console.error('Error in getUserPortfolio controller:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio data' });
  }
}

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        profile_image: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

// Add this function to get user's content stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Get counts from all relevant tables
    const [
      projectsCount,
      articlesCount,
      postsCount,
      likesCount
    ] = await Promise.all([
      prisma.projects.count({
        where: { user_id: userId }
      }),
      prisma.articles.count({
        where: { user_id: userId }
      }),
      prisma.posts.count({
        where: { user_id: userId }
      }),
      prisma.likes.count({
        where: { user_id: userId }
      })
    ]);
    
    return res.status(200).json({
      projects: projectsCount,
      articles: articlesCount,
      posts: postsCount,
      likes: likesCount
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({ message: 'Failed to get user stats' });
  }
}; 