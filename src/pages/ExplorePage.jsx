import React, { useEffect } from 'react';
import ExploreGallery from '../components/ExploreGallery';

const ExplorePage = ({ artworks }) => {
  useEffect(() => { window.scrollTo(0,0); }, []);
  return (
    <div className="explore-page">
      <div style={{ height: '80px' }}></div>
      <ExploreGallery artworks={artworks} />
    </div>
  );
};

export default ExplorePage;
