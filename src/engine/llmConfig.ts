import { createGateway } from '@ai-sdk/gateway';

export const isLlmEnabled = (): boolean => {
  return Boolean(import.meta.env.VITE_AI_GATEWAY_KEY);
};

const gateway = createGateway({
  apiKey: import.meta.env.VITE_AI_GATEWAY_KEY ?? '',
});

export const ghostModel = gateway('openai/gpt-4.1-mini');
