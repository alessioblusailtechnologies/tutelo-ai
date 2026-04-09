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

  // If new conversation, create it
  if (!convId) {
    const title = message.slice(0, 80) + (message.length > 80 ? '...' : '');
    const { data: conv, error: convErr } = await supabaseAdmin
      .from('tutelonxtjs_conversations')
      .insert({ title, user_id: user_id || null })
      .select('id')
      .single();

    if (convErr) {
      return Response.json({ error: convErr.message }, { status: 500 });
    }
    convId = conv.id;
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
      try {
        const result = await agent.stream(messages, {
          maxSteps: 10,
        });

        let fullText = '';
        for await (const chunk of result.textStream) {
          fullText += chunk;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`),
          );
        }

        // Save assistant response
        if (fullText.trim()) {
          await supabaseAdmin
            .from('tutelonxtjs_messages')
            .insert({ conversation_id: convId, role: 'assistant', content: fullText.trim() });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done', conversation_id: convId })}\n\n`),
        );
        controller.close();
      } catch (err: any) {
        const errorMsg = err?.message || 'Errore durante la generazione della risposta';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', content: errorMsg })}\n\n`),
        );
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
