import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = ({ artworks, setArtworks, transformation, setTransformation, saveTransformation, pricing, setPricing, savePricing, user, clientRequests, updateRequest }) => {
  return (
    <div className="admin-page-container">
      <AdminDashboard 
        artworks={artworks} 
        setArtworks={setArtworks} 
        transformation={transformation}
        setTransformation={setTransformation}
        saveTransformation={saveTransformation}
        pricing={pricing}
        setPricing={setPricing}
        savePricing={savePricing}
        user={user}
        clientRequests={clientRequests}
        updateRequest={updateRequest}
      />
    </div>
  );
};

export default AdminPage;
