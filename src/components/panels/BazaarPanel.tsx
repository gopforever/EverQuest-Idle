import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import { formatCurrency, toCopperTotal } from '../../engine/bazaar';
import type { TradeskillName } from '../../types';

type BazaarTab = 'browse' | 'listings';
type SortKey = 'price_asc' | 'price_desc' | 'name';

type CategoryFilter = TradeskillName | 'loot' | 'misc' | 'All';

const CATEGORIES: CategoryFilter[] = [
  'All', 'loot', 'Blacksmithing', 'Tailoring', 'Baking', 'Brewing',
  'Jewelcrafting', 'Pottery', 'Fletching', 'Fishing', 'Tinkering', 'misc',
];

export function BazaarPanel() {
  const player = useGameStore((s) => s.player);
  const bazaar = useGameStore((s) => s.bazaar);
  const buyFromBazaar = useGameStore((s) => s.buyFromBazaar);
  const listItemOnBazaar = useGameStore((s) => s.listItemOnBazaar);
  const cancelBazaarListing = useGameStore((s) => s.cancelBazaarListing);

  const [activeTab, setActiveTab] = useState<BazaarTab>('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('price_asc');

  // List Item form state
  const [selectedInvSlot, setSelectedInvSlot] = useState<number>(-1);
  const [listPrice, setListPrice] = useState('');

  const playerCopperTotal = toCopperTotal(player.currency);
  const playerCurrencyStr = formatCurrency(playerCopperTotal);

  // Filtered and sorted browse listings (exclude player's own)
  const filteredListings = useMemo(() => {
    let result = bazaar.listings.filter((l) => l.sellerId !== 'player');
    if (search) {
      result = result.filter((l) =>
        l.itemName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== 'All') {
      result = result.filter((l) => l.category === category);
    }
    switch (sortKey) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
    }
    return result;
  }, [bazaar.listings, search, category, sortKey]);

  const myListings = bazaar.listings.filter((l) => l.sellerId === 'player');

  // Inventory items available to list (non-null slots)
  const listableItems = player.inventory
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => item !== null);

  const handleBuy = (listingId: string) => {
    buyFromBazaar(listingId, 1);
  };

  const handleList = () => {
    const price = parseInt(listPrice, 10);
    if (selectedInvSlot < 0 || isNaN(price) || price <= 0) return;
    listItemOnBazaar(selectedInvSlot, price, 1);
    setSelectedInvSlot(-1);
    setListPrice('');
  };

  const tabStyle = (tab: BazaarTab): React.CSSProperties => ({
    color: activeTab === tab ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--eq-gold)' : '2px solid transparent',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
  });

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#0d0b08',
    border: '1px solid var(--eq-border)',
    color: 'var(--eq-text)',
    padding: '2px 6px',
    fontSize: '11px',
    borderRadius: '2px',
    fontFamily: 'inherit',
  };

  const btnStyle = (disabled?: boolean): React.CSSProperties => ({
    backgroundColor: disabled ? '#111' : '#2a1f0a',
    border: `1px solid ${disabled ? '#333' : 'var(--eq-border)'}`,
    color: disabled ? 'var(--eq-text-dim)' : 'var(--eq-gold)',
    padding: '1px 6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '10px',
    fontFamily: 'inherit',
    borderRadius: '1px',
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', fontSize: '11px' }}>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        <button style={tabStyle('browse')} onClick={() => setActiveTab('browse')}>
          Browse
        </button>
        <button style={tabStyle('listings')} onClick={() => setActiveTab('listings')}>
          My Listings
        </button>
      </div>

      {/* BROWSE TAB */}
      {activeTab === 'browse' && (
        <div>
          <EQPanelHeader title="BAZAAR — BROWSE" />

          {/* Search + filters */}
          <div className="p-2 space-y-1">
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            />
            <div className="flex gap-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryFilter)}
                style={{ ...inputStyle, flex: 1 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div
            className="px-2 pb-1"
            style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}
          >
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            &nbsp;·&nbsp;Balance: <span style={{ color: 'var(--eq-gold)' }}>{playerCurrencyStr}</span>
          </div>

          {/* Listings table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1510' }}>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'left', fontWeight: 'normal', fontSize: '10px' }}>Item</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'left', fontWeight: 'normal', fontSize: '10px' }}>Seller</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'center', fontWeight: 'normal', fontSize: '10px' }}>Qty</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'right', fontWeight: 'normal', fontSize: '10px' }}>Price ea.</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'right', fontWeight: 'normal', fontSize: '10px' }}>Total</th>
                  <th style={{ padding: '2px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => {
                  const canAfford = playerCopperTotal >= listing.pricePerUnit;
                  const totalPrice = listing.pricePerUnit * listing.quantity;
                  return (
                    <tr
                      key={listing.id}
                      style={{ borderBottom: '1px solid #1a1510', opacity: canAfford ? 1 : 0.6 }}
                    >
                      <td style={{ padding: '2px 4px' }}>{listing.itemName}</td>
                      <td style={{ padding: '2px 4px', color: 'var(--eq-text-dim)' }}>{listing.sellerName}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'center' }}>{listing.quantity}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right', color: 'var(--eq-gold)' }}>
                        {formatCurrency(listing.pricePerUnit)}
                      </td>
                      <td style={{ padding: '2px 4px', textAlign: 'right', color: 'var(--eq-text-dim)' }}>
                        {formatCurrency(totalPrice)}
                      </td>
                      <td style={{ padding: '2px 4px' }}>
                        <button
                          onClick={() => handleBuy(listing.id)}
                          disabled={!canAfford}
                          style={btnStyle(!canAfford)}
                        >
                          [BUY]
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredListings.length === 0 && (
              <div className="text-center p-4" style={{ color: 'var(--eq-text-dim)' }}>
                No items match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div>
          <EQPanelHeader title="MY LISTINGS" />

          {/* Balance */}
          <div className="px-2 pt-1 pb-2" style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}>
            Balance: <span style={{ color: 'var(--eq-gold)' }}>{playerCurrencyStr}</span>
          </div>

          {/* Active listings */}
          {myListings.length === 0 ? (
            <div className="text-xs text-center p-2" style={{ color: 'var(--eq-text-dim)' }}>
              You have no active listings.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a1510' }}>
                    <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'left', fontWeight: 'normal', fontSize: '10px' }}>Item</th>
                    <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'center', fontWeight: 'normal', fontSize: '10px' }}>Qty</th>
                    <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'right', fontWeight: 'normal', fontSize: '10px' }}>Price</th>
                    <th style={{ padding: '2px 4px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {myListings.map((listing) => (
                    <tr key={listing.id} style={{ borderBottom: '1px solid #1a1510' }}>
                      <td style={{ padding: '2px 4px' }}>{listing.itemName}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'center' }}>{listing.quantity}</td>
                      <td style={{ padding: '2px 4px', textAlign: 'right', color: 'var(--eq-gold)' }}>
                        {formatCurrency(listing.pricePerUnit)}
                      </td>
                      <td style={{ padding: '2px 4px' }}>
                        <button
                          onClick={() => cancelBazaarListing(listing.id)}
                          style={btnStyle(false)}
                        >
                          [CANCEL]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* List new item */}
          <EQPanelHeader title="LIST AN ITEM" />
          <div className="p-2 space-y-1">
            <select
              value={selectedInvSlot}
              onChange={(e) => setSelectedInvSlot(Number(e.target.value))}
              style={{ ...inputStyle, width: '100%' }}
            >
              <option value={-1}>— Select item from inventory —</option>
              {listableItems.map(({ item, idx }) => (
                <option key={idx} value={idx}>
                  {item!.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                placeholder="Price (copper)"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={handleList}
                disabled={selectedInvSlot < 0 || !listPrice}
                style={{
                  ...btnStyle(selectedInvSlot < 0 || !listPrice),
                  padding: '2px 10px',
                  fontSize: '11px',
                }}
              >
                [LIST]
              </button>
            </div>
            <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>
              Price is in copper. 10cp = 1sp, 10sp = 1gp, 10gp = 1pp
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

