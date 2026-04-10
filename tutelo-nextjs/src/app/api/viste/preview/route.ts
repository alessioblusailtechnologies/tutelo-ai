import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';
import { executeView, validateDefinition } from '@/lib/viste/executor';
import type { ViewDefinition } from '@/lib/viste/types';

// Generate a view definition from a natural language prompt and execute it (without saving)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, definition } = body;

  let def: ViewDefinition;

  if (definition) {
    // Use provided definition directly (for edit flow)
    try {
      validateDefinition(definition);
      def = definition;
    } catch (err: any) {
      return NextResponse.json({ error: `Invalid definition: ${err.message}` }, { status: 400 });
    }
  } else {
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Call the vista-builder agent to generate the definition
    try {
      const agent = mastra.getAgent('vistaBuilder');
      const result = await agent.generate(prompt);
      const rawText = (result.text || '').trim();

      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

      try {
        def = JSON.parse(cleaned);
      } catch {
        return NextResponse.json(
          { error: 'Il builder ha restituito un JSON non valido', raw: rawText },
          { status: 500 },
        );
      }

      try {
        validateDefinition(def);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Definition non valida: ${err.message}`, definition: def },
          { status: 400 },
        );
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: `Errore durante la generazione: ${err?.message || err}` },
        { status: 500 },
      );
    }
  }

  // Execute
  try {
    const result = await executeView(def);
    return NextResponse.json({ definition: def, result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Errore esecuzione query: ${err?.message || err}`, definition: def },
      { status: 500 },
    );
  }
}
