import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import userRoutes from './routes/userRoutes';
import { Router } from 'express';
import * as userController from './controllers/userController';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articleRoutes';
import postRoutes from './routes/postRoutes';
import exploreRoutes from './routes/exploreRoutes';
import routes from './routes';

dotenv.config();

const app = express();
app.use(cors({
  origin: '*', // Allow all origins during development
  credentials: true
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post("/log", (req, res) => {
  const { message, type = 'info' } = req.body;
  console.log(`[CLIENT] ${type.toUpperCase()}: ${message}`);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  console.log("Root endpoint accessed");
  res.send("Server is running!");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api', routes);

// Define routes directly
app.post('/api/register', async (req, res) => {
  try {
    console.log('Register endpoint hit', req.body);
    
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await prisma.users.findFirst({
      where: { email },
    });
    
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    console.log('Hashing password');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user in database with minimal fields
    console.log('Creating user in database with minimal fields');
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
      },
    });
    
    console.log('User created successfully with ID:', newUser.id);
    
    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return user data and token (excluding password)
    const { password_hash, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error registering user';
    let statusCode = 500;
    
    if (error.code === 'P2002') {
      errorMessage = 'A user with this email already exists';
      statusCode = 409;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });
    
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
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user from database
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
    
    // Map flattened social links to nested object
    const social_links = {
      youtube: user.social_links_youtube || '',
      instagram: user.social_links_instagram || '',
      github: user.social_links_github || '',
      twitter: user.social_links_twitter || '',
      linkedin: user.social_links_linkedin || '',
    };
    
    // Map flattened notification preferences to nested object
    const notification_preferences = {
      email: user.notification_preferences_email || false,
      push: user.notification_preferences_push || false,
      digest: user.notification_preferences_digest || false,
    };
    
    // Remove password hash and flatten fields
    const { 
      password_hash, 
      social_links_youtube, 
      social_links_instagram, 
      social_links_github, 
      social_links_twitter, 
      social_links_linkedin,
      notification_preferences_email,
      notification_preferences_push,
      notification_preferences_digest,
      ...userWithoutPassword 
    } = user;
    
    // Return user with nested objects
    res.json({
      ...userWithoutPassword,
      social_links,
      notification_preferences
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.put('/api/users/:id', userController.updateUser);

// Keep the test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Try a simple route handler
app.post('/api/simple-register', (req, res) => {
  console.log('Simple register route hit', req.body);
  res.json({ message: 'Registration successful', user: { id: '123', ...req.body } });
});

// Add this after all routes are registered
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  next();
});

// Add this to list all registered routes
function printRoutes(router: Router, basePath = '') {
  const routes = [];
  
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const path = basePath + middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter(method => middleware.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push(`${methods.join(', ')} ${path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      const path = basePath + (middleware.regexp.toString().match(/^\/\^\\\/([^\\\/]*)/)?.[1] || '');
      printRoutes(middleware.handle, path);
    }
  });
  
  console.log('Registered routes:');
  routes.forEach(route => console.log(`- ${route}`));
}

printRoutes(app._router);

// Start the server
const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Check if the users table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `;
    
    console.log('Users table exists:', tableExists);
    
    // Get the schema of the users table
    const schema = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    
    console.log('Users table schema:', schema);
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testDatabaseConnection();

// Add a test endpoint to check database connection
app.get('/api/db-test', async (req, res) => {
  try {
    // Try to count users to test the connection
    const userCount = await prisma.users.count();
    res.json({ message: 'Database connection successful', userCount });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
}); 