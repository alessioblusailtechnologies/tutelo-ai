export type PraticaType = 'preventivo' | 'sinistro' | 'rinnovo' | 'richiesta_documenti' | 'appuntamento' | 'aggiornamento_polizza';
export type PraticaStatus = 'aperta' | 'in_lavorazione' | 'in_attesa' | 'completata' | 'annullata';
export type PraticaPriority = 'high' | 'med' | 'low';
export type ArtifactType = 'preventivo_bozza' | 'denuncia_sinistro' | 'proposta_rinnovo' | 'richiesta_documenti' | 'lettera' | 'altro';

export interface Pratica {
  id: string;
  type: PraticaType;
  status: PraticaStatus;
  title: string;
  description: string;
  priority: PraticaPriority;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  message_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PraticaNote {
  id: string;
  pratica_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface PraticaArtifact {
  id: string;
  pratica_id: string;
  type: ArtifactType;
  title: string;
  content: string;
  ai_model: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePraticaDto {
  type: PraticaType;
  title: string;
  description?: string;
  priority?: PraticaPriority;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  message_id?: string;
  generate_artifact?: boolean;
}

export const PRATICA_TYPE_LABELS: Record<PraticaType, string> = {
  preventivo: 'Preventivo',
  sinistro: 'Sinistro',
  rinnovo: 'Rinnovo',
  richiesta_documenti: 'Richiesta Documenti',
  appuntamento: 'Appuntamento',
  aggiornamento_polizza: 'Aggiornamento Polizza',
};

export const PRATICA_STATUS_LABELS: Record<PraticaStatus, string> = {
  aperta: 'Aperta',
  in_lavorazione: 'In lavorazione',
  in_attesa: 'In attesa',
  completata: 'Completata',
  annullata: 'Annullata',
};

export const PRATICA_TYPE_ICONS: Record<PraticaType, string> = {
  preventivo: '📋',
  sinistro: '⚠️',
  rinnovo: '🔄',
  richiesta_documenti: '📄',
  appuntamento: '📅',
  aggiornamento_polizza: '✏️',
};
