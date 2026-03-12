import { Injectable, signal } from '@angular/core';
import { AiAction } from '../models/ai-action.model';

@Injectable({ providedIn: 'root' })
export class AiActionsService {
  readonly actions = signal<AiAction[]>([
    {
      type: 'urgent',
      typeLabel: 'Sinistro · Urgente',
      title: 'Aprire sinistro per Santini',
      description: 'WhatsApp alle 08:52 — incidente in Via Roma. Targa e polizza già identificate.',
      primaryButton: { label: '⚡ Apri Sinistro', color: '#C0392B' },
      secondaryButton: { label: 'Vedi msg' }
    },
    {
      type: 'info',
      typeLabel: 'Preventivo · Nuovo',
      title: 'Creare preventivo per Marchetti',
      description: 'Email con richiesta preventivo auto (Fiat 500, 2019). Dati cliente in archivio.',
      primaryButton: { label: 'Crea Preventivo' },
      secondaryButton: { label: 'Ignora' }
    },
    {
      type: 'warn',
      typeLabel: 'Rinnovo · Scadenza',
      title: 'Confermare rinnovo Ferrero',
      description: 'Luca Ferrero ha confermato via email. Polizza in scadenza tra 8 giorni.',
      primaryButton: { label: 'Avvia Rinnovo', color: '#E08A00' },
      secondaryButton: { label: 'Posticipa' }
    },
    {
      type: 'soft',
      typeLabel: 'Richiesta · Follow-up',
      title: 'Rispondere a Colombo (3gg)',
      description: 'Anna Colombo attende risposta da 3 giorni. Bozza AI pronta all\'invio.',
      primaryButton: { label: 'Invia bozza AI', color: '#1A7A4A' },
      secondaryButton: { label: 'Modifica' }
    }
  ]);
}
