import { Router } from 'express';
import authRoutes from './auth';
import postRoutes from './postRoutes';
import projectRoutes from './projectRoutes';
import articleRoutes from './articleRoutes';
import likeRoutes from './likeRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/projects', projectRoutes);
router.use('/articles', articleRoutes);
router.use('/likes', likeRoutes);
router.use('/user', userRoutes);

export default router; 