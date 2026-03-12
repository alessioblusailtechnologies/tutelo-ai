import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/api-error.js';
import type { Channel, CreateChannelDto, UpdateChannelDto } from '../types/channel.types.js';

const TABLE = 'tutelo_channels';

export const channelRepository = {
  async findAllByUserId(userId: string): Promise<Channel[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Channel[];
  },

  async findByType(userId: string, type: string): Promise<Channel[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Channel[];
  },

  async findById(id: string, userId: string): Promise<Channel> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundError('Channel not found');
    return data as Channel;
  },

  async create(userId: string, dto: CreateChannelDto): Promise<Channel> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Channel;
  },

  async update(id: string, userId: string, dto: UpdateChannelDto): Promise<Channel> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Channel not found');
    return data as Channel;
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
