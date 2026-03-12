import { supabaseAdmin } from '../config/supabase.js';
import type { AgentLog } from '../types/agent.types.js';

const TABLE = 'tutelo_agent_logs';

export const agentLogRepository = {
  async findByUserId(userId: string, limit = 20): Promise<AgentLog[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AgentLog[];
  },

  async findByAgentId(agentId: string, userId: string, limit = 20): Promise<AgentLog[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AgentLog[];
  },

  async create(log: Omit<AgentLog, 'id' | 'created_at'>): Promise<AgentLog> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data as AgentLog;
  },
};
