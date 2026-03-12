import { Request, Response, NextFunction } from 'express';
import { agentService } from '../services/agent.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/api-response.js';
import type { CreateAgentDto, UpdateAgentDto } from '../types/agent.types.js';

export const agentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await agentService.list(req.user!.id);
      sendSuccess(res, agents);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const agent = await agentService.getById(id, req.user!.id);
      sendSuccess(res, agent);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateAgentDto;
      const agent = await agentService.create(req.user!.id, dto);
      sendCreated(res, agent);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as UpdateAgentDto;
      const id = req.params.id as string;
      const agent = await agentService.update(id, req.user!.id, dto);
      sendSuccess(res, agent);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await agentService.remove(id, req.user!.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },

  async getSteps(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const steps = await agentService.getSteps(id);
      sendSuccess(res, steps);
    } catch (err) {
      next(err);
    }
  },

  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.params.id as string;
      const logs = await agentService.getLogs(req.user!.id, agentId);
      sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  },

  async getAllLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await agentService.getLogs(req.user!.id);
      sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  },
};
