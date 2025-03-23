import { Router } from 'express';
import multer from 'multer';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const multerUpload = multer({ dest: 'uploads/' });

// Public routes
router.get('/user/:userId', projectController.getProjectsByUser);
router.get('/:id', projectController.getProjectById);

// Protected routes - require authentication
router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.post('/', authenticateToken, projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// File upload routes
router.post('/:id/:field/:index/media', multerUpload.single('media'), projectController.uploadFieldMedia);

// Project image upload route
router.post('/:id/image', upload.single('image'), projectController.uploadProjectImage);

export default router; 