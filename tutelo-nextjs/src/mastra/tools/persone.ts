import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STATUS_VALUES = ['lead', 'prospect', 'cliente', 'ex_cliente'] as const;
const FONTE_VALUES = ['preventivo', 'manuale', 'email', 'whatsapp', 'assistente'] as const;

export const cercaPersona = createTool({
  id: 'cerca-persona',
  description:
    'Cerca persone nell\'anagrafica. Tutti i filtri sono opzionali: se nessun filtro è fornito ritorna le persone più recenti. Supporta paginazione con limit/offset.',
  inputSchema: z.object({
    nome: z.string().optional().describe('Nome della persona (match parziale)'),
    cognome: z.string().optional().describe('Cognome della persona (match parziale)'),
    email: z.string().optional().describe('Email della persona (match parziale)'),
    telefono: z.string().optional().describe('Numero di telefono (match parziale)'),
    codice_fiscale: z.string().optional().describe('Codice fiscale (match esatto)'),
    status: z.enum(STATUS_VALUES).optional().describe('Filtra per status'),
    fonte: z.enum(FONTE_VALUES).optional().describe('Filtra per fonte del contatto'),
    limit: z.number().int().min(1).max(100).default(10).describe('Numero massimo di risultati (default 10, max 100)'),
    offset: z.number().int().min(0).default(0).describe('Offset di paginazione'),
  }),
  outputSchema: z.object({
    persone: z.array(z.any()),
    count: z.number().describe('Numero di risultati nella pagina restituita'),
    total: z.number().describe('Numero totale di righe che rispettano i filtri (per paginazione)'),
  }),
  execute: async (input) => {
    let query = supabaseAdmin
      .from('tutelonxtjs_persone')
      .select('*', { count: 'exact' });

    if (input.nome) query = query.ilike('nome', `%${input.nome}%`);
    if (input.cognome) query = query.ilike('cognome', `%${input.cognome}%`);
    if (input.email) query = query.ilike('email', `%${input.email}%`);
    if (input.telefono) query = query.ilike('telefono', `%${input.telefono}%`);
    if (input.codice_fiscale) query = query.eq('codice_fiscale', input.codice_fiscale);
    if (input.status) query = query.eq('status', input.status);
    if (input.fonte) query = query.eq('fonte', input.fonte);

    const limit = input.limit ?? 10;
    const offset = input.offset ?? 0;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return {
      persone: data || [],
      count: data?.length || 0,
      total: count ?? 0,
    };
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
    status: z.enum(STATUS_VALUES).default('lead').describe('Status della persona'),
    fonte: z.enum(FONTE_VALUES).default('assistente').describe('Fonte del contatto'),
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
  description: 'Aggiorna i dati di una persona esistente. Tutti i campi sono opzionali tranne l\'ID.',
  inputSchema: z.object({
    id: z.string().describe('ID della persona da aggiornare'),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    email: z.string().optional(),
    telefono: z.string().optional(),
    codice_fiscale: z.string().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    fonte: z.enum(FONTE_VALUES).optional(),
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

export const contaPersone = createTool({
  id: 'conta-persone',
  description:
    'Conta quante persone rispettano i filtri dati, senza restituire le righe. Tutti i filtri sono opzionali: senza filtri restituisce il totale della tabella.',
  inputSchema: z.object({
    nome: z.string().optional().describe('Filtra per nome (match parziale)'),
    cognome: z.string().optional().describe('Filtra per cognome (match parziale)'),
    email: z.string().optional().describe('Filtra per email (match parziale)'),
    telefono: z.string().optional().describe('Filtra per telefono (match parziale)'),
    codice_fiscale: z.string().optional().describe('Filtra per codice fiscale (match esatto)'),
    status: z.enum(STATUS_VALUES).optional().describe('Filtra per status'),
    fonte: z.enum(FONTE_VALUES).optional().describe('Filtra per fonte del contatto'),
  }),
  outputSchema: z.object({
    total: z.number(),
  }),
  execute: async (input) => {
    let query = supabaseAdmin
      .from('tutelonxtjs_persone')
      .select('id', { count: 'exact', head: true });

    if (input.nome) query = query.ilike('nome', `%${input.nome}%`);
    if (input.cognome) query = query.ilike('cognome', `%${input.cognome}%`);
    if (input.email) query = query.ilike('email', `%${input.email}%`);
    if (input.telefono) query = query.ilike('telefono', `%${input.telefono}%`);
    if (input.codice_fiscale) query = query.eq('codice_fiscale', input.codice_fiscale);
    if (input.status) query = query.eq('status', input.status);
    if (input.fonte) query = query.eq('fonte', input.fonte);

    const { error, count } = await query;
    if (error) throw new Error(error.message);
    return { total: count ?? 0 };
  },
});

export const eliminaPersona = createTool({
  id: 'elimina-persona',
  description:
    'Elimina definitivamente una persona dal sistema tramite il suo ID. ATTENZIONE: elimina in cascata anche tutti i preventivi associati. Usare solo su conferma esplicita dell\'utente.',
  inputSchema: z.object({
    id: z.string().describe('ID della persona da eliminare (UUID)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string(),
  }),
  execute: async (input) => {
    const { error } = await supabaseAdmin
      .from('tutelonxtjs_persone')
      .delete()
      .eq('id', input.id);

    if (error) throw new Error(error.message);
    return { success: true, id: input.id };
  },
});
