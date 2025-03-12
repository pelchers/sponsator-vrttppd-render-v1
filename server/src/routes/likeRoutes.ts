import { Router } from 'express';
import * as likeController from '../controllers/likeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/', authenticate, likeController.createLike);
router.delete('/', authenticate, likeController.deleteLike);
router.get('/status', authenticate, likeController.getLikeStatus);

// Public routes
router.get('/count', likeController.getLikeCount);

export default router; 