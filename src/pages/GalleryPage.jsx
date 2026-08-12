import React, { useEffect } from 'react';
import Gallery from '../components/Gallery';

const GalleryPage = ({ artworks }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="gallery-page module-fade-in">
      <div style={{ height: '80px' }}></div> {/* Spacer for fixed navbar */}
      <Gallery artworks={artworks} />
    </div>
  );
};

export default GalleryPage;
