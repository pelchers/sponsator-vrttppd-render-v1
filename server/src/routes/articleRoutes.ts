import express from 'express';
import multer from 'multer';
import { articleController } from '../controllers/articleController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middleware/upload';

const router = express.Router();
const uploadMulter = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticle);

// Check that articleController.createArticle exists
console.log('createArticle exists:', !!articleController.createArticle);

// Protected routes
router.post('/', authenticate, articleController.createArticle);
router.put('/:id', authenticate, articleController.updateArticle);
router.delete('/:id', authenticate, articleController.deleteArticle);
router.post('/:id/media', authenticate, uploadMulter.single('file'), articleController.uploadArticleMedia);
router.post('/:id/cover-image', authenticate, upload.single('image'), articleController.uploadCoverImage);

export default router; 