import type { BazaarListing, GhostPlayer, TradeskillName } from '../types';
import { ITEMS } from '../data/items';

/** Convert copper amount to display string, e.g. "2pp 3gp 5sp 2cp" */
export function formatCurrency(copper: number): string {
  const pp = Math.floor(copper / 1000);
  const remainder1 = copper % 1000;
  const gp = Math.floor(remainder1 / 100);
  const remainder2 = remainder1 % 100;
  const sp = Math.floor(remainder2 / 10);
  const cp = remainder2 % 10;

  const parts: string[] = [];
  if (pp > 0) parts.push(`${pp}pp`);
  if (gp > 0) parts.push(`${gp}gp`);
  if (sp > 0) parts.push(`${sp}sp`);
  if (cp > 0) parts.push(`${cp}cp`);
  return parts.length > 0 ? parts.join(' ') : '0cp';
}

/** Convert currency object to total copper */
export function toCopperTotal(currency: {
  pp: number;
  gp: number;
  sp: number;
  cp: number;
}): number {
  return currency.pp * 1000 + currency.gp * 100 + currency.sp * 10 + currency.cp;
}

/**
 * Subtract copper amount from currency object.
 * Returns updated currency or null if insufficient funds.
 */
export function subtractCurrency(
  currency: { pp: number; gp: number; sp: number; cp: number },
  copperCost: number
): { pp: number; gp: number; sp: number; cp: number } | null {
  const total = toCopperTotal(currency);
  if (total < copperCost) return null;
  const remaining = total - copperCost;
  return {
    pp: Math.floor(remaining / 1000),
    gp: Math.floor((remaining % 1000) / 100),
    sp: Math.floor((remaining % 100) / 10),
    cp: remaining % 10,
  };
}

/** Base market prices in copper for common tradeskill items */
export const BASE_PRICES: Record<string, number> = {
  // Raw materials
  iron_ore: 50,
  cobalt_ore: 200,
  cobalt_bar: 300,
  blade_mold: 80,
  spiderling_silk: 30,
  large_leather_pelt: 80,
  silk: 100,
  bat_wing: 10,
  silver_bar: 120,
  gold_bar: 300,
  sapphire: 800,
  diamond: 2000,
  clay: 20,
  arrow_shaft: 8,
  feather: 5,
  gnomish_gear: 120,
  // Crafted results
  crude_iron_blade: 200,
  iron_bracers: 350,
  iron_chainmail: 500,
  iron_breastplate: 800,
  cobalt_sword: 2500,
  linen_cloak: 150,
  leather_tunic: 300,
  silk_robe: 800,
  iksar_scaled_robe: 2000,
  small_backpack: 200,
  silver_ring: 250,
  gold_ring: 500,
  sapphire_earring: 1500,
  diamond_bracelet: 3000,
  crude_arrow: 5,
  wooden_bow: 400,
  composite_bow: 1200,
  bat_wing_crunchies: 15,
  short_beer: 20,
  swiftness_tonic: 300,
  clarity_draught: 1200,
  clockwork_watch: 400,
  tinkered_goggles: 2000,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Determine the Bazaar category for an item */
function getItemCategory(itemId: string): TradeskillName | 'loot' | 'misc' {
  const item = ITEMS[itemId];
  if (!item) return 'misc';
  if (item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') {
    return 'loot';
  }
  if (item.type === 'jewelry') return 'Jewelcrafting';
  if (item.type === 'food') return 'Baking';
  if (item.type === 'drink') return 'Brewing';
  if (item.type === 'tradeskill') return 'misc';
  return 'misc';
}

/** Items Grinder/AFKFarmer ghosts commonly sell */
const GRINDER_LOOT_ITEMS = [
  'gnoll_fang',
  'bone_chips',
  'bat_wing',
  'fire_beetle_eye',
  'snake_meat',
  'feather',
  'spiderling_silk',
  'large_leather_pelt',
  'ruined_pelt',
];

/** Items Tradeskiller ghosts sell (crafted results) */
const TRADESKILLER_ITEMS = [
  'crude_iron_blade',
  'iron_bracers',
  'iron_chainmail',
  'iron_breastplate',
  'linen_cloak',
  'leather_tunic',
  'silk_robe',
  'silver_ring',
  'gold_ring',
  'crude_arrow',
  'wooden_bow',
  'bat_wing_crunchies',
  'short_beer',
];

/** Items Merchant ghosts sell (variety of goods) */
const MERCHANT_ITEMS = [
  ...GRINDER_LOOT_ITEMS,
  ...TRADESKILLER_ITEMS,
  'iron_ore',
  'silver_bar',
  'gold_bar',
  'clay',
  'thread',
  'dough',
];

/**
 * Generate Bazaar listings from online ghost players.
 * ~40% of online ghosts have 1–3 listings each.
 */
export function generateGhostListings(
  ghosts: GhostPlayer[],
  tick: number
): BazaarListing[] {
  const listings: BazaarListing[] = [];
  const onlineGhosts = ghosts.filter((g) => g.isOnline);

  for (const ghost of onlineGhosts) {
    // ~40% chance this ghost has listings
    if (Math.random() > 0.4) continue;

    const numListings = Math.floor(Math.random() * 3) + 1;
    let itemPool: string[];

    if (ghost.personality === 'Tradeskiller') {
      itemPool = TRADESKILLER_ITEMS;
    } else if (ghost.personality === 'Merchant') {
      itemPool = MERCHANT_ITEMS;
    } else {
      itemPool = GRINDER_LOOT_ITEMS;
    }

    for (let i = 0; i < numListings; i++) {
      const itemId = itemPool[Math.floor(Math.random() * itemPool.length)];
      const basePrice = BASE_PRICES[itemId] ?? 50;

      // Price fluctuation ±20% for Tradskillers, ±10% for others
      const fluctuation = ghost.personality === 'Tradeskiller' ? 0.2 : 0.1;
      const priceMod = 1 + (Math.random() * fluctuation * 2 - fluctuation);
      // Merchants list slightly below market
      const merchantDiscount = ghost.personality === 'Merchant' ? 0.9 : 1.0;
      const pricePerUnit = Math.max(1, Math.floor(basePrice * priceMod * merchantDiscount));

      const item = ITEMS[itemId];
      if (!item) continue;

      const quantity =
        item.stackable
          ? Math.floor(Math.random() * 20) + 1
          : 1;

      listings.push({
        id: generateId(),
        sellerId: ghost.id,
        sellerName: ghost.name,
        itemId,
        itemName: item.name,
        quantity,
        pricePerUnit,
        listedAt: tick,
        category: getItemCategory(itemId),
      });
    }
  }

  return listings;
}

/**
 * Refresh Bazaar listings.
 * Called every ~10 game ticks. Replaces ghost listings with fresh ones
 * and applies ±10% price fluctuation to retained listings.
 */
export function refreshBazaarListings(
  currentListings: BazaarListing[],
  ghosts: GhostPlayer[],
  tick: number
): BazaarListing[] {
  // Keep player listings (sellerId === 'player'), discard ghost listings
  const playerListings = currentListings.filter((l) => l.sellerId === 'player');

  // Generate fresh ghost listings
  const ghostListings = generateGhostListings(ghosts, tick);

  return [...playerListings, ...ghostListings];
}
