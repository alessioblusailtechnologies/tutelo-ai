export type AiActionType = 'urgent' | 'info' | 'warn' | 'soft';

export interface AiAction {
  id: string;
  user_id: string;
  message_id: string | null;
  type: AiActionType;
  type_label: string;
  title: string;
  description: string;
  primary_button_label: string;
  primary_button_color: string | null;
  secondary_button_label: string;
  action_type: string | null;
  from_name: string | null;
  from_email: string | null;
  from_phone: string | null;
  is_dismissed: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
