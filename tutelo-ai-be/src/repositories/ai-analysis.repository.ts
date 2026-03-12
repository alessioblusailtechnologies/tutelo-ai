import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/api-error.js';
import type { AiAnalysis } from '../types/message.types.js';

const TABLE = 'tutelo_ai_analyses';

export const aiAnalysisRepository = {
  async findByMessageId(messageId: string): Promise<AiAnalysis | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as AiAnalysis | null;
  },

  async create(analysis: Omit<AiAnalysis, 'id' | 'created_at'>): Promise<AiAnalysis> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(analysis)
      .select()
      .single();

    if (error) throw error;
    return data as AiAnalysis;
  },
};
