import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const cercaPersona = createTool({
  id: 'cerca-persona',
  description: 'Cerca una persona per nome, cognome, email, telefono o codice fiscale. Ritorna una lista di risultati.',
  inputSchema: z.object({
    nome: z.string().optional().describe('Nome della persona'),
    cognome: z.string().optional().describe('Cognome della persona'),
    email: z.string().optional().describe('Email della persona'),
    telefono: z.string().optional().describe('Numero di telefono'),
    codice_fiscale: z.string().optional().describe('Codice fiscale'),
  }),
  outputSchema: z.object({
    persone: z.array(z.any()),
    count: z.number(),
  }),
  execute: async (input) => {
    let query = supabaseAdmin.from('tutelonxtjs_persone').select('*');

    if (input.nome) query = query.ilike('nome', `%${input.nome}%`);
    if (input.cognome) query = query.ilike('cognome', `%${input.cognome}%`);
    if (input.email) query = query.ilike('email', `%${input.email}%`);
    if (input.telefono) query = query.ilike('telefono', `%${input.telefono}%`);
    if (input.codice_fiscale) query = query.eq('codice_fiscale', input.codice_fiscale);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(10);
    if (error) throw new Error(error.message);
    return { persone: data || [], count: data?.length || 0 };
  },
});

export const getPersona = createTool({
  id: 'get-persona',
  description: 'Recupera i dettagli di una persona dato il suo ID.',
  inputSchema: z.object({
    id: z.string().describe('ID della persona (UUID)'),
  }),
  outputSchema: z.object({
    persona: z.any().nullable(),
  }),
  execute: async (input) => {
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_persone')
      .select('*')
      .eq('id', input.id)
      .single();

    if (error) throw new Error(error.message);
    return { persona: data };
  },
});

export const creaPersona = createTool({
  id: 'crea-persona',
  description: 'Crea una nuova persona nel sistema. Richiede almeno nome e cognome.',
  inputSchema: z.object({
    nome: z.string().describe('Nome della persona'),
    cognome: z.string().describe('Cognome della persona'),
    email: z.string().optional().describe('Email'),
    telefono: z.string().optional().describe('Numero di telefono'),
    codice_fiscale: z.string().optional().describe('Codice fiscale'),
    status: z.enum(['lead', 'prospect', 'cliente', 'ex_cliente']).default('lead').describe('Status della persona'),
    fonte: z.enum(['preventivo', 'manuale', 'email', 'whatsapp', 'assistente']).default('assistente').describe('Fonte del contatto'),
    note: z.string().optional().describe('Note aggiuntive'),
  }),
  outputSchema: z.object({
    persona: z.any(),
  }),
  execute: async (input) => {
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_persone')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { persona: data };
  },
});

export const aggiornaPersona = createTool({
  id: 'aggiorna-persona',
  description: 'Aggiorna i dati di una persona esistente.',
  inputSchema: z.object({
    id: z.string().describe('ID della persona da aggiornare'),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    email: z.string().optional(),
    telefono: z.string().optional(),
    codice_fiscale: z.string().optional(),
    status: z.enum(['lead', 'prospect', 'cliente', 'ex_cliente']).optional(),
    note: z.string().optional(),
  }),
  outputSchema: z.object({
    persona: z.any(),
  }),
  execute: async (input) => {
    const { id, ...updates } = input;
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_persone')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { persona: data };
  },
});
