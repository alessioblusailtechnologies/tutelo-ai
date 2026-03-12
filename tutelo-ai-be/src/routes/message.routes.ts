import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createMessageSchema, updateMessageSchema } from '../validators/message.validators.js';

const router = Router();

router.use(authMiddleware);

router.get('/', messageController.list);
router.post('/', validate(createMessageSchema, 'body'), messageController.create);
router.get('/:id', messageController.getById);
router.patch('/:id', validate(updateMessageSchema, 'body'), messageController.update);
router.delete('/:id', messageController.remove);
router.get('/:id/analysis', messageController.getAnalysis);
router.post('/:id/analyze', messageController.analyze);

export default router;
