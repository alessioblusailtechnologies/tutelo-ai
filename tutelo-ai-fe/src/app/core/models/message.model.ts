export interface Message {
  id: string;
  from_name: string;
  from_email: string | null;
  from_phone: string | null;
  subject: string;
  body: string;
  source: 'email' | 'whatsapp';
  tag: 'sinistro' | 'preventivo' | 'rinnovo' | 'richiesta' | 'nuovo';
  tag_label: string;
  is_read: boolean;
  priority: 'high' | 'med' | null;
  priority_label: string | null;
  ai_badge: string | null;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface AiAnalysis {
  id: string;
  message_id: string;
  summary: string;
  confidence: string;
  generation_time_ms: number;
  entities: AiEntity[];
  proposed_actions: AiProposedAction[];
  created_at: string;
}

export interface AiEntity {
  label: string;
  value: string;
  color?: string;
}

export interface AiProposedAction {
  icon: string;
  icon_bg: string;
  title: string;
  description: string;
  action_type: string;
}
