import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PdfDocument } from '../pdf/PdfDocument';

const BUCKET = 'tutelonxtjs-pdfs';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const generaPdf = createTool({
  id: 'genera-pdf',
  description: `Genera un PDF a partire da titolo e contenuto in markdown.
Il contenuto può includere headings (#, ##, ###), paragrafi, **grassetto**, *corsivo*, liste (- item) e tabelle markdown.
Il PDF viene salvato e ritorna un id riutilizzabile per allegarlo a un'email.
Usalo quando l'utente chiede di generare un documento (preventivo, riepilogo, scheda cliente, report, ecc.).`,
  inputSchema: z.object({
    title: z.string().describe('Titolo del documento PDF (es. "Preventivo RC Auto - Mario Rossi")'),
    subtitle: z.string().optional().describe('Sottotitolo opzionale (es. "Generato il 10 aprile 2026")'),
    content_markdown: z.string().describe('Contenuto del PDF in formato markdown. Supporta headings, paragrafi, bold, italic, liste e tabelle.'),
    meta: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional().describe('Coppie chiave-valore mostrate nell\'header (es. "Riferimento: PRV-2026-001")'),
    filename: z.string().optional().describe('Nome del file senza estensione (opzionale, default: derivato dal titolo)'),
  }),
  outputSchema: z.object({
    pdf_id: z.string(),
    url: z.string(),
    filename: z.string(),
  }),
  execute: async (input) => {
    // Render PDF to buffer
    const element = React.createElement(PdfDocument, {
      title: input.title,
      subtitle: input.subtitle,
      contentMarkdown: input.content_markdown,
      meta: input.meta,
    });
    const buffer = await renderToBuffer(element);

    // Upload to Supabase Storage
    const baseName = input.filename || slugify(input.title) || 'documento';
    const timestamp = Date.now();
    const filename = `${baseName}-${timestamp}.pdf`;
    const path = `${new Date().getFullYear()}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      throw new Error(`Errore upload PDF: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return {
      pdf_id: path,
      url: urlData.publicUrl,
      filename,
    };
  },
});
