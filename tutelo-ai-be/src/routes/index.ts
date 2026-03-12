import { Router } from 'express';
import authRoutes from './auth.routes.js';
import messageRoutes from './message.routes.js';
import agentRoutes from './agent.routes.js';
import aiActionRoutes from './ai-action.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/agents', agentRoutes);
router.use('/ai-actions', aiActionRoutes);

export default router;
