import { Injectable, signal, computed } from '@angular/core';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class InboxService {
  private readonly messages = signal<Message[]>([
    {
      id: 1,
      from: 'Roberto Santini',
      email: 'roberto.santini@gmail.com',
      subject: 'Incidente stamattina — urgente',
      source: 'email',
      time: '08:52',
      tag: 'sinistro',
      tagLabel: 'Sinistro',
      unread: true,
      priority: 'high',
      priorityLabel: 'Urgente',
      body: `Buongiorno, stamattina intorno alle 8:30 ho avuto un incidente in Via Roma all'incrocio con Via Mazzini. Ho tamponato il veicolo davanti a me, una Volkswagen Golf. I danni alla mia Fiat Bravo (targa EK 482 PL) sembrano importanti — il cofano è ammaccato e il radiatore potrebbe essere danneggiato.<br><br>Ho già scattato le foto e ho i dati dell'altro conducente. Cosa devo fare adesso? La mia polizza è la XK-4421-RS. Attendo istruzioni urgenti.`,
      aiAnalysis: {
        summary: `Il cliente segnala un <strong>incidente stradale questa mattina</strong>. Ha tamponato un altro veicolo in Via Roma, Milano. Ha già <strong>foto e dati del terzo</strong> pronti. La polizza <strong>XK-4421-RS</strong> risulta attiva e copre RC Auto.`,
        confidence: 'alta',
        generationTime: '0.8s',
        entities: [
          { label: 'Cliente', value: 'R. Santini' },
          { label: 'Polizza', value: 'XK-4421-RS' },
          { label: 'Targa', value: 'EK 482 PL' },
          { label: 'Data', value: '12 Mar 08:30' },
          { label: 'Luogo', value: 'Via Roma, MI' },
          { label: 'Tipo', value: 'Sinistro', color: 'var(--tag-sinistro)' }
        ],
        actions: [
          {
            icon: '📋',
            iconBg: 'var(--blue)',
            title: 'Apri Pratica Sinistro',
            description: 'Pre-compilata con tutti i dati estratti. Pronta in un click.',
            buttonLabel: 'Apri',
            buttonType: 'blue',
            isPrimary: true
          },
          {
            icon: '📞',
            iconBg: '#FDECEA',
            title: 'Invia istruzioni sinistro via WhatsApp',
            description: 'AI ha preparato il messaggio con i passi da seguire (CID, CAI, foto).',
            buttonLabel: 'Invia',
            buttonType: 'ghost'
          },
          {
            icon: '🏢',
            iconBg: '#E8F6EF',
            title: 'Notifica compagnia assicurativa',
            description: 'Invia denuncia preliminare a Generali con i dati estratti.',
            buttonLabel: 'Notifica',
            buttonType: 'ghost'
          }
        ]
      }
    },
    {
      id: 2,
      from: 'Giulia Marchetti',
      subject: 'Richiesta preventivo auto',
      source: 'email',
      time: '09:14',
      tag: 'nuovo',
      tagLabel: '● Da classificare',
      unread: true,
      aiBadge: 'Preventivo?'
    },
    {
      id: 3,
      from: 'Luca Ferrero',
      subject: 'Conferma rinnovo polizza casa',
      source: 'whatsapp',
      time: 'Ieri',
      tag: 'rinnovo',
      tagLabel: 'Rinnovo',
      unread: true
    },
    {
      id: 4,
      from: 'Anna Colombo',
      subject: 'Preventivo polizza vita familiare',
      source: 'email',
      time: 'Ieri',
      tag: 'preventivo',
      tagLabel: 'Preventivo',
      priority: 'med',
      priorityLabel: '3gg fa',
      unread: false
    },
    {
      id: 5,
      from: 'Teresa Mancini',
      subject: 'RC professionale studio medico',
      source: 'email',
      time: 'Mar 10',
      tag: 'preventivo',
      tagLabel: 'Preventivo',
      unread: false
    },
    {
      id: 6,
      from: 'Davide Rizzo',
      subject: 'Scadenza polizza auto — conferma?',
      source: 'whatsapp',
      time: 'Mar 10',
      tag: 'rinnovo',
      tagLabel: 'Rinnovo',
      unread: false
    },
    {
      id: 7,
      from: 'Mario Bianchi',
      subject: 'Documenti allegati — sinistro #089',
      source: 'email',
      time: 'Mar 9',
      tag: 'richiesta',
      tagLabel: 'Richiesta',
      unread: false
    }
  ]);

  private readonly selectedMessageId = signal<number>(1);

  readonly allMessages = this.messages.asReadonly();

  readonly selectedMessage = computed(() => {
    return this.messages().find(m => m.id === this.selectedMessageId()) ?? null;
  });

  readonly filterTabs = signal([
    { label: 'Tutti (12)', value: 'all', active: true },
    { label: 'Non letti (4)', value: 'unread', active: false },
    { label: 'Sinistri', value: 'sinistri', active: false },
    { label: 'Rinnovi', value: 'rinnovi', active: false }
  ]);

  selectMessage(id: number): void {
    this.selectedMessageId.set(id);
  }

  setActiveFilter(value: string): void {
    this.filterTabs.update(tabs =>
      tabs.map(t => ({ ...t, active: t.value === value }))
    );
  }
}
