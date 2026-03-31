import { createGateway } from '@ai-sdk/gateway';
import type { LanguageModel } from 'ai';

export const isLlmEnabled = (): boolean => {
  return Boolean(import.meta.env.VITE_AI_GATEWAY_KEY);
};

const gateway = createGateway({
  apiKey: import.meta.env.VITE_AI_GATEWAY_KEY ?? '',
});

export const ghostModel = gateway('openai/gpt-5.4-mini') as unknown as LanguageModel;
