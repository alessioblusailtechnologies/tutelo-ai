export type MessageSource = 'email' | 'whatsapp';
export type MessageTag = 'sinistro' | 'preventivo' | 'rinnovo' | 'richiesta' | 'nuovo';
export type MessagePriority = 'high' | 'med' | null;

export interface Message {
  id: string;
  user_id: string;
  from_name: string;
  from_email: string | null;
  from_phone: string | null;
  subject: string;
  body: string;
  source: MessageSource;
  tag: MessageTag;
  tag_label: string;
  priority: MessagePriority;
  priority_label: string | null;
  is_read: boolean;
  ai_badge: string | null;
  external_id: string | null;
  channel_id: string | null;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageDto {
  from_name: string;
  from_email?: string;
  from_phone?: string;
  subject: string;
  body: string;
  source: MessageSource;
  tag?: MessageTag;
  priority?: MessagePriority;
  external_id?: string;
  channel_id?: string;
}

export interface UpdateMessageDto {
  tag?: MessageTag;
  tag_label?: string;
  priority?: MessagePriority;
  priority_label?: string;
  is_read?: boolean;
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
