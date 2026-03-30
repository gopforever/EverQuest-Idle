import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setPos({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {visible && (
        <div
          className="fixed z-50 min-w-48 max-w-xs p-2 text-xs rounded shadow-lg pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            backgroundColor: 'var(--eq-panel)',
            border: '2px solid var(--eq-border)',
            color: 'var(--eq-text)',
            fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
