import { agentRepository } from '../repositories/agent.repository.js';
import { agentLogRepository } from '../repositories/agent-log.repository.js';
import type { Agent, AgentStep, AgentLog, CreateAgentDto, UpdateAgentDto } from '../types/agent.types.js';

export const agentService = {
  async list(userId: string): Promise<Agent[]> {
    return agentRepository.findAllByUserId(userId);
  },

  async getById(id: string, userId: string): Promise<Agent> {
    return agentRepository.findById(id, userId);
  },

  async create(userId: string, dto: CreateAgentDto): Promise<Agent> {
    return agentRepository.create(userId, dto);
  },

  async update(id: string, userId: string, dto: UpdateAgentDto): Promise<Agent> {
    return agentRepository.update(id, userId, dto);
  },

  async remove(id: string, userId: string): Promise<void> {
    return agentRepository.remove(id, userId);
  },

  async getSteps(agentId: string): Promise<AgentStep[]> {
    return agentRepository.findStepsByAgentId(agentId);
  },

  async getLogs(userId: string, agentId?: string): Promise<AgentLog[]> {
    if (agentId) {
      return agentLogRepository.findByAgentId(agentId, userId);
    }
    return agentLogRepository.findByUserId(userId);
  },
};
