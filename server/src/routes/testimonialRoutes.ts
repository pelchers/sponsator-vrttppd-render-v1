import express from 'express';
import { testimonialController } from '../controllers/testimonialController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', testimonialController.getTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Protected routes
router.post('/', authenticate, testimonialController.createTestimonial);
router.put('/:id', authenticate, testimonialController.updateTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteTestimonial);

// Admin routes (would typically have additional middleware for admin check)
router.put('/:id/approve', authenticate, testimonialController.approveTestimonial);
router.put('/:id/feature', authenticate, testimonialController.featureTestimonial);

export default router; 