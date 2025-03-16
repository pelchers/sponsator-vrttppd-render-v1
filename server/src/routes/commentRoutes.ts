import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log('Comment route accessed:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// Public routes first
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    console.log('Get comments route hit:', req.params);
    await commentController.getComments(req, res);
  } catch (error) {
    console.error('Error in comments route:', error);
    res.status(500).json({
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test route to verify routing
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Comments route is working' });
});

// Protected routes
router.post('/', authenticate, commentController.createComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router; 