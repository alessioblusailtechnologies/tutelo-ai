export interface AiAction {
  type: 'urgent' | 'info' | 'warn' | 'soft';
  typeLabel: string;
  title: string;
  description: string;
  primaryButton: {
    label: string;
    color?: string;
  };
  secondaryButton: {
    label: string;
  };
}
