import express from 'express';
import multer from 'multer';
import { articleController } from '../controllers/articleController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticle);

// Check that articleController.createArticle exists
console.log('createArticle exists:', !!articleController.createArticle);

// Protected routes
router.post('/', authenticate, articleController.createArticle);
router.put('/:id', authenticate, articleController.updateArticle);
router.delete('/:id', authenticate, articleController.deleteArticle);
router.post('/:id/media', authenticate, upload.single('file'), articleController.uploadArticleMedia);

export default router; 