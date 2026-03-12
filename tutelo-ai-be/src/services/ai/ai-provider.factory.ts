import { BadRequestError } from '../../utils/api-error.js';
import type { AiProvider } from './ai-provider.interface.js';
import { ClaudeProvider } from './claude.provider.js';
import { OpenAiProvider } from './openai.provider.js';

const providers: Record<string, AiProvider> = {
  claude: new ClaudeProvider(),
  openai: new OpenAiProvider(),
};

export function getAiProvider(provider: 'claude' | 'openai'): AiProvider {
  const instance = providers[provider];
  if (!instance) {
    throw new BadRequestError(`Unsupported AI provider: ${provider}`);
  }
  return instance;
}
