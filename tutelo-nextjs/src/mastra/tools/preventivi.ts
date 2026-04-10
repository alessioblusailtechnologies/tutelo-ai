import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

const TIPO_VALUES = ['rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale', 'altro'] as const;
const STATO_VALUES = ['bozza', 'calcolato', 'inviato', 'accettato', 'rifiutato'] as const;

export const creaPreventivo = createTool({
  id: 'crea-preventivo',
  description:
    'Crea un nuovo preventivo per una persona. Richiede il contatto_id e il tipo di polizza. I parametri specifici (veicolo, coperture, ecc.) vanno nel campo parametri come oggetto JSON.',
  inputSchema: z.object({
    contatto_id: z.string().describe('ID della persona a cui associare il preventivo'),
    tipo: z.enum(TIPO_VALUES).describe('Tipo di polizza'),
    stato: z.enum(STATO_VALUES).default('bozza').describe('Stato iniziale del preventivo'),
    parametri: z
      .record(z.string(), z.any())
      .default({})
      .describe('Parametri specifici del preventivo (es. marca, modello, anno, targa, classe_merito, coperture richieste)'),
    risultati: z.array(z.any()).default([]).describe('Risultati iniziali della comparazione compagnie (di solito vuoto)'),
    note: z.string().optional().describe('Note aggiuntive'),
  }),
  outputSchema: z.object({
    preventivo: z.any(),
  }),
  execute: async (input) => {
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .insert({
        contatto_id: input.contatto_id,
        tipo: input.tipo,
        stato: input.stato,
        parametri: input.parametri,
        risultati: input.risultati,
        note: input.note,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { preventivo: data };
  },
});

export const getPreventivo = createTool({
  id: 'get-preventivo',
  description: 'Recupera i dettagli di un preventivo dato il suo ID, insieme alla persona collegata.',
  inputSchema: z.object({
    id: z.string().describe('ID del preventivo (UUID)'),
  }),
  outputSchema: z.object({
    preventivo: z.any().nullable(),
  }),
  execute: async (input) => {
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .select('*, persona:tutelonxtjs_persone(*)')
      .eq('id', input.id)
      .single();

    if (error) throw new Error(error.message);
    return { preventivo: data };
  },
});

export const cercaPreventivi = createTool({
  id: 'cerca-preventivi',
  description: 'Cerca preventivi per persona, tipo o stato. Supporta paginazione con limit/offset.',
  inputSchema: z.object({
    contatto_id: z.string().optional().describe('Filtra per persona'),
    tipo: z.enum(TIPO_VALUES).optional(),
    stato: z.enum(STATO_VALUES).optional(),
    limit: z.number().int().min(1).max(100).default(20).describe('Numero massimo di risultati (default 20, max 100)'),
    offset: z.number().int().min(0).default(0).describe('Offset di paginazione'),
  }),
  outputSchema: z.object({
    preventivi: z.array(z.any()),
    count: z.number().describe('Numero di risultati nella pagina restituita'),
    total: z.number().describe('Numero totale di righe che rispettano i filtri (per paginazione)'),
  }),
  execute: async (input) => {
    let query = supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .select('*, persona:tutelonxtjs_persone(nome, cognome)', { count: 'exact' });

    if (input.contatto_id) query = query.eq('contatto_id', input.contatto_id);
    if (input.tipo) query = query.eq('tipo', input.tipo);
    if (input.stato) query = query.eq('stato', input.stato);

    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return {
      preventivi: data || [],
      count: data?.length || 0,
      total: count ?? 0,
    };
  },
});

export const aggiornaPreventivo = createTool({
  id: 'aggiorna-preventivo',
  description: 'Aggiorna un preventivo esistente. Può aggiornare stato, parametri, risultati o note.',
  inputSchema: z.object({
    id: z.string().describe('ID del preventivo da aggiornare'),
    stato: z.enum(STATO_VALUES).optional(),
    parametri: z.record(z.string(), z.any()).optional().describe('Parametri aggiornati'),
    risultati: z.array(z.any()).optional().describe('Risultati comparazione compagnie'),
    note: z.string().optional(),
  }),
  outputSchema: z.object({
    preventivo: z.any(),
  }),
  execute: async (input) => {
    const { id, ...updates } = input;
    const { data, error } = await supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { preventivo: data };
  },
});

export const contaPreventivi = createTool({
  id: 'conta-preventivi',
  description:
    'Conta quanti preventivi rispettano i filtri dati, senza restituire le righe. Utile per statistiche rapide (es. quanti preventivi RC Auto in stato inviato per una persona).',
  inputSchema: z.object({
    contatto_id: z.string().optional().describe('Filtra per persona'),
    tipo: z.enum(TIPO_VALUES).optional(),
    stato: z.enum(STATO_VALUES).optional(),
  }),
  outputSchema: z.object({
    total: z.number(),
  }),
  execute: async (input) => {
    let query = supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .select('id', { count: 'exact', head: true });

    if (input.contatto_id) query = query.eq('contatto_id', input.contatto_id);
    if (input.tipo) query = query.eq('tipo', input.tipo);
    if (input.stato) query = query.eq('stato', input.stato);

    const { error, count } = await query;
    if (error) throw new Error(error.message);
    return { total: count ?? 0 };
  },
});

export const eliminaPreventivo = createTool({
  id: 'elimina-preventivo',
  description:
    'Elimina definitivamente un preventivo tramite il suo ID. Usare solo su conferma esplicita dell\'utente.',
  inputSchema: z.object({
    id: z.string().describe('ID del preventivo da eliminare (UUID)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string(),
  }),
  execute: async (input) => {
    const { error } = await supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .delete()
      .eq('id', input.id);

    if (error) throw new Error(error.message);
    return { success: true, id: input.id };
  },
});

export const scrapaPreventivi = createTool({
  id: 'scrapa-preventivi',
  description:
    'Simula la ricerca di preventivi da multiple compagnie assicurative per i parametri dati. Ritorna una comparazione con premi e coperture per ogni compagnia.',
  inputSchema: z.object({
    tipo: z
      .enum(['rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale'])
      .describe('Tipo di polizza'),
    parametri: z
      .record(z.string(), z.any())
      .describe('Parametri del preventivo (veicolo, coperture, dati persona, ecc.)'),
  }),
  outputSchema: z.object({
    comparazione: z.array(
      z.object({
        compagnia: z.string(),
        premio_annuo: z.number(),
        premio_semestrale: z.number(),
        coperture: z.array(z.string()),
        franchigia: z.number(),
        massimale: z.string(),
        rating: z.number(),
      }),
    ),
  }),
  execute: async (input) => {
    // TODO: Implementare scraping reale con browser automation
    // Per ora simulazione con dati realistici
    const compagnie = [
      { nome: 'Generali', base: 420, rating: 4.2 },
      { nome: 'Unipol', base: 395, rating: 3.9 },
      { nome: 'Allianz', base: 480, rating: 4.5 },
      { nome: 'AXA', base: 410, rating: 4.0 },
      { nome: 'Zurich', base: 450, rating: 4.3 },
    ];

    const variazione = () => 0.85 + Math.random() * 0.3;

    const comparazione = compagnie.map((c) => {
      const premio = Math.round(c.base * variazione());
      return {
        compagnia: c.nome,
        premio_annuo: premio,
        premio_semestrale: Math.round(premio * 0.52),
        coperture: ['RC Auto', 'Assistenza stradale', ...(Math.random() > 0.5 ? ['Tutela legale'] : [])],
        franchigia: Math.random() > 0.5 ? 500 : 0,
        massimale: '€6.450.000',
        rating: c.rating,
      };
    });

    comparazione.sort((a, b) => a.premio_annuo - b.premio_annuo);
    return { comparazione };
  },
});
