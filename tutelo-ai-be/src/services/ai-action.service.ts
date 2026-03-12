import { aiActionRepository } from '../repositories/ai-action.repository.js';
import type { AiAction } from '../types/ai-action.types.js';

export const aiActionService = {
  async list(userId: string): Promise<AiAction[]> {
    return aiActionRepository.findAllByUserId(userId);
  },

  async dismiss(id: string, userId: string): Promise<AiAction> {
    return aiActionRepository.dismiss(id, userId);
  },

  async complete(id: string, userId: string): Promise<AiAction> {
    return aiActionRepository.complete(id, userId);
  },
};
