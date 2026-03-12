export interface AiAction {
  id: string;
  type: 'urgent' | 'info' | 'warn' | 'soft';
  type_label: string;
  title: string;
  description: string;
  primary_button_label: string;
  primary_button_color: string | null;
  secondary_button_label: string;
  is_dismissed: boolean;
  is_completed: boolean;
  created_at: string;
}
