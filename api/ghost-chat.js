import { createGateway } from '@ai-sdk/gateway';
import { generateText } from 'ai';

const gateway = createGateway({
  apiKey: process.env.VITE_AI_GATEWAY_KEY ?? '',
});

const model = gateway('openai/gpt-4.1-mini');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, prompt } = req.body ?? {};

  if (!system || !prompt) {
    return res.status(400).json({ error: 'Missing system or prompt' });
  }

  if (!process.env.VITE_AI_GATEWAY_KEY) {
    return res.status(503).json({ error: 'AI Gateway key not configured' });
  }

  try {
    const { text } = await generateText({
      model,
      system,
      prompt,
      maxOutputTokens: 80,
    });
    return res.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ghost-chat] LLM error:', msg);
    return res.status(500).json({ error: msg });
  }
}
