export type AgentStatus = 'running' | 'paused' | 'draft';
export type AgentTriggerType = 'scheduled' | 'message' | 'manual';
export type AiProvider = 'claude' | 'openai';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  icon_bg: string;
  trigger_type: AgentTriggerType;
  trigger_label: string;
  status: AgentStatus;
  ai_provider: AiProvider;
  ai_model: string;
  instructions: string | null;
  output_channels: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentStep {
  id: string;
  agent_id: string;
  step_number: number;
  text: string;
  tag: string;
  tag_type: 'fetch' | 'filter' | 'action' | 'notify';
  created_at: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  icon?: string;
  icon_bg?: string;
  trigger_type: AgentTriggerType;
  trigger_label?: string;
  instructions?: string;
  ai_provider?: AiProvider;
  ai_model?: string;
  output_channels?: string[];
  steps?: CreateAgentStepDto[];
}

export interface UpdateAgentDto {
  name?: string;
  description?: string;
  icon?: string;
  icon_bg?: string;
  trigger_type?: AgentTriggerType;
  trigger_label?: string;
  status?: AgentStatus;
  instructions?: string;
  ai_provider?: AiProvider;
  ai_model?: string;
  output_channels?: string[];
}

export interface CreateAgentStepDto {
  text: string;
  tag: string;
  tag_type: 'fetch' | 'filter' | 'action' | 'notify';
}

export interface AgentLog {
  id: string;
  agent_id: string;
  user_id: string;
  agent_name: string;
  icon: string;
  icon_bg: string;
  detail: string;
  result: 'ok' | 'warn' | 'error';
  result_label: string;
  executed_at: string;
  created_at: string;
}
