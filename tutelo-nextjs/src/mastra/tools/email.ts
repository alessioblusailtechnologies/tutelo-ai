import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Resend } from 'resend';
import { marked } from 'marked';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'tutelonxtjs-pdfs';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY non configurata');
  return new Resend(key);
}

function buildHtml(bodyMarkdown: string): string {
  const inner = marked.parse(bodyMarkdown, { async: false }) as string;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1B3D6F; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6; }
    h1, h2, h3 { color: #0A1929; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #E8EDF5; padding: 8px 12px; text-align: left; font-size: 14px; }
    th { background: #F4F7FB; font-weight: 600; }
    a { color: #2563B0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8EDF5; font-size: 12px; color: #7A9CC0; }
  </style>
</head>
<body>
  ${inner}
  <div class="footer">Inviato tramite Tutelo AI</div>
</body>
</html>`;
}

export const inviaMail = createTool({
  id: 'invia-mail',
  description: `Invia un'email a uno o più destinatari. Il corpo del messaggio è in markdown e viene convertito in HTML formattato.
Puoi allegare uno o più PDF già generati passando i loro pdf_id (ottenuti da generaPdf).
Usa questo tool quando l'utente chiede di inviare un'email, una comunicazione, un preventivo o un documento via mail.`,
  inputSchema: z.object({
    to: z.union([z.string(), z.array(z.string())]).describe('Email destinatario (singola o array)'),
    cc: z.array(z.string()).optional().describe('Email in copia (CC)'),
    subject: z.string().describe('Oggetto dell\'email'),
    body_markdown: z.string().describe('Corpo del messaggio in markdown. Supporta heading, paragrafi, bold, italic, liste, tabelle e link.'),
    attachment_pdf_ids: z.array(z.string()).optional().describe('Lista di pdf_id (ottenuti da generaPdf) da allegare al messaggio'),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
    message_id: z.string().optional(),
    to: z.array(z.string()),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    const toArray = Array.isArray(input.to) ? input.to : [input.to];

    // Fetch attachments from storage
    const attachments: { filename: string; content: Buffer }[] = [];
    if (input.attachment_pdf_ids?.length) {
      for (const pdfId of input.attachment_pdf_ids) {
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(pdfId);
        if (error || !data) {
          throw new Error(`Impossibile recuperare l'allegato ${pdfId}: ${error?.message}`);
        }
        const buffer = Buffer.from(await data.arrayBuffer());
        const filename = pdfId.split('/').pop() || 'documento.pdf';
        attachments.push({ filename, content: buffer });
      }
    }

    const resend = getResend();
    const from = process.env.RESEND_FROM || 'Tutelo AI <onboarding@resend.dev>';

    const result = await resend.emails.send({
      from,
      to: toArray,
      cc: input.cc,
      subject: input.subject,
      html: buildHtml(input.body_markdown),
      attachments: attachments.length > 0
        ? attachments.map((a) => ({ filename: a.filename, content: a.content }))
        : undefined,
    });

    if (result.error) {
      return {
        sent: false,
        to: toArray,
        error: result.error.message || 'Errore invio email',
      };
    }

    return {
      sent: true,
      message_id: result.data?.id,
      to: toArray,
    };
  },
});
