import { Router } from 'express';
import * as exploreController from '../controllers/exploreController';

const router = Router();

// Search across all content types
router.get('/search', exploreController.searchAll);

export default router; 