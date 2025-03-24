import express from 'express';
import * as postController from '../controllers/postController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Protected routes (require authentication)
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/comment', authenticate, postController.commentOnPost);

// Add the cover image upload route
router.post(
  '/:id/cover-image',
  authenticate,
  upload.single('image'),
  postController.uploadCoverImage
);

export default router; 