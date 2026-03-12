import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/register', validate(registerSchema, 'body'), authController.register);
router.post('/login', validate(loginSchema, 'body'), authController.login);

router.use(authMiddleware);

router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.patch('/profile', validate(updateProfileSchema, 'body'), authController.updateProfile);

export default router;
