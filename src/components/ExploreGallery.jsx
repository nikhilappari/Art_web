import React, { useMemo, useState } from 'react';
import ArtworkCard from './ArtworkCard';
import ArtworkDetail from './ArtworkDetail';
import './Gallery.css';

const ExploreGallery = ({ artworks = [] }) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState(null);

  const normalized = useMemo(() => (artworks || []).map(a => ({ ...a })), [artworks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = normalized.filter(a => {
      if (!q) return true;
      return (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q);
    });

    if (sortBy === 'price-asc') list = list.sort((x,y) => (x.price||0) - (y.price||0));
    else if (sortBy === 'price-desc') list = list.sort((x,y) => (y.price||0) - (x.price||0));
    else list = list.sort((x,y) => (y.id||0) - (x.id||0));
    return list;
  }, [normalized, query, sortBy]);

  return (
    <section className="gallery-section section-padding" id="explore">
      <div className="container">
        <div className="gallery-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="section-title">Explore All Artworks</h2>
            <p className="text-dim">Browse the complete collection in one place — search, filter and sort.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input className="search-input" placeholder="Search by title, category or description" value={query} onChange={e => setQuery(e.target.value)} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div className="artwork-grid">
          {filtered.length > 0 ? (
            filtered.map(art => (
              <div key={art.id} onClick={() => setSelected(art)}>
                <ArtworkCard artwork={art} />
              </div>
            ))
          ) : (
            <div className="empty-gallery glass">
              <p>No artworks found for your search.</p>
            </div>
          )}
        </div>

        <ArtworkDetail artwork={selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default ExploreGallery;
