import { Injectable, signal } from '@angular/core';
import { Agent, AgentLogEntry, NewAgentForm } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentsService {
  readonly agents = signal<Agent[]>([
    {
      id: 1,
      name: 'Reminder Rinnovi',
      icon: '📅',
      iconBg: '#EBF2FF',
      trigger: '⏰ Ogni giorno alle 08:00',
      status: 'running',
      description: 'Trova tutti i clienti con polizza in scadenza entro 30 giorni e invia automaticamente un\'email di reminder personalizzata.',
      isActive: true,
      steps: [
        { number: 1, text: 'Cerca polizze in scadenza ≤ 30 giorni', tag: 'Fetch', tagType: 'fetch' },
        { number: 2, text: 'Filtra per agente assegnato', tag: 'Filtro', tagType: 'filter' },
        { number: 3, text: 'Invia email reminder personalizzata', tag: 'Email', tagType: 'action' },
        { number: 4, text: 'Se no risposta → apri pratica Rinnovo', tag: 'Pratica', tagType: 'notify' }
      ],
      lastRun: 'oggi 08:01',
      lastRunDetail: '7 email'
    },
    {
      id: 2,
      name: 'Triage Sinistri',
      icon: '⚡',
      iconBg: '#FDECEA',
      trigger: '⚡ Ad ogni messaggio',
      status: 'running',
      description: 'Monitora inbox e WhatsApp. Quando rileva un sinistro, estrae i dati chiave, crea la pratica e notifica l\'agente.',
      steps: [
        { number: 1, text: 'Leggi nuovo messaggio in arrivo', tag: 'Inbox', tagType: 'fetch' },
        { number: 2, text: 'Classifica se è un sinistro', tag: 'AI', tagType: 'filter' },
        { number: 3, text: 'Estrai dati: targa, polizza, luogo', tag: 'Estrai', tagType: 'filter' },
        { number: 4, text: 'Crea pratica + notifica agente', tag: 'Crea', tagType: 'action' }
      ],
      lastRun: 'oggi 08:52',
      lastRunDetail: '1 sinistro'
    },
    {
      id: 3,
      name: 'Follow-up Preventivi',
      icon: '📊',
      iconBg: '#F3EEF9',
      trigger: '⏰ Ogni 3 giorni',
      status: 'running',
      description: 'Verifica i preventivi senza risposta da più di 3 giorni e invia un follow-up via WhatsApp o email in base al canale preferito.',
      steps: [
        { number: 1, text: 'Cerca preventivi aperti senza risposta', tag: 'Fetch', tagType: 'fetch' },
        { number: 2, text: 'Controlla canale preferito cliente', tag: 'Profilo', tagType: 'filter' },
        { number: 3, text: 'Invia follow-up personalizzato', tag: 'Invia', tagType: 'action' }
      ],
      lastRun: 'ieri',
      lastRunDetail: '4 follow-up'
    },
    {
      id: 4,
      name: 'Report Settimanale',
      icon: '📈',
      iconBg: '#E8F6EF',
      trigger: '⏰ Ogni lunedì 07:30',
      status: 'paused',
      description: 'Genera e invia ogni lunedì un riepilogo settimanale con pratiche, sinistri, rinnovi imminenti e KPI dell\'agenzia.',
      steps: [
        { number: 1, text: 'Aggrega dati settimana precedente', tag: 'Dati', tagType: 'fetch' },
        { number: 2, text: 'Genera report con AI', tag: 'AI', tagType: 'filter' },
        { number: 3, text: 'Invia report all\'agente principale', tag: 'Email', tagType: 'action' }
      ],
      lastRun: 'Lun 10 Mar',
      lastRunDetail: 'In pausa'
    }
  ]);

  readonly logEntries = signal<AgentLogEntry[]>([
    {
      icon: '📅',
      iconBg: '#EBF2FF',
      agentName: 'Reminder Rinnovi',
      detail: '7 clienti trovati, 7 email inviate con successo',
      time: 'Oggi 08:01',
      result: 'ok',
      resultLabel: '✓ OK'
    },
    {
      icon: '⚡',
      iconBg: '#FDECEA',
      agentName: 'Triage Sinistri',
      detail: 'Sinistro rilevato da Roberto Santini, pratica SIN-2025-003 creata',
      time: 'Oggi 08:52',
      result: 'ok',
      resultLabel: '✓ OK'
    },
    {
      icon: '📊',
      iconBg: '#F3EEF9',
      agentName: 'Follow-up Preventivi',
      detail: '4 preventivi senza risposta, 4 messaggi inviati (2 email, 2 WA)',
      time: 'Ieri 15:00',
      result: 'ok',
      resultLabel: '✓ OK'
    },
    {
      icon: '📅',
      iconBg: '#EBF2FF',
      agentName: 'Reminder Rinnovi',
      detail: 'Luca Ferrero ha già risposto, email non inviata (evitato duplicato)',
      time: 'Ieri 08:01',
      result: 'warn',
      resultLabel: '⚠ Skip'
    }
  ]);

  readonly modalSteps = signal<string[]>([
    'Cerca polizze con scadenza ≤ 30 giorni nel gestionale',
    'Filtra per agente assegnato: Marco Pellegrini',
    'Genera email di reminder personalizzata per ogni cliente',
    'Invia email e registra l\'invio nella pratica',
    'Se nessuna risposta dopo 5 giorni → apri pratica Rinnovo'
  ]);

  createAgent(form: NewAgentForm): void {
    console.log('Creating agent:', form);
  }
}
