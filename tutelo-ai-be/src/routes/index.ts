import { Router } from 'express';
import authRoutes from './auth.routes.js';
import messageRoutes from './message.routes.js';
import agentRoutes from './agent.routes.js';
import aiActionRoutes from './ai-action.routes.js';
import channelRoutes from './channel.routes.js';
import praticaRoutes from './pratica.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/agents', agentRoutes);
router.use('/ai-actions', aiActionRoutes);
router.use('/channels', channelRoutes);
router.use('/pratiche', praticaRoutes);

export default router;
