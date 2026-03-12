import { messageRepository } from '../repositories/message.repository.js';
import { aiAnalysisRepository } from '../repositories/ai-analysis.repository.js';
import { getAiProvider } from './ai/ai-provider.factory.js';
import type { Message, CreateMessageDto, UpdateMessageDto, AiAnalysis } from '../types/message.types.js';

export const messageService = {
  async list(userId: string): Promise<Message[]> {
    return messageRepository.findAllByUserId(userId);
  },

  async getById(id: string, userId: string): Promise<Message> {
    return messageRepository.findById(id, userId);
  },

  async create(userId: string, dto: CreateMessageDto): Promise<Message> {
    return messageRepository.create(userId, dto);
  },

  async update(id: string, userId: string, dto: UpdateMessageDto): Promise<Message> {
    return messageRepository.update(id, userId, dto);
  },

  async remove(id: string, userId: string): Promise<void> {
    return messageRepository.remove(id, userId);
  },

  async getAnalysis(messageId: string): Promise<AiAnalysis | null> {
    return aiAnalysisRepository.findByMessageId(messageId);
  },

  async analyzeMessage(messageId: string, userId: string): Promise<AiAnalysis> {
    const message = await messageRepository.findById(messageId, userId);

    const provider = getAiProvider('openai');
    const start = Date.now();

    const response = await provider.generate({
      systemPrompt: `Sei un assistente AI per un'agenzia assicurativa italiana. Analizza il messaggio del cliente ed estrai:
1. Un riassunto conciso
2. Le entità chiave (cliente, polizza, targa, data, luogo, tipo pratica)
3. Le azioni proposte per l'agente assicurativo
4. La classificazione del messaggio: sinistro, preventivo, rinnovo, richiesta
5. La priorità: "high" (urgente), "med" (media) oppure null (normale)
6. Un breve badge AI di 1-2 parole (es. "Sinistro auto", "Preventivo vita", "Rinnovo urgente")

Rispondi in formato JSON con questa struttura:
{
  "summary": "riassunto del messaggio con parti importanti in **bold**",
  "entities": [{"label": "Nome campo", "value": "valore"}],
  "proposed_actions": [{"icon": "emoji", "icon_bg": "colore hex", "title": "titolo azione", "description": "descrizione", "action_type": "tipo"}],
  "tag": "sinistro|preventivo|rinnovo|richiesta",
  "tag_label": "Sinistro|Preventivo|Rinnovo|Richiesta",
  "priority": "high|med|null",
  "priority_label": "Urgente|Media priorità|null",
  "ai_badge": "breve badge"
}`,
      userPrompt: `Da: ${message.from_name}\nOggetto: ${message.subject}\n\n${message.body}`,
      model: 'gpt-4o-mini',
    });

    const generationTimeMs = Date.now() - start;
    let parsed;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = {
        summary: response.content,
        entities: [],
        proposed_actions: [],
      };
    }

    // Update message classification
    const validTags = ['sinistro', 'preventivo', 'rinnovo', 'richiesta'];
    const tag = validTags.includes(parsed.tag) ? parsed.tag : undefined;
    const updateFields: Record<string, any> = {};
    if (tag) {
      updateFields.tag = tag;
      updateFields.tag_label = parsed.tag_label || tag.charAt(0).toUpperCase() + tag.slice(1);
    }
    if (parsed.priority === 'high' || parsed.priority === 'med') {
      updateFields.priority = parsed.priority;
      updateFields.priority_label = parsed.priority_label || (parsed.priority === 'high' ? 'Urgente' : 'Media priorità');
    }
    if (parsed.ai_badge) {
      updateFields.ai_badge = parsed.ai_badge;
    }
    if (Object.keys(updateFields).length > 0) {
      await messageRepository.update(messageId, userId, updateFields as any);
    }

    return aiAnalysisRepository.create({
      message_id: messageId,
      summary: parsed.summary,
      confidence: 'alta',
      generation_time_ms: generationTimeMs,
      entities: parsed.entities,
      proposed_actions: parsed.proposed_actions,
    });
  },
};
