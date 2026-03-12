import { z } from 'zod';

const smtpEmailConfigSchema = z.object({
  provider: z.literal('smtp'),
  smtp_host: z.string().min(1),
  smtp_port: z.number().int().min(1).max(65535),
  smtp_user: z.string().min(1),
  smtp_pass: z.string().min(1),
  from_email: z.string().email(),
  from_name: z.string().min(1),
  use_tls: z.boolean().default(true),
});

const whatsappConfigSchema = z.object({
  provider: z.enum(['twilio', 'meta']),
  api_key: z.string().min(1),
  phone_number: z.string().min(1),
  account_sid: z.string().optional(),
});

// Only SMTP and WhatsApp go through POST — Google/Microsoft are created via OAuth callback
export const createChannelSchema = z.object({
  type: z.enum(['email', 'whatsapp']),
  name: z.string().min(1).max(100),
  is_active: z.boolean().optional(),
  config: z.union([smtpEmailConfigSchema, whatsappConfigSchema]),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  config: z.union([
    smtpEmailConfigSchema.partial().extend({ provider: z.literal('smtp') }),
    whatsappConfigSchema.partial().extend({ provider: z.enum(['twilio', 'meta']) }),
  ]).optional(),
});
