export default function handler(_req, res) {
  res.json({
    ok: true,
    llmEnabled: Boolean(process.env.VITE_AI_GATEWAY_KEY),
  });
}
