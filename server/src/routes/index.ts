import { Router } from 'express';
import authRoutes from './auth';
import postRoutes from './postRoutes';
import projectRoutes from './projectRoutes';
import articleRoutes from './articleRoutes';
import likeRoutes from './likeRoutes';
import followRoutes from './followRoutes';
import watchRoutes from './watchRoutes';
import userRoutes from './userRoutes';
import commentRoutes from './commentRoutes';
import statsRoutes from './statsRoutes';

const router = Router();

router.use('/comments', commentRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/projects', projectRoutes);
router.use('/articles', articleRoutes);
router.use('/likes', likeRoutes);
router.use('/follows', followRoutes);
router.use('/watches', watchRoutes);
router.use('/user', userRoutes);
router.use('/stats', statsRoutes);

export default router; 