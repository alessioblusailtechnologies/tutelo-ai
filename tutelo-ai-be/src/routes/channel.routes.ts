import { Router } from 'express';
import { channelController } from '../controllers/channel.controller.js';
import { channelOAuthController } from '../controllers/channel-oauth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createChannelSchema, updateChannelSchema } from '../validators/channel.validators.js';

const router = Router();

// OAuth callbacks (public — state carries user info)
router.get('/oauth/google/callback', channelOAuthController.googleCallback);
router.get('/oauth/microsoft/callback', channelOAuthController.microsoftCallback);

// All other routes require auth
router.use(authMiddleware);

// OAuth start (requires auth to embed user id in state)
router.get('/oauth/google/url', channelOAuthController.googleAuthUrl);
router.get('/oauth/microsoft/url', channelOAuthController.microsoftAuthUrl);

// CRUD
router.get('/', channelController.list);
router.post('/', validate(createChannelSchema, 'body'), channelController.create);
router.get('/:id', channelController.getById);
router.patch('/:id', validate(updateChannelSchema, 'body'), channelController.update);
router.delete('/:id', channelController.remove);

export default router;
