import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as watchController from '../controllers/watchController';

const router = Router();

// Protected routes (require authentication)
router.post('/', authenticate, watchController.createWatch);
router.delete('/', authenticate, watchController.deleteWatch);
router.get('/status', authenticate, watchController.getWatchStatus);
router.get('/user-count', authenticate, watchController.getUserWatchesCount);

// Public routes (no authentication required)
router.get('/count', watchController.getWatchCount);

export default router; 