import { z } from 'zod';

const stepSchema = z.object({
  text: z.string().min(1).max(500),
  tag: z.string().min(1).max(50),
  tag_type: z.enum(['fetch', 'filter', 'action', 'notify']),
});

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  icon: z.string().max(10).optional(),
  icon_bg: z.string().max(20).optional(),
  trigger_type: z.enum(['scheduled', 'message', 'manual']),
  trigger_label: z.string().max(200).optional(),
  instructions: z.string().max(5000).optional(),
  ai_provider: z.enum(['claude', 'openai']).optional(),
  ai_model: z.string().max(100).optional(),
  output_channels: z.array(z.string()).optional(),
  steps: z.array(stepSchema).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  icon: z.string().max(10).optional(),
  icon_bg: z.string().max(20).optional(),
  trigger_type: z.enum(['scheduled', 'message', 'manual']).optional(),
  trigger_label: z.string().max(200).optional(),
  status: z.enum(['running', 'paused', 'draft']).optional(),
  instructions: z.string().max(5000).optional(),
  ai_provider: z.enum(['claude', 'openai']).optional(),
  ai_model: z.string().max(100).optional(),
  output_channels: z.array(z.string()).optional(),
});
