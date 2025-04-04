import express from 'express';
import { loginUser, registerUser } from '../controllers/userController';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || '2322',
      { expiresIn: '24h' }
    );
    
    // Log successful login
    console.log(`User ${user.id} logged in successfully`);
    
    // Return user data and token
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        // Don't include password
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', registerUser);

export default router; 