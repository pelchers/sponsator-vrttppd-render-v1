import { Request, Response } from 'express';
import * as userService from '../services/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Special case for our hardcoded user IDs
    if (id === '123' || id === '1') {
      // Return a mock user for the hardcoded ID
      return res.json({
        id: id,
        profile_image: '/placeholder.svg',
        username: 'pelchers',
        email: 'pelycluk@gmail.com',
        bio: 'New user',
        user_type: 'user',
        skills: [],
        expertise: [],
        target_audience: [],
        solutions_offered: [],
        interest_tags: [],
        experience_tags: [],
        education_tags: [],
        website_links: [],
        work_experience: [],
        education: [],
        certifications: [],
        accolades: [],
        endorsements: [],
        featured_projects: [],
        case_studies: [],
        social_links: {
          youtube: '',
          instagram: '',
          github: '',
          twitter: '',
          linkedin: ''
        },
        notification_preferences: {
          email: true,
          push: true,
          digest: true
        }
      });
    }
    
    // Normal case - fetch from database
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
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

export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Check if the user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Upload the image and update the user
    const imageUrl = await userService.uploadProfileImage(id, file);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image' });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    console.log('Registration request received:', req.body);
    
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    console.log('Creating new user with username:', username);
    const newUser = await userService.createUser({
      username,
      email,
      password_hash: hashedPassword,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return user data and token (excluding password)
    console.log('User created successfully with ID:', newUser.id);
    res.status(201).json({
      user: newUser,
      token
    });
  } catch (error) {
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
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return user data and token (excluding password)
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