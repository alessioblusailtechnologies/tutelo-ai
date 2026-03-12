import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/index.js';
import type { AiProvider, AiGenerationRequest, AiGenerationResponse } from './ai-provider.interface.js';

const anthropic = new Anthropic({ apiKey: config.ai.anthropicApiKey });

export class ClaudeProvider implements AiProvider {
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const start = Date.now();

    const response = await anthropic.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [
        { role: 'user', content: request.userPrompt },
      ],
    });

    const generationTimeMs = Date.now() - start;
    const content = response.content[0];

    return {
      content: content?.type === 'text' ? content.text : '',
      promptTokens: response.usage?.input_tokens ?? 0,
      completionTokens: response.usage?.output_tokens ?? 0,
      model: response.model,
      provider: 'claude',
      generationTimeMs,
    };
  }

  listModels(): string[] {
    return ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'];
  }
}
