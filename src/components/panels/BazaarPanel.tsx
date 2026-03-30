import { useState } from 'react';

type BazaarTab = 'browse' | 'listings';

interface BazaarListing {
  id: number;
  seller: string;
  item: string;
  price: string;
  qty: number;
}

const STUB_LISTINGS: BazaarListing[] = [
  { id: 1, seller: 'Aelindra (Ghost)', item: 'Bone Chips', price: '1pp', qty: 20 },
  { id: 2, seller: 'Theron (Ghost)', item: 'Rusty Short Sword', price: '5pp', qty: 1 },
  { id: 3, seller: 'Morwyn (Ghost)', item: 'Fine Steel Dagger', price: '45pp', qty: 1 },
  { id: 4, seller: 'Keldrak (Ghost)', item: 'Banded Mail Tunic', price: '120pp', qty: 1 },
  { id: 5, seller: 'Sivel (Ghost)', item: 'Spider Silk', price: '2pp', qty: 10 },
  { id: 6, seller: 'Prixle (Ghost)', item: 'Gnomish Tinkering Kit', price: '250pp', qty: 1 },
  { id: 7, seller: 'Velara (Ghost)', item: 'Flowing Black Silk Sash', price: '800pp', qty: 1 },
  { id: 8, seller: 'Dorn (Ghost)', item: 'Orc Scalp', price: '1pp', qty: 50 },
  { id: 9, seller: 'Ysvaine (Ghost)', item: 'Words of Cazic-Thule', price: '35pp', qty: 3 },
  { id: 10, seller: 'Brak (Ghost)', item: 'Giant Snake Rattle', price: '15pp', qty: 5 },
];

export function BazaarPanel() {
  const [activeTab, setActiveTab] = useState<BazaarTab>('browse');
  const [search, setSearch] = useState('');

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

  const filteredListings = STUB_LISTINGS.filter((l) =>
    l.item.toLowerCase().includes(search.toLowerCase())
  );

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

      {activeTab === 'browse' && (
        <div>
          <div
            className="text-xs font-bold text-center py-1"
            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
          >
            BAZAAR — BROWSE
          </div>
          <div className="p-2">
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: '#0d0b08',
                border: '1px solid var(--eq-border)',
                color: 'var(--eq-text)',
                padding: '2px 6px',
                fontSize: '11px',
                borderRadius: '2px',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1510' }}>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'left', fontWeight: 'normal' }}>Seller</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'left', fontWeight: 'normal' }}>Item</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'right', fontWeight: 'normal' }}>Price</th>
                  <th style={{ padding: '2px 4px', color: 'var(--eq-text-dim)', textAlign: 'center', fontWeight: 'normal' }}>Qty</th>
                  <th style={{ padding: '2px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} style={{ borderBottom: '1px solid #1a1510' }}>
                    <td style={{ padding: '2px 4px', color: 'var(--eq-text-dim)' }}>{listing.seller}</td>
                    <td style={{ padding: '2px 4px' }}>{listing.item}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', color: 'var(--eq-gold)' }}>{listing.price}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'center' }}>{listing.qty}</td>
                    <td style={{ padding: '2px 4px' }}>
                      <button
                        onClick={() => undefined}
                        style={{
                          backgroundColor: 'var(--eq-panel)',
                          border: '1px solid var(--eq-border)',
                          color: 'var(--eq-text)',
                          padding: '1px 5px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontFamily: 'inherit',
                          borderRadius: '1px',
                        }}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
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

      {activeTab === 'listings' && (
        <div>
          <div
            className="text-xs font-bold text-center py-1"
            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
          >
            MY LISTINGS
          </div>
          <div className="p-4 text-center text-xs" style={{ color: 'var(--eq-text-dim)' }}>
            You have no active listings. Visit the Bazaar zone to set up a trader.
          </div>
        </div>
      )}
    </div>
  );
}
