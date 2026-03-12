import { Router } from 'express';
import { agentController } from '../controllers/agent.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAgentSchema, updateAgentSchema } from '../validators/agent.validators.js';

const router = Router();

router.use(authMiddleware);

router.get('/', agentController.list);
router.post('/', validate(createAgentSchema, 'body'), agentController.create);
router.get('/logs', agentController.getAllLogs);
router.get('/:id', agentController.getById);
router.patch('/:id', validate(updateAgentSchema, 'body'), agentController.update);
router.delete('/:id', agentController.remove);
router.get('/:id/steps', agentController.getSteps);
router.get('/:id/logs', agentController.getLogs);

export default router;
