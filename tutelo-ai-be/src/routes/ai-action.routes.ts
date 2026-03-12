import { Router } from 'express';
import { aiActionController } from '../controllers/ai-action.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', aiActionController.list);
router.post('/:id/dismiss', aiActionController.dismiss);
router.post('/:id/complete', aiActionController.complete);

export default router;
