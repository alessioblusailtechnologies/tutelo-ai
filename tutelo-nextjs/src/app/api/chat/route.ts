import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { conversation_id, message, user_id } = body;

  if (!message?.trim()) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  let convId = conversation_id;
  let titlerPromise: Promise<string | null> | null = null;

  // If new conversation, create it with a placeholder title
  if (!convId) {
    const fallbackTitle = message.slice(0, 80) + (message.length > 80 ? '...' : '');
    const { data: conv, error: convErr } = await supabaseAdmin
      .from('tutelonxtjs_conversations')
      .insert({ title: fallbackTitle, user_id: user_id || null })
      .select('id')
      .single();

    if (convErr) {
      return Response.json({ error: convErr.message }, { status: 500 });
    }
    convId = conv.id;

    // Start titler agent in parallel — we'll await before closing the stream
    const newConvId = convId;
    titlerPromise = (async () => {
      try {
        const titler = mastra.getAgent('titler');
        const result = await titler.generate(message);
        const generatedTitle = result.text?.trim().replace(/^["']|["']$/g, '').slice(0, 80);
        if (generatedTitle && generatedTitle.length > 0) {
          await supabaseAdmin
            .from('tutelonxtjs_conversations')
            .update({ title: generatedTitle })
            .eq('id', newConvId);
          return generatedTitle;
        }
      } catch {
        // Keep fallback title on error
      }
      return null;
    })();
  }

  // Save user message
  await supabaseAdmin
    .from('tutelonxtjs_messages')
    .insert({ conversation_id: convId, role: 'user', content: message.trim() });

  // Load conversation history
  const { data: history } = await supabaseAdmin
    .from('tutelonxtjs_messages')
    .select('role, content')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });

  const messages = (history || []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Route every message via LLM router (chat can be multi-agent)
  let agentType: string;
  try {
    const router = mastra.getAgent('router');
    const routeResult = await router.generate(message);
    const routeText = routeResult.text?.trim().toLowerCase() || '';
    agentType = routeText.includes('preventiv') ? 'preventivi' : 'documentale';
  } catch {
    agentType = 'preventivi';
  }

  // Stream response from the selected agent
  const agent = mastra.getAgent(agentType as 'preventivi' | 'documentale');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const result = await agent.stream(messages, {
          maxSteps: 10,
        });

        let fullText = '';
        // Dopo una tool-call/tool-result il modello spesso riprende il testo
        // senza inserire un separatore: il chunk viene concatenato direttamente
        // alla coda del testo precedente ("...RC Auto!Ecco il dettaglio"). Qui
        // forziamo un paragraph break (due newline) al primo text-delta
        // successivo a ogni tool-activity, solo se non già presente.
        let postToolBreakPending = false;
        const attachments: Array<{
          type: 'pdf';
          filename: string;
          url: string;
          pdf_id: string;
        }> = [];

        for await (const chunk of result.fullStream) {
          const c = chunk as { type: string; payload?: Record<string, unknown> };

          if (c.type === 'text-delta') {
            let text = (c.payload?.text as string) || '';
            if (postToolBreakPending && text.length > 0) {
              postToolBreakPending = false;
              if (fullText.length > 0) {
                const tailNewlines = (fullText.match(/\n*$/)?.[0] || '').length;
                const headNewlines = (text.match(/^\n*/)?.[0] || '').length;
                const missing = 2 - (tailNewlines + headNewlines);
                if (missing > 0) text = '\n'.repeat(missing) + text;
              }
            }
            fullText += text;
            send({ type: 'text', content: text });
          } else if (c.type === 'tool-call') {
            postToolBreakPending = true;
            send({
              type: 'tool_call',
              tool_name: c.payload?.toolName,
              tool_call_id: c.payload?.toolCallId,
            });
          } else if (c.type === 'tool-result') {
            postToolBreakPending = true;
            const toolName = c.payload?.toolName as string;
            const result = c.payload?.result as Record<string, unknown> | undefined;

            // Capture generaPdf results as attachments
            if (toolName === 'generaPdf' && result?.url && result?.filename) {
              const attachment = {
                type: 'pdf' as const,
                filename: result.filename as string,
                url: result.url as string,
                pdf_id: result.pdf_id as string,
              };
              attachments.push(attachment);
              send({ type: 'attachment', attachment });
            }

            send({
              type: 'tool_result',
              tool_name: toolName,
              tool_call_id: c.payload?.toolCallId,
            });
          } else if (c.type === 'reasoning-delta') {
            const text = (c.payload?.text as string) || '';
            send({ type: 'reasoning', content: text });
          }
        }

        // Save assistant response with attachments
        if (fullText.trim()) {
          await supabaseAdmin
            .from('tutelonxtjs_messages')
            .insert({
              conversation_id: convId,
              role: 'assistant',
              content: fullText.trim(),
              attachments,
            });
        }

        // Wait for the titler agent to finish (started in parallel)
        // so the sidebar shows the smart title when refetching after navigation
        let title: string | null = null;
        if (titlerPromise) {
          title = await titlerPromise;
        }

        send({ type: 'done', conversation_id: convId, title });
        controller.close();
      } catch (err: any) {
        const errorMsg = err?.message || 'Errore durante la generazione della risposta';
        send({ type: 'error', content: errorMsg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
