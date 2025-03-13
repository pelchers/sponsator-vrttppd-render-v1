import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as followController from '../controllers/followController';

const router = Router();

// Protected routes (require authentication)
router.post('/', authenticate, followController.createFollow);
router.delete('/', authenticate, followController.deleteFollow);
router.get('/status', authenticate, followController.getFollowStatus);

// Public routes (no authentication required)
router.get('/count', followController.getFollowCount);
router.get('/user-count', authenticate, followController.getUserFollowsCount);

export default router; 