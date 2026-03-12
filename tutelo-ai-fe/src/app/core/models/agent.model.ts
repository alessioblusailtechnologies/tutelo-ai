export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  icon_bg: string;
  trigger_type: 'scheduled' | 'message' | 'manual';
  trigger_label: string;
  status: 'running' | 'paused' | 'draft';
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
}

export interface AgentLogEntry {
  id: string;
  agent_id: string;
  agent_name: string;
  icon: string;
  icon_bg: string;
  detail: string;
  result: 'ok' | 'warn' | 'error';
  result_label: string;
  executed_at: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  trigger_type: 'scheduled' | 'message' | 'manual';
  trigger_label?: string;
  instructions?: string;
  output_channels?: string[];
  steps?: { text: string; tag: string; tag_type: 'fetch' | 'filter' | 'action' | 'notify' }[];
}
