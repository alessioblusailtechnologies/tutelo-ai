import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/api-error.js';
import type { Agent, AgentStep, CreateAgentDto, UpdateAgentDto, CreateAgentStepDto } from '../types/agent.types.js';

const TABLE = 'tutelo_agents';
const STEPS_TABLE = 'tutelo_agent_steps';

export const agentRepository = {
  async findAllByUserId(userId: string): Promise<Agent[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Agent[];
  },

  async findById(id: string, userId: string): Promise<Agent> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundError('Agent not found');
    return data as Agent;
  },

  async create(userId: string, dto: CreateAgentDto): Promise<Agent> {
    const { steps, ...agentData } = dto;

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        ...agentData,
        user_id: userId,
        status: 'draft',
        ai_provider: agentData.ai_provider ?? 'openai',
        ai_model: agentData.ai_model ?? 'gpt-4o-mini',
        output_channels: agentData.output_channels ?? [],
      })
      .select()
      .single();

    if (error) throw error;

    const agent = data as Agent;

    if (steps?.length) {
      await this.createSteps(agent.id, steps);
    }

    return agent;
  },

  async update(id: string, userId: string, dto: UpdateAgentDto): Promise<Agent> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Agent not found');
    return data as Agent;
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async findStepsByAgentId(agentId: string): Promise<AgentStep[]> {
    const { data, error } = await supabaseAdmin
      .from(STEPS_TABLE)
      .select('*')
      .eq('agent_id', agentId)
      .order('step_number', { ascending: true });

    if (error) throw error;
    return data as AgentStep[];
  },

  async createSteps(agentId: string, steps: CreateAgentStepDto[]): Promise<AgentStep[]> {
    const rows = steps.map((step, i) => ({
      agent_id: agentId,
      step_number: i + 1,
      text: step.text,
      tag: step.tag,
      tag_type: step.tag_type,
    }));

    const { data, error } = await supabaseAdmin
      .from(STEPS_TABLE)
      .insert(rows)
      .select();

    if (error) throw error;
    return data as AgentStep[];
  },

  async deleteSteps(agentId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(STEPS_TABLE)
      .delete()
      .eq('agent_id', agentId);

    if (error) throw error;
  },
};
