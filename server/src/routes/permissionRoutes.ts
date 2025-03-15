import express from 'express';
import * as permissionController from '../controllers/permissionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/chat-roles', authenticate, permissionController.getChatRoles);
router.get('/chat-permissions', authenticate, permissionController.getChatPermissions);

export default router; 