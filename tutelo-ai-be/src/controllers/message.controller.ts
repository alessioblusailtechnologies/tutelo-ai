import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/api-response.js';
import type { CreateMessageDto, UpdateMessageDto } from '../types/message.types.js';

export const messageController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await messageService.list(req.user!.id);
      sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const message = await messageService.getById(id, req.user!.id);
      sendSuccess(res, message);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateMessageDto;
      const message = await messageService.create(req.user!.id, dto);
      sendCreated(res, message);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateMessageDto;
      const message = await messageService.update(id, req.user!.id, dto);
      sendSuccess(res, message);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await messageService.remove(id, req.user!.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },

  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const analysis = await messageService.getAnalysis(id);
      sendSuccess(res, analysis);
    } catch (err) {
      next(err);
    }
  },

  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const analysis = await messageService.analyzeMessage(id, req.user!.id);
      sendCreated(res, analysis);
    } catch (err) {
      next(err);
    }
  },
};
