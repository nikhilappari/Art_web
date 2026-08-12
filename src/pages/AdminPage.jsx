import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = ({ artworks, setArtworks, transformation, setTransformation, saveTransformation, pricing, setPricing, savePricing, user, clientRequests, updateRequest, reloadRequests }) => {
  return (
    <div className="admin-page-container module-fade-in">
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
        reloadRequests={reloadRequests}
      />
    </div>
  );
};

export default AdminPage;
