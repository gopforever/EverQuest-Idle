// Procedurally generated EQ-style ghost names using prefix + suffix combinations.
// 30 prefixes × 30 suffixes = 900 unique names — more than enough for 100 ghosts.

const PREFIXES: readonly string[] = [
  'Tal', 'Brok', 'Ser', 'Grim', 'Yal', 'Storm', 'Moon', 'Dark', 'Silver', 'Iron',
  'Ash', 'Stone', 'Wind', 'Shadow', 'Dawn', 'Blood', 'Frost', 'Ember', 'Night', 'Dusk',
  'Raven', 'Thunder', 'Gale', 'Thorn', 'Mist', 'Cinder', 'Vex', 'Zar', 'Quil', 'Bryn',
];

const SUFFIXES: readonly string[] = [
  'indra', 'okk', 'enaya', 'tooth', 'ara', 'forge', 'whisper', 'claw', 'veil', 'paw',
  'hammer', 'runner', 'blade', 'seeker', 'mane', 'weave', 'fall', 'caller', 'shade', 'wing',
  'fang', 'strike', 'heart', 'soul', 'bane', 'reap', 'zul', 'wyn', 'lok', 'rin',
];

/**
 * Generate a unique EverQuest-style ghost name for the given index.
 * The name is derived deterministically from index using prefix/suffix combinations,
 * guaranteeing no repeats across the first 900 ghosts.
 */
export function generateGhostName(index: number): string {
  const prefixIndex = index % PREFIXES.length;
  const suffixIndex = Math.floor(index / PREFIXES.length) % SUFFIXES.length;
  return PREFIXES[prefixIndex] + SUFFIXES[suffixIndex];
}
