import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/api-response.js';
import type { RegisterDto, LoginDto, UpdateProfileDto } from '../types/auth.types.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as RegisterDto;
      const result = await authService.register(dto);
      sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as LoginDto;
      const result = await authService.login(dto);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as UpdateProfileDto;
      const profile = await authService.updateProfile(req.user!.id, dto);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};
