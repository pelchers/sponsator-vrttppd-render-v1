import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth'; // If using authentication
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Configure multer for profile image uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// IMPORTANT: Put specific routes BEFORE parameterized routes
// Search users route must come before /:id
router.get('/search', authenticate, userController.searchUsers);

// Register new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Protected routes (require authentication)
router.get('/likes', authenticate, userController.getUserLikes);

// Get user interactions (likes, follows, watches)
router.get('/interactions', authenticate, userController.getUserInteractions);

// Get specific user's portfolio
router.get('/portfolio/:userId', userController.getUserPortfolio);

// Get current user's portfolio
router.get('/portfolio', authenticate, userController.getUserPortfolio);

// Get user by ID (this should come AFTER other specific routes)
router.get('/:id', userController.getUserById);

// Update user (protected route if using auth)
router.put('/:id', authenticate, userController.updateUser);

// Upload profile image
router.post('/:id/profile-image', authenticate, profileUpload.single('profile_image'), userController.uploadProfileImage);

// Add a test endpoint to check database connection
router.get('/test-db', async (req, res) => {
  try {
    const count = await prisma.users.count();
    res.json({ message: 'Database connection successful', userCount: count });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Add this route
router.get('/:userId/stats', authenticate, userController.getUserStats);

export default router; 