import express, { Request, Response } from 'express';
import { getSiteStats } from '../controllers/statsController';

const router = express.Router();

router.get('/', (req: Request, res: Response) => getSiteStats(req, res));

export default router; 