import { z } from 'zod';

export const createMessageSchema = z.object({
  from_name: z.string().min(1).max(200),
  from_email: z.string().email().optional(),
  from_phone: z.string().max(50).optional(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  source: z.enum(['email', 'whatsapp']),
  tag: z.enum(['sinistro', 'preventivo', 'rinnovo', 'richiesta', 'nuovo']).optional(),
  priority: z.enum(['high', 'med']).nullable().optional(),
});

export const updateMessageSchema = z.object({
  tag: z.enum(['sinistro', 'preventivo', 'rinnovo', 'richiesta', 'nuovo']).optional(),
  tag_label: z.string().max(100).optional(),
  priority: z.enum(['high', 'med']).nullable().optional(),
  priority_label: z.string().max(100).nullable().optional(),
  is_read: z.boolean().optional(),
});
