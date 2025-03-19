import express from 'express';
import { getFeaturedContent } from '../controllers/featuredController';

const router = express.Router();

router.get('/', getFeaturedContent);

export default router; 