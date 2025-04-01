import express from 'express';
import { suggestionController } from '../controllers/suggestionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', suggestionController.getSuggestions);
router.get('/:id', suggestionController.getSuggestionById);

// Protected routes
router.post('/', authenticate, suggestionController.createSuggestion);
router.put('/:id', authenticate, suggestionController.updateSuggestion);
router.delete('/:id', authenticate, suggestionController.deleteSuggestion);

// Admin routes
router.put('/:id/approve', authenticate, suggestionController.approveSuggestion);
router.put('/:id/feature', authenticate, suggestionController.featureSuggestion);

export default router; 