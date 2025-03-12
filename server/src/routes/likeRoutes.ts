import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Import the like controller
import * as likeController from '../controllers/likeController';

// Protected routes (require authentication)
router.post('/', authenticate, likeController.createLike);
router.delete('/', authenticate, likeController.deleteLike);
router.get('/status', authenticate, likeController.getLikeStatus);

// Public routes (no authentication required)
router.get('/count', likeController.getLikeCount);

export default router; 