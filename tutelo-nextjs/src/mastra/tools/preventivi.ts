import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const creaPreventivo = createTool({
  id: 'crea-preventivo',
  description: 'Crea un nuovo preventivo per una persona. Richiede il contatto_id e il tipo di polizza. I parametri specifici (veicolo, coperture, ecc.) vanno nel campo parametri come oggetto JSON.',
  inputSchema: z.object({
    contatto_id: z.string().describe('ID della persona a cui associare il preventivo'),
    tipo: z.enum(['rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale', 'altro']).describe('Tipo di polizza'),
    parametri: z.record(z.string(), z.any()).default({}).describe('Parametri specifici del preventivo (es. marca, modello, anno, targa, classe_merito, coperture richieste)'),
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
        stato: 'bozza',
        parametri: input.parametri,
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
  description: 'Recupera i dettagli di un preventivo dato il suo ID.',
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
  description: 'Cerca preventivi per persona, tipo o stato.',
  inputSchema: z.object({
    contatto_id: z.string().optional().describe('Filtra per persona'),
    tipo: z.enum(['rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale', 'altro']).optional(),
    stato: z.enum(['bozza', 'calcolato', 'inviato', 'accettato', 'rifiutato']).optional(),
  }),
  outputSchema: z.object({
    preventivi: z.array(z.any()),
    count: z.number(),
  }),
  execute: async (input) => {
    let query = supabaseAdmin
      .from('tutelonxtjs_preventivi')
      .select('*, persona:tutelonxtjs_persone(nome, cognome)');

    if (input.contatto_id) query = query.eq('contatto_id', input.contatto_id);
    if (input.tipo) query = query.eq('tipo', input.tipo);
    if (input.stato) query = query.eq('stato', input.stato);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return { preventivi: data || [], count: data?.length || 0 };
  },
});

export const aggiornaPreventivo = createTool({
  id: 'aggiorna-preventivo',
  description: 'Aggiorna un preventivo esistente. Può aggiornare stato, parametri, risultati o note.',
  inputSchema: z.object({
    id: z.string().describe('ID del preventivo da aggiornare'),
    stato: z.enum(['bozza', 'calcolato', 'inviato', 'accettato', 'rifiutato']).optional(),
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

export const scrapaPreventivi = createTool({
  id: 'scrapa-preventivi',
  description: 'Simula la ricerca di preventivi da multiple compagnie assicurative per i parametri dati. Ritorna una comparazione con premi e coperture per ogni compagnia.',
  inputSchema: z.object({
    tipo: z.enum(['rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale']).describe('Tipo di polizza'),
    parametri: z.record(z.string(), z.any()).describe('Parametri del preventivo (veicolo, coperture, dati persona, ecc.)'),
  }),
  outputSchema: z.object({
    comparazione: z.array(z.object({
      compagnia: z.string(),
      premio_annuo: z.number(),
      premio_semestrale: z.number(),
      coperture: z.array(z.string()),
      franchigia: z.number(),
      massimale: z.string(),
      rating: z.number(),
    })),
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
