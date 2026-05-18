import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = ({ artworks, setArtworks, transformation, setTransformation, pricing, setPricing, user, clientRequests, updateRequest }) => {
  return (
    <div className="admin-page-container">
      <AdminDashboard 
        artworks={artworks} 
        setArtworks={setArtworks} 
        transformation={transformation}
        setTransformation={setTransformation}
        pricing={pricing}
        setPricing={setPricing}
        user={user}
        clientRequests={clientRequests}
        updateRequest={updateRequest}
      />
    </div>
  );
};

export default AdminPage;
