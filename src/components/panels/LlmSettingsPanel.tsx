import { useGameStore } from '../../store/gameStore';

export function LlmSettingsPanel() {
  const ghosts = useGameStore((s) => s.ghosts);
  const llmErrorCount = useGameStore((s) => s.llmErrorCount);
  const lastLlmError = useGameStore((s) => s.lastLlmError);
  const isActive = Boolean(import.meta.env.VITE_AI_GATEWAY_KEY);
  const ghostsWithMemory = ghosts.filter((g) => (g.memory?.length ?? 0) > 0).length;

  function clearAllMemories() {
    useGameStore.setState((s) => ({
      ghosts: s.ghosts.map((g) => ({ ...g, memory: [], memorySummary: undefined })),
    }));
  }

  return (
    <div
      className="flex flex-col h-full overflow-y-auto p-3 gap-3 text-xs"
      style={{ color: 'var(--eq-text)', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
    >
      {/* Header */}
      <div
        className="text-sm font-bold text-center pb-2 border-b"
        style={{ color: 'var(--eq-gold)', borderColor: 'var(--eq-border)' }}
      >
        ✦ GHOST AGENT SETTINGS
      </div>

      {/* Status indicator */}
      <div
        className="flex items-center justify-between p-2 rounded border"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510' }}
      >
        <span style={{ color: 'var(--eq-text-dim)' }}>Status</span>
        {isActive ? (
          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>● ACTIVE</span>
        ) : (
          <span style={{ color: '#f44336', fontWeight: 'bold' }}>○ INACTIVE</span>
        )}
      </div>

      {/* Model display */}
      <div
        className="flex items-center justify-between p-2 rounded border"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510' }}
      >
        <span style={{ color: 'var(--eq-text-dim)' }}>Model</span>
        <span style={{ color: 'var(--eq-gold)' }}>openai/gpt-4.1-mini</span>
      </div>

      {/* Info section */}
      <div
        className="p-2 rounded border text-xs leading-relaxed"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510', color: 'var(--eq-text-dim)' }}
      >
        Ghost agents generate contextual chat powered by GPT-4.1 Mini via Vercel AI Gateway.
        3 ghosts are called every 50 ticks. Each call costs ~$0.0001.
      </div>

      {/* Stats */}
      <div
        className="flex items-center justify-between p-2 rounded border"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510' }}
      >
        <span style={{ color: 'var(--eq-text-dim)' }}>Ghosts with memories</span>
        <span style={{ color: 'var(--eq-gold)', fontWeight: 'bold' }}>{ghostsWithMemory}</span>
      </div>

      {/* LLM error count */}
      <div
        className="flex items-center justify-between p-2 rounded border"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510' }}
      >
        <span style={{ color: 'var(--eq-text-dim)' }}>LLM errors (session)</span>
        <span style={{ color: llmErrorCount > 0 ? '#cc4444' : 'var(--eq-gold)', fontWeight: 'bold' }}>{llmErrorCount}</span>
      </div>

      {/* Last LLM error */}
      <div
        className="p-2 rounded border text-xs leading-relaxed"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: '#1a1510', color: 'var(--eq-text-dim)' }}
      >
        <span style={{ color: 'var(--eq-text-dim)' }}>Last LLM error: </span>
        <span style={{ color: lastLlmError ? '#cc4444' : 'var(--eq-text-dim)' }}>{lastLlmError ?? 'None'}</span>
      </div>

      {/* Clear memories button */}
      <button
        onClick={clearAllMemories}
        disabled={ghostsWithMemory === 0}
        className="w-full py-1.5 px-3 rounded border text-xs font-bold transition-colors"
        style={{
          borderColor: 'var(--eq-border)',
          backgroundColor: ghostsWithMemory > 0 ? '#3a2c18' : '#1a1510',
          color: ghostsWithMemory > 0 ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
          cursor: ghostsWithMemory > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Clear All Ghost Memories
      </button>

      {/* Setup instructions when inactive */}
      {!isActive && (
        <div
          className="p-2 rounded border leading-relaxed"
          style={{ borderColor: '#8b4513', backgroundColor: '#1a0f08', color: '#cc8844' }}
        >
          <div className="font-bold mb-1">Setup Required</div>
          <div>
            Add the following to your <span style={{ color: 'var(--eq-gold)' }}>.env.local</span> file
            in the project root, then restart the dev server:
          </div>
          <div
            className="mt-2 p-1 rounded font-mono"
            style={{ backgroundColor: '#0d0a07', color: '#e0c080' }}
          >
            VITE_AI_GATEWAY_KEY=your_key_here
          </div>
          <div className="mt-2">
            Get your key from{' '}
            <span style={{ color: 'var(--eq-gold)' }}>vercel.com → AI → AI Gateway → API Keys</span>.
          </div>
        </div>
      )}
    </div>
  );
}
