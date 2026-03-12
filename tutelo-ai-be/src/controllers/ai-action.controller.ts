import { Request, Response, NextFunction } from 'express';
import { aiActionService } from '../services/ai-action.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const aiActionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const actions = await aiActionService.list(req.user!.id);
      sendSuccess(res, actions);
    } catch (err) {
      next(err);
    }
  },

  async dismiss(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const action = await aiActionService.dismiss(id, req.user!.id);
      sendSuccess(res, action);
    } catch (err) {
      next(err);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const action = await aiActionService.complete(id, req.user!.id);
      sendSuccess(res, action);
    } catch (err) {
      next(err);
    }
  },
};
