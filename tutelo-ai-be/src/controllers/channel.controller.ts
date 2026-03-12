import { Request, Response, NextFunction } from 'express';
import { channelService } from '../services/channel.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/api-response.js';
import type { CreateChannelDto, UpdateChannelDto } from '../types/channel.types.js';

export const channelController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const channels = type
        ? await channelService.listByType(req.user!.id, type)
        : await channelService.list(req.user!.id);
      sendSuccess(res, channels);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const channel = await channelService.getById(id, req.user!.id);
      sendSuccess(res, channel);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateChannelDto;
      const channel = await channelService.create(req.user!.id, dto);
      sendCreated(res, channel);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateChannelDto;
      const channel = await channelService.update(id, req.user!.id, dto);
      sendSuccess(res, channel);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await channelService.remove(id, req.user!.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },
};
