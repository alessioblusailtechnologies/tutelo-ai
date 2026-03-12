import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/api-error.js';
import type { Message, CreateMessageDto, UpdateMessageDto } from '../types/message.types.js';

const TABLE = 'tutelo_messages';

export const messageRepository = {
  async findAllByUserId(userId: string): Promise<Message[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('received_at', { ascending: false });

    if (error) throw error;
    return data as Message[];
  },

  async findById(id: string, userId: string): Promise<Message> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundError('Message not found');
    return data as Message;
  },

  async create(userId: string, dto: CreateMessageDto): Promise<Message> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  },

  async update(id: string, userId: string, dto: UpdateMessageDto): Promise<Message> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Message not found');
    return data as Message;
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
