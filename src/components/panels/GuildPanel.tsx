export function GuildPanel() {
  const btnStyle: React.CSSProperties = {
    backgroundColor: 'var(--eq-panel)',
    border: '1px solid var(--eq-border)',
    color: 'var(--eq-text)',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    borderRadius: '2px',
  };

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center" style={{ color: 'var(--eq-text)' }}>
      <div className="text-center p-6" style={{ maxWidth: '220px' }}>
        <div
          className="text-base font-bold mb-3"
          style={{ color: 'var(--eq-gold)' }}
        >
          [GUILD]
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--eq-text)' }}>
          You are not a member of any guild.
        </div>
        <div className="text-xs mb-5 italic" style={{ color: 'var(--eq-text-dim)', lineHeight: '1.5' }}>
          Seek out a recruiter in the lands of Norrath,
          or gather your allies and found one yourself.
        </div>
        <div className="flex gap-2 justify-center">
          <button style={btnStyle} onClick={() => undefined}>
            [JOIN GUILD]
          </button>
          <button style={btnStyle} onClick={() => undefined}>
            [CREATE GUILD]
          </button>
        </div>
      </div>
    </div>
  );
}
