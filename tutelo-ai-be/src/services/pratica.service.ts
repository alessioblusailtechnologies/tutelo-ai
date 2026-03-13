import { praticaRepository } from '../repositories/pratica.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { getAiProvider } from './ai/ai-provider.factory.js';
import type {
  Pratica, PraticaNote, PraticaArtifact, PraticaType, ArtifactType,
  CreatePraticaDto, UpdatePraticaDto, CreateNoteDto,
} from '../types/pratica.types.js';

// ─── Artifact type mapping ───────────────────────────

const TYPE_TO_ARTIFACT: Record<PraticaType, ArtifactType> = {
  preventivo: 'preventivo_bozza',
  sinistro: 'denuncia_sinistro',
  rinnovo: 'proposta_rinnovo',
  richiesta_documenti: 'richiesta_documenti',
  appuntamento: 'lettera',
  aggiornamento_polizza: 'lettera',
};

const TYPE_TO_ARTIFACT_TITLE: Record<PraticaType, string> = {
  preventivo: 'Bozza Preventivo',
  sinistro: 'Denuncia Sinistro',
  rinnovo: 'Proposta di Rinnovo',
  richiesta_documenti: 'Richiesta Documentazione',
  appuntamento: 'Conferma Appuntamento',
  aggiornamento_polizza: 'Nota di Aggiornamento Polizza',
};

const ARTIFACT_PROMPTS: Record<PraticaType, string> = {
  preventivo: `Genera una bozza di preventivo assicurativo professionale in italiano.
Includi: intestazione, dati cliente, tipo copertura richiesta, garanzie proposte con massimali indicativi, premio annuale stimato, condizioni generali, note.
Formatta in modo chiaro con sezioni separate usando markdown.`,

  sinistro: `Genera una denuncia di sinistro professionale in italiano.
Includi: dati assicurato, numero polizza (se disponibile), data e luogo del sinistro, dinamica dei fatti, danni riportati, eventuali testimoni, documentazione da allegare, dichiarazioni finali.
Formatta in modo chiaro con sezioni separate usando markdown.`,

  rinnovo: `Genera una proposta di rinnovo polizza assicurativa in italiano.
Includi: riepilogo polizza attuale, eventuali aggiornamenti consigliati, nuove coperture suggerite, confronto premio precedente/nuovo, condizioni speciali, scadenze.
Formatta in modo chiaro con sezioni separate usando markdown.`,

  richiesta_documenti: `Genera una lettera formale di richiesta documentazione al cliente in italiano.
Includi: intestazione agenzia, riferimento pratica, elenco documenti necessari con spiegazione, modalità di invio, scadenza, contatti per assistenza.
Formatta in modo chiaro con sezioni separate usando markdown.`,

  appuntamento: `Genera una conferma di appuntamento professionale in italiano.
Includi: data e ora proposti, luogo/modalità, documenti da portare, oggetto dell'incontro, contatti per modifiche.
Formatta in modo chiaro usando markdown.`,

  aggiornamento_polizza: `Genera una nota di aggiornamento polizza assicurativa in italiano.
Includi: polizza di riferimento, modifiche richieste, impatto sul premio, documentazione necessaria, tempistiche.
Formatta in modo chiaro usando markdown.`,
};

export const praticaService = {
  // ─── CRUD ──────────────────────────────────────────
  async list(userId: string): Promise<Pratica[]> {
    return praticaRepository.findAllByUserId(userId);
  },

  async getById(id: string, userId: string): Promise<Pratica> {
    return praticaRepository.findById(id, userId);
  },

  async create(userId: string, dto: CreatePraticaDto): Promise<Pratica> {
    const { generate_artifact, ...rest } = dto;
    const pratica = await praticaRepository.create(userId, rest);

    // Auto-generate artifact if requested
    if (generate_artifact) {
      this.generateArtifact(pratica, userId).catch((err) => {
        console.error(`[pratica] Artifact generation failed for ${pratica.id}:`, err.message);
      });
    }

    return pratica;
  },

  async update(id: string, userId: string, dto: UpdatePraticaDto): Promise<Pratica> {
    return praticaRepository.update(id, userId, dto);
  },

  async remove(id: string, userId: string): Promise<void> {
    return praticaRepository.remove(id, userId);
  },

  // ─── Notes ─────────────────────────────────────────
  async getNotes(praticaId: string): Promise<PraticaNote[]> {
    return praticaRepository.findNotes(praticaId);
  },

  async addNote(praticaId: string, userId: string, dto: CreateNoteDto): Promise<PraticaNote> {
    return praticaRepository.createNote(praticaId, userId, dto);
  },

  async removeNote(noteId: string, userId: string): Promise<void> {
    return praticaRepository.removeNote(noteId, userId);
  },

  // ─── Artifacts ─────────────────────────────────────
  async getArtifacts(praticaId: string): Promise<PraticaArtifact[]> {
    return praticaRepository.findArtifacts(praticaId);
  },

  async updateArtifact(artifactId: string, content: string): Promise<PraticaArtifact> {
    return praticaRepository.updateArtifact(artifactId, content);
  },

  async removeArtifact(artifactId: string): Promise<void> {
    return praticaRepository.removeArtifact(artifactId);
  },

  // ─── AI Artifact generation ────────────────────────
  async generateArtifact(pratica: Pratica, userId: string): Promise<PraticaArtifact> {
    // Build context from linked message
    let messageContext = '';
    if (pratica.message_id) {
      try {
        const msg = await messageRepository.findById(pratica.message_id, userId);
        messageContext = `\n\nMessaggio originale del cliente:\nDa: ${msg.from_name} (${msg.from_email || ''})\nOggetto: ${msg.subject}\n\n${msg.body}`;
      } catch {
        // message may have been deleted
      }
    }

    const systemPrompt = ARTIFACT_PROMPTS[pratica.type];
    const userPrompt = `Cliente: ${pratica.client_name}
Email: ${pratica.client_email || 'N/D'}
Telefono: ${pratica.client_phone || 'N/D'}
Tipo pratica: ${pratica.type}
Titolo: ${pratica.title}
Descrizione: ${pratica.description || 'N/D'}${messageContext}`;

    const provider = getAiProvider('claude');
    const response = await provider.generate({
      systemPrompt,
      userPrompt,
      model: 'claude-opus-4-6',
    });

    return praticaRepository.createArtifact(pratica.id, {
      type: TYPE_TO_ARTIFACT[pratica.type],
      title: TYPE_TO_ARTIFACT_TITLE[pratica.type],
      content: response.content,
      ai_model: 'claude-opus-4-6',
    });
  },

  async generateNewArtifact(praticaId: string, userId: string, artifactType: ArtifactType, title: string, prompt: string): Promise<PraticaArtifact> {
    const provider = getAiProvider('claude');
    const response = await provider.generate({
      systemPrompt: 'Sei un assistente AI per un\'agenzia assicurativa italiana. Genera il documento richiesto in modo professionale, in italiano, formattato in markdown.',
      userPrompt: prompt,
      model: 'claude-opus-4-6',
    });

    return praticaRepository.createArtifact(praticaId, {
      type: artifactType,
      title,
      content: response.content,
      ai_model: 'claude-opus-4-6',
    });
  },
};
