import express from 'express';
import cors from 'cors';
import { createGateway } from '@ai-sdk/gateway';
import { generateText } from 'ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cors());

// ── AI Gateway ────────────────────────────────────────────────────────────────
const gateway = createGateway({
  apiKey: process.env.VITE_AI_GATEWAY_KEY ?? '',
});

const model = gateway('openai/gpt-4.1-mini');

app.post('/api/ghost-chat', async (req, res) => {
  const { system, prompt } = req.body;

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
    res.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ghost-chat] LLM error:', msg);
    res.status(500).json({ error: msg });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    llmEnabled: Boolean(process.env.VITE_AI_GATEWAY_KEY),
  });
});

// ── Serve built frontend (production) ─────────────────────────────────────────
const distDir = join(__dirname, 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback — all non-API routes return index.html
  app.get('*', (_req, res) => {
    res.sendFile(join(distDir, 'index.html'));
  });
  console.log('[server] serving built frontend from /dist');
}

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ghost-chat server] listening on http://0.0.0.0:${PORT}`);
});
