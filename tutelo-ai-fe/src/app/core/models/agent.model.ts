export interface Agent {
  id: number;
  name: string;
  icon: string;
  iconBg: string;
  trigger: string;
  status: 'running' | 'paused' | 'draft';
  description: string;
  steps: AgentStep[];
  lastRun: string;
  lastRunDetail: string;
  isActive?: boolean;
}

export interface AgentStep {
  number: number;
  text: string;
  tag: string;
  tagType: 'fetch' | 'filter' | 'action' | 'notify';
}

export interface AgentLogEntry {
  icon: string;
  iconBg: string;
  agentName: string;
  detail: string;
  time: string;
  result: 'ok' | 'warn';
  resultLabel: string;
}

export interface NewAgentForm {
  name: string;
  instructions: string;
  trigger: 'scheduled' | 'message' | 'manual';
  channels: string[];
}
