import { supabaseAdmin } from '../config/supabase.js';
import type { AiAction } from '../types/ai-action.types.js';

const TABLE = 'tutelo_ai_actions';

export const aiActionRepository = {
  async findAllByUserId(userId: string): Promise<AiAction[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AiAction[];
  },

  async create(action: Omit<AiAction, 'id' | 'created_at' | 'updated_at'>): Promise<AiAction> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(action)
      .select()
      .single();

    if (error) throw error;
    return data as AiAction;
  },

  async dismiss(id: string, userId: string): Promise<AiAction> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ is_dismissed: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as AiAction;
  },

  async complete(id: string, userId: string): Promise<AiAction> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ is_completed: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as AiAction;
  },
};
