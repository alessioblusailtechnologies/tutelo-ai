export interface Message {
  id: number;
  from: string;
  email?: string;
  subject: string;
  source: 'email' | 'whatsapp';
  time: string;
  tag: 'sinistro' | 'preventivo' | 'rinnovo' | 'richiesta' | 'nuovo';
  tagLabel: string;
  unread: boolean;
  priority?: 'high' | 'med';
  priorityLabel?: string;
  aiBadge?: string;
  body?: string;
  aiAnalysis?: AiAnalysis;
}

export interface AiAnalysis {
  summary: string;
  confidence: string;
  generationTime: string;
  entities: AiEntity[];
  actions: AiProposedAction[];
}

export interface AiEntity {
  label: string;
  value: string;
  color?: string;
}

export interface AiProposedAction {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonType: 'blue' | 'ghost';
  isPrimary?: boolean;
}
