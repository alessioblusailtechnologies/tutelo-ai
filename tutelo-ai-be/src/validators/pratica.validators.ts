import { z } from 'zod';

export const createPraticaSchema = z.object({
  type: z.enum(['preventivo', 'sinistro', 'rinnovo', 'richiesta_documenti', 'appuntamento', 'aggiornamento_polizza']),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['high', 'med', 'low']).optional(),
  client_name: z.string().min(1).max(200),
  client_email: z.string().email().optional().or(z.literal('')),
  client_phone: z.string().max(30).optional().or(z.literal('')),
  message_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  generate_artifact: z.boolean().optional(),
});

export const updatePraticaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['aperta', 'in_lavorazione', 'in_attesa', 'completata', 'annullata']).optional(),
  priority: z.enum(['high', 'med', 'low']).optional(),
  due_date: z.string().nullable().optional(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const generateArtifactSchema = z.object({
  type: z.enum(['preventivo_bozza', 'denuncia_sinistro', 'proposta_rinnovo', 'richiesta_documenti', 'lettera', 'altro']),
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(5000),
});
