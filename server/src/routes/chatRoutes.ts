import express from 'express';
import * as chatController from '../controllers/chatController';
import * as messageController from '../controllers/messageController';
import * as permissionController from '../controllers/permissionController';
import { authenticate } from '../middlewares/auth';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Chat routes
router.get('/', authenticate, chatController.getUserChats);
router.post('/', authenticate, chatController.createChat);
router.get('/:id', authenticate, chatController.getChatById);
router.put('/:id', authenticate, chatController.updateChat);
router.delete('/:id', authenticate, chatController.deleteChat);
router.post('/:id/leave', authenticate, chatController.leaveChat);

// Message routes
router.get('/:id/messages', authenticate, messageController.getChatMessages);
router.post('/:id/messages', authenticate, upload.single('media'), messageController.sendMessage);
router.put('/:id/messages/:messageId', authenticate, messageController.editMessage);
router.delete('/:id/messages/:messageId', authenticate, messageController.deleteMessage);
router.post('/:id/messages/:messageId/pin', authenticate, messageController.pinMessage);
router.delete('/:id/messages/:messageId/pin', authenticate, messageController.unpinMessage);

// Participant routes
router.post('/:id/participants', authenticate, chatController.addParticipant);
router.put('/:id/participants/:userId', authenticate, chatController.updateParticipantRole);
router.delete('/:id/participants/:userId', authenticate, chatController.removeParticipant);

// Permission routes
router.get('/:id/permissions', authenticate, permissionController.getUserChatPermissions);

export default router; 