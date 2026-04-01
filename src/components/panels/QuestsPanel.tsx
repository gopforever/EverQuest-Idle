import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import { QUESTS } from '../../data/quests';
import { getAvailableQuests, getCurrentStepDescription } from '../../engine/questEngine';

type QuestTab = 'active' | 'available' | 'completed';

const CATEGORY_LABELS: Record<string, string> = {
  faction:       'Faction',
  epic_precursor: 'Epic Precursor',
  plane_access:  'Plane Access',
  tradeskill:    'Tradeskill',
  lore:          'Lore',
};

const CATEGORY_COLORS: Record<string, string> = {
  faction:       '#88cc44',
  epic_precursor: '#ff9944',
  plane_access:  '#cc88ff',
  tradeskill:    '#66bbff',
  lore:          '#ffdd77',
};

export function QuestsPanel() {
  const player          = useGameStore((s) => s.player);
  const activeQuests    = useGameStore((s) => s.activeQuests);
  const completedQuests = useGameStore((s) => s.completedQuests);
  const currentZone     = useGameStore((s) => s.currentZone);
  const beginQuest      = useGameStore((s) => s.beginQuest);
  const dropQuest       = useGameStore((s) => s.dropQuest);

  const [tab, setTab] = useState<QuestTab>('active');

  const availableQuests = getAvailableQuests(
    player.level,
    completedQuests,
    activeQuests,
    currentZone.id,
  );

  function tabCount(t: QuestTab) {
    if (t === 'active')    return activeQuests.length;
    if (t === 'available') return availableQuests.length;
    return completedQuests.length;
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', display: 'flex', flexDirection: 'column' }}>
      <EQPanelHeader title="QUEST LOG" />

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--eq-border)', padding: '0 4px' }}>
        {(['active', 'available', 'completed'] as QuestTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '4px 2px',
              fontSize: '9px',
              fontWeight: tab === t ? 'bold' : 'normal',
              color: tab === t ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
              backgroundColor: tab === t ? '#2a1f0a' : 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--eq-gold)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {t === 'active'    ? 'Active'
            : t === 'available' ? 'Available'
            : 'Completed'} ({tabCount(t)})
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── ACTIVE tab ────────────────────────────────────────── */}
        {tab === 'active' && (
          <div>
            {activeQuests.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--eq-text-dim)', fontSize: '11px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📜</div>
                <div>No active quests.</div>
                <div style={{ marginTop: '4px', fontSize: '9px' }}>
                  Check the Available tab to find quests near your level.
                </div>
              </div>
            ) : (
              activeQuests.map((aq) => {
                const quest = QUESTS[aq.questId];
                if (!quest) return null;
                const catColor = CATEGORY_COLORS[quest.category] ?? '#aaa';
                const progress = (aq.stepIndex / quest.steps.length) * 100;

                return (
                  <div
                    key={aq.questId}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid var(--eq-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--eq-text)' }}>
                          {quest.name}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            color: catColor,
                            marginTop: '1px',
                          }}
                        >
                          {CATEGORY_LABELS[quest.category] ?? quest.category}
                        </div>
                      </div>
                      <button
                        onClick={() => dropQuest(aq.questId)}
                        title="Abandon quest"
                        style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          backgroundColor: '#2a0a0a',
                          color: '#cc4444',
                          border: '1px solid #662222',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          marginLeft: '6px',
                          flexShrink: 0,
                        }}
                      >
                        Abandon
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        marginTop: '5px',
                        height: '4px',
                        backgroundColor: '#222',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          backgroundColor: catColor,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginTop: '2px' }}>
                      Step {aq.stepIndex + 1} / {quest.steps.length}
                    </div>

                    {/* Current step */}
                    <div
                      style={{
                        marginTop: '5px',
                        padding: '4px 6px',
                        backgroundColor: '#1a1510',
                        borderRadius: '3px',
                        fontSize: '10px',
                        color: 'var(--eq-text)',
                        border: '1px solid var(--eq-border)',
                      }}
                    >
                      {getCurrentStepDescription(aq)}
                    </div>

                    {/* Reward preview */}
                    {quest.rewards && (
                      <div style={{ marginTop: '4px', fontSize: '9px', color: '#888' }}>
                        Reward:{' '}
                        {quest.rewards.xp ? `${quest.rewards.xp.toLocaleString()} XP` : ''}
                        {quest.rewards.currency?.pp ? ` · ${quest.rewards.currency.pp}pp` : ''}
                        {quest.rewards.itemIds?.length ? ` · ${quest.rewards.itemIds.length} item(s)` : ''}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── AVAILABLE tab ─────────────────────────────────────── */}
        {tab === 'available' && (
          <div>
            {availableQuests.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--eq-text-dim)', fontSize: '11px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                <div>No quests available at your level.</div>
                <div style={{ marginTop: '4px', fontSize: '9px' }}>
                  Level up, complete prerequisites, or explore new zones.
                </div>
              </div>
            ) : (
              availableQuests.map((quest) => {
                const catColor = CATEGORY_COLORS[quest.category] ?? '#aaa';
                return (
                  <div
                    key={quest.id}
                    style={{ padding: '8px', borderBottom: '1px solid var(--eq-border)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--eq-text)' }}>
                          {quest.name}
                        </div>
                        <div style={{ fontSize: '9px', color: catColor, marginTop: '1px' }}>
                          {CATEGORY_LABELS[quest.category]} · Min L{quest.minLevel}
                          {quest.npcName ? ` · NPC: ${quest.npcName}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => beginQuest(quest.id)}
                        style={{
                          fontSize: '9px',
                          padding: '2px 7px',
                          backgroundColor: '#2a1f0a',
                          color: 'var(--eq-gold)',
                          border: '1px solid var(--eq-border)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          marginLeft: '6px',
                          flexShrink: 0,
                        }}
                      >
                        Accept
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginTop: '5px', lineHeight: 1.4 }}>
                      {quest.description}
                    </div>
                    <div style={{ fontSize: '9px', color: '#666', marginTop: '3px' }}>
                      {quest.steps.length} step{quest.steps.length !== 1 ? 's' : ''} ·{' '}
                      {quest.rewards.xp ? `${quest.rewards.xp.toLocaleString()} XP` : 'No XP'}
                      {quest.rewards.currency?.pp ? ` · ${quest.rewards.currency.pp}pp` : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── COMPLETED tab ─────────────────────────────────────── */}
        {tab === 'completed' && (
          <div>
            {completedQuests.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--eq-text-dim)', fontSize: '11px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
                <div>No completed quests yet.</div>
              </div>
            ) : (
              completedQuests.map((questId) => {
                const quest = QUESTS[questId];
                const catColor = CATEGORY_COLORS[quest?.category ?? ''] ?? '#aaa';
                return (
                  <div
                    key={questId}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid var(--eq-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: '#44aa44', fontSize: '12px' }}>✓</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--eq-text)' }}>
                        {quest?.name ?? questId}
                      </div>
                      {quest && (
                        <div style={{ fontSize: '9px', color: catColor }}>
                          {CATEGORY_LABELS[quest.category]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Faction summary hint */}
      {tab === 'available' && (
        <div
          style={{
            padding: '6px 8px',
            borderTop: '1px solid var(--eq-border)',
            fontSize: '9px',
            color: 'var(--eq-text-dim)',
            textAlign: 'center',
          }}
        >
          Some quests require faction standing. Check your faction tab.
        </div>
      )}
    </div>
  );
}
