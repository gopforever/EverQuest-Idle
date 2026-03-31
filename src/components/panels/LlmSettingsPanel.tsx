import { useGameStore } from '../../store/gameStore';

export function LlmSettingsPanel() {
  const ghosts = useGameStore((s) => s.ghosts);
  const llmErrorCount = useGameStore((s) => s.llmErrorCount);
  const hasKey = Boolean(import.meta.env.VITE_AI_GATEWAY_KEY);
  const isErroring = llmErrorCount > 0;
  const ghostsWithMemory = ghosts.filter((g) => (g.memory?.length ?? 0) > 0).length;

  const status: 'active' | 'error' | 'inactive' = !hasKey
    ? 'inactive'
    : isErroring
    ? 'error'
    : 'active';

  const statusColor = { active: '#4caf50', error: '#cc4444', inactive: '#888888' }[status];
  const statusLabel = { active: '● ACTIVE', error: '● ERROR', inactive: '○ INACTIVE' }[status];

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
        <span style={{ color: 'var(--eq-text-dim)' }}>Ghost Chat Status</span>
        <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusLabel}</span>
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
        Ghost agents generate in-character chat messages via the Vercel AI Gateway.
        Up to 3 ghosts are called every ~50 ticks. Each call costs ~$0.0001.
        Ghost simulation runs normally with or without this feature enabled.
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
        <span style={{ color: 'var(--eq-text-dim)' }}>Failed calls (session)</span>
        <span style={{ color: llmErrorCount > 0 ? '#cc4444' : 'var(--eq-gold)', fontWeight: 'bold' }}>{llmErrorCount}</span>
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

      {/* Error state: key is set but failing */}
      {status === 'error' && (
        <div
          className="p-2 rounded border leading-relaxed space-y-2"
          style={{ borderColor: '#883333', backgroundColor: '#1a0a0a', color: '#cc6666' }}
        >
          <div className="font-bold" style={{ color: '#ee6666' }}>⚠ Gateway Key Error</div>
          <div>
            Your gateway key is set but calls are failing (HTTP 500 from Vercel). The key may be
            expired, over quota, or invalid.
          </div>
          <div>
            To fix: go to{' '}
            <span style={{ color: '#f0a070' }}>vercel.com → AI → AI Gateway → API Keys</span>,
            generate a new key, and update <span style={{ color: '#f0c070' }}>VITE_AI_GATEWAY_KEY</span>{' '}
            in your <span style={{ color: '#f0c070' }}>.env.local</span> file, then restart.
          </div>
          <div style={{ color: '#886666', fontSize: '10px' }}>
            The game runs fully without ghost chat — this only affects in-character messages in the log.
          </div>
        </div>
      )}

      {/* Inactive state: no key set */}
      {status === 'inactive' && (
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

      {/* Active state: working */}
      {status === 'active' && (
        <div
          className="p-2 rounded border text-xs leading-relaxed"
          style={{ borderColor: '#336633', backgroundColor: '#0a1a0a', color: '#66cc66' }}
        >
          ✓ Ghost chat is active. Ghosts will speak in character in the combat log.
        </div>
      )}
    </div>
  );
}
