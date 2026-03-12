import { Request, Response, NextFunction } from 'express';
import { praticaService } from '../services/pratica.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const praticaController = {
  // ─── Pratiche CRUD ─────────────────────────────────
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.list(req.user!.id);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.getById(req.params.id as string, req.user!.id);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.create(req.user!.id, req.body);
      sendSuccess(res, data, 201);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.update(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await praticaService.remove(req.params.id as string, req.user!.id);
      sendSuccess(res, null);
    } catch (err) { next(err); }
  },

  // ─── Notes ─────────────────────────────────────────
  async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.getNotes(req.params.id as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.addNote(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, data, 201);
    } catch (err) { next(err); }
  },

  async removeNote(req: Request, res: Response, next: NextFunction) {
    try {
      await praticaService.removeNote(req.params.noteId as string, req.user!.id);
      sendSuccess(res, null);
    } catch (err) { next(err); }
  },

  // ─── Artifacts ─────────────────────────────────────
  async getArtifacts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.getArtifacts(req.params.id as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async generateArtifact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.generateNewArtifact(
        req.params.id as string, req.user!.id,
        req.body.type, req.body.title, req.body.prompt,
      );
      sendSuccess(res, data, 201);
    } catch (err) { next(err); }
  },

  async updateArtifact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await praticaService.updateArtifact(req.params.artifactId as string, req.body.content);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async removeArtifact(req: Request, res: Response, next: NextFunction) {
    try {
      await praticaService.removeArtifact(req.params.artifactId as string);
      sendSuccess(res, null);
    } catch (err) { next(err); }
  },
};
