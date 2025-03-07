import { Router } from 'express';
import multer from 'multer';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/user/:userId', projectController.getProjectsByUser);
router.get('/:id', projectController.getProjectById);

// Protected routes - require authentication
router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// File upload routes
router.post('/:id/image', upload.single('image'), projectController.uploadProjectImage);
router.post('/:id/:field/:index/media', upload.single('media'), projectController.uploadFieldMedia);

export default router; 