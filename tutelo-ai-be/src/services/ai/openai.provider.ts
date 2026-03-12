import OpenAI from 'openai';
import { config } from '../../config/index.js';
import type { AiProvider, AiGenerationRequest, AiGenerationResponse } from './ai-provider.interface.js';

const openai = new OpenAI({ apiKey: config.ai.openaiApiKey });

export class OpenAiProvider implements AiProvider {
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const start = Date.now();

    const response = await openai.chat.completions.create({
      model: request.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
    });

    const generationTimeMs = Date.now() - start;
    const choice = response.choices[0];

    return {
      content: choice?.message?.content ?? '',
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      model: response.model,
      provider: 'openai',
      generationTimeMs,
    };
  }

  listModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini'];
  }
}
