import express from 'express';
import multer from 'multer';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Get all projects (public)
router.get('/', projectController.getProjects);

// Get projects by user ID (public)
router.get('/user/:userId', projectController.getProjectsByUser);

// Get project by ID (public)
router.get('/:id', projectController.getProjectById);

// Protected routes (require authentication)
// Create new project
router.post('/', authenticate, projectController.createProject);

// Update project
router.put('/:id', authenticate, projectController.updateProject);

// Delete project
router.delete('/:id', authenticate, projectController.deleteProject);

// Upload project image
router.post('/:id/image', authenticate, upload.single('image'), projectController.uploadProjectImage);

export default router; 