import React, { useEffect } from 'react';
import ArtworksGrid from '../components/ArtworksGrid';

const ArtworksPage = ({ artworks }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="gallery-page page-fade-in">
      <div style={{ height: '80px' }}></div> {/* Spacer for fixed navbar */}
      <ArtworksGrid artworks={artworks} />
    </div>
  );
};

export default ArtworksPage;
