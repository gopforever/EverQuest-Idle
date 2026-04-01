import type { FactionStandingName } from '../types';
import { FACTIONS, getFactionStandingName, isFactionHostile } from '../data/factions';

/**
 * Apply faction changes when a monster is killed.
 * Returns a new standings Record with all deltas applied (including linked faction cascades).
 */
export function applyKillFactionChanges(
  monsterId: string,
  currentStandings: Record<string, number>,
  primaryDelta: number = -10,
): Record<string, number> {
  const updated = { ...currentStandings };

  for (const faction of Object.values(FACTIONS)) {
    // Lower factions that list this monster as a member
    const isKilledBy = faction.killedBy?.includes(monsterId);
    const raisesBy   = faction.raisedByKilling?.includes(monsterId);

    if (!isKilledBy && !raisesBy) continue;

    const delta = isKilledBy ? primaryDelta : Math.abs(primaryDelta);

    // Apply to this faction
    updated[faction.id] = clamp((updated[faction.id] ?? faction.defaultValue) + delta);

    // Cascade to linked factions
    for (const link of faction.linkedFactions ?? []) {
      const linkedDelta = Math.round(delta * link.modifier);
      updated[link.factionId] = clamp(
        (updated[link.factionId] ?? (FACTIONS[link.factionId]?.defaultValue ?? 0)) + linkedDelta,
      );
    }
  }

  return updated;
}

/**
 * Apply explicit faction changes (from quests, events, etc.)
 */
export function applyFactionChanges(
  changes: { factionId: string; amount: number }[],
  currentStandings: Record<string, number>,
): Record<string, number> {
  const updated = { ...currentStandings };
  for (const { factionId, amount } of changes) {
    const faction = FACTIONS[factionId];
    const base = updated[factionId] ?? faction?.defaultValue ?? 0;
    updated[factionId] = clamp(base + amount);

    // Cascade linked factions
    for (const link of faction?.linkedFactions ?? []) {
      const linkedDelta = Math.round(amount * link.modifier);
      updated[link.factionId] = clamp(
        (updated[link.factionId] ?? (FACTIONS[link.factionId]?.defaultValue ?? 0)) + linkedDelta,
      );
    }
  }
  return updated;
}

/** Get a human-readable summary of a faction standing */
export function getFactionSummary(factionId: string, value: number): string {
  const faction = FACTIONS[factionId];
  const standing = getFactionStandingName(value);
  return `${faction?.name ?? factionId}: ${standing} (${value > 0 ? '+' : ''}${value})`;
}

/** Check if a given monster ID would be KOS (kill on sight) based on faction */
export function isMonsterKOS(monsterId: string, standings: Record<string, number>): boolean {
  for (const faction of Object.values(FACTIONS)) {
    if (faction.killedBy?.includes(monsterId)) {
      const value = standings[faction.id] ?? faction.defaultValue;
      if (isFactionHostile(value)) return true;
    }
  }
  return false;
}

/** Get the standing name for a specific faction */
export function getStandingForFaction(
  factionId: string,
  standings: Record<string, number>,
): FactionStandingName {
  const faction = FACTIONS[factionId];
  const value = standings[factionId] ?? faction?.defaultValue ?? 0;
  return getFactionStandingName(value);
}

/** Get ALL faction standings sorted by standing value (descending) */
export function getSortedFactionStandings(
  standings: Record<string, number>,
): Array<{ id: string; name: string; value: number; standing: FactionStandingName }> {
  return Object.entries(FACTIONS)
    .map(([id, faction]) => ({
      id,
      name: faction.name,
      value: standings[id] ?? faction.defaultValue,
      standing: getFactionStandingName(standings[id] ?? faction.defaultValue),
    }))
    .sort((a, b) => b.value - a.value);
}

function clamp(v: number): number {
  return Math.max(-2000, Math.min(2000, Math.round(v)));
}
