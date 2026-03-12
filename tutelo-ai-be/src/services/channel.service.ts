import { channelRepository } from '../repositories/channel.repository.js';
import type { Channel, CreateChannelDto, UpdateChannelDto } from '../types/channel.types.js';

export const channelService = {
  async list(userId: string): Promise<Channel[]> {
    return channelRepository.findAllByUserId(userId);
  },

  async listByType(userId: string, type: string): Promise<Channel[]> {
    return channelRepository.findByType(userId, type);
  },

  async getById(id: string, userId: string): Promise<Channel> {
    return channelRepository.findById(id, userId);
  },

  async create(userId: string, dto: CreateChannelDto): Promise<Channel> {
    return channelRepository.create(userId, dto);
  },

  async update(id: string, userId: string, dto: UpdateChannelDto): Promise<Channel> {
    return channelRepository.update(id, userId, dto);
  },

  async remove(id: string, userId: string): Promise<void> {
    return channelRepository.remove(id, userId);
  },
};
