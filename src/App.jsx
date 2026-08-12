import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import ArtworksPage from './pages/ArtworksPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import OrderPage from './pages/OrderPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import SocialButtons from './components/SocialButtons';
import { api } from './utils/api';

function App() {
  const [artworks, setArtworks] = useState([]);
  const [transformation, setTransformation] = useState({
    before: '',
    after: '',
    title: 'The Transformation',
    subtitle: 'See how we turn your favorite memories into hand-drawn masterpieces.'
  });
  const [pricing, setPricing] = useState({
    charcoalA4: '1500',
    charcoalA3: '2500',
    charcoalCouple: '3500',
    graphiteA4: '1500',
    graphiteA3: '2500',
    graphiteCouple: '3500',
    colorA4: '2200',
    colorA3: '3200',
    colorCouple: '4500',
    frameA4Normal: '300',
    frameA4Premium: '500',
    frameA3Normal: '500',
    frameA3Premium: '700',
    cloudinaryCloudName: '',
    cloudinaryUploadPreset: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load data from backend
  useEffect(() => {
    const loadAppData = async () => {
      try {
        // 1. Check if token exists to resume session
        const token = localStorage.getItem('token');
        let activeUser = null;
        if (token) {
          try {
            const data = await api.get('/api/auth/me');
            setCurrentUser(data.user);
            activeUser = data.user;
          } catch (err) {
            console.error("Token verification failed, logging out:", err);
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        }

        // 2. Fetch artworks, transformation settings, and pricing settings
        const [loadedArtworks, loadedTransformation, loadedPricing] = await Promise.all([
          api.get('/api/artworks'),
          api.get('/api/transformation'),
          api.get('/api/pricing')
        ]);

        setArtworks(loadedArtworks);
        if (loadedTransformation && loadedTransformation.before) {
          setTransformation(loadedTransformation);
        }
        if (loadedPricing) {
          setPricing(prev => ({ ...prev, ...loadedPricing }));
        }

        // 3. Fetch user orders if logged in
        if (activeUser) {
          const loadedRequests = await api.get('/api/requests');
          setClientRequests(loadedRequests);
        }
      } catch (error) {
        console.error("Failed to load backend data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppData();
  }, []);

  // Sync clientRequests and set up polling when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // Fetch immediately
      api.get('/api/requests')
        .then(data => setClientRequests(data))
        .catch(err => console.error("Failed to fetch requests:", err));

      // Setup polling every 5 seconds for real-time messages
      const interval = setInterval(() => {
        api.get('/api/requests')
          .then(data => setClientRequests(data))
          .catch(err => console.error("Failed to fetch requests:", err));
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setClientRequests([]);
    }
  }, [currentUser]);

  // Intercept setter for artworks to trigger backend calls
  const handleSetArtworks = async (valueOrUpdater) => {
    let nextArtworks;
    if (typeof valueOrUpdater === 'function') {
      nextArtworks = valueOrUpdater(artworks);
    } else {
      nextArtworks = valueOrUpdater;
    }

    // Determine what operation was executed
    if (nextArtworks.length < artworks.length) {
      // DELETE operation
      const deleted = artworks.find(a => !nextArtworks.some(na => na.id === a.id));
      if (deleted) {
        try {
          await api.delete(`/api/artworks/${deleted.id}`);
        } catch (e) {
          console.error("Failed to delete artwork:", e);
        }
      }
    } else if (nextArtworks.length > artworks.length) {
      // ADD operation
      const added = nextArtworks.find(na => !artworks.some(a => a.id === na.id));
      if (added) {
        try {
          const savedArt = await api.post('/api/artworks', added);
          // Set state with the actual backend returned object (containing database id)
          setArtworks(prev => [...prev.filter(a => a.id !== added.id), savedArt]);
          return;
        } catch (e) {
          console.error("Failed to save new artwork:", e);
        }
      }
    } else {
      // UPDATE operation
      const updated = nextArtworks.find(na => {
        const old = artworks.find(a => a.id === na.id);
        return old && JSON.stringify(old) !== JSON.stringify(na);
      });
      if (updated) {
        try {
          const savedArt = await api.put(`/api/artworks/${updated.id}`, updated);
          setArtworks(prev => prev.map(a => a.id === updated.id ? savedArt : a));
          return;
        } catch (e) {
          console.error("Failed to update artwork:", e);
        }
      }
    }

    setArtworks(nextArtworks);
  };

  // Save actions triggered by the Admin Dashboard save buttons
  const saveTransformation = async (newTrans) => {
    const saved = await api.put('/api/transformation', newTrans);
    setTransformation(saved);
  };

  const savePricing = async (newPricing) => {
    const saved = await api.put('/api/pricing', newPricing);
    setPricing(prev => ({ ...prev, ...saved }));
  };

  const addRequest = async (requestData) => {
    try {
      const created = await api.post('/api/requests', {
        type: requestData.style + ' (' + requestData.type + ', ' + requestData.size + ')',
        image: requestData.images[0] || '',
        images: requestData.images,
        price: requestData.price,
        frame: requestData.frame
      });
      setClientRequests(prev => [created, ...prev]);
    } catch (e) {
      alert("Failed to submit request: " + e.message);
    }
  };

  const updateRequest = async (updatedRequest) => {
    try {
      const saved = await api.put(`/api/requests/${updatedRequest.id}`, {
        status: updatedRequest.status,
        price: updatedRequest.price,
        frame: updatedRequest.frame,
        customerApproval: updatedRequest.customerApproval,
        adminNote: updatedRequest.adminNote,
        messages: updatedRequest.messages
      });
      setClientRequests(prev => prev.map(req => req.id === saved.id ? saved : req));
    } catch (e) {
      alert("Failed to update request: " + e.message);
    }
  };

  const reloadRequests = async () => {
    try {
      const loadedRequests = await api.get('/api/requests');
      setClientRequests(loadedRequests);
    } catch (e) {
      console.error("Failed to reload requests:", e);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (e) {
      alert("Login Failed: " + e.message);
      return null;
    }
  };

  const signup = async (username, password) => {
    try {
      const data = await api.post('/api/auth/signup', { username, password });
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const data = await api.loginWithGoogle(credential);
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (e) {
      alert("Google Login Failed: " + e.message);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setClientRequests([]);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#d7b46a', fontFamily: "'Tenor Sans', sans-serif" }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(215, 180, 106, 0.15)', borderTopColor: '#d7b46a', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
        <span style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Studio Nikhil Loading...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={currentUser} logout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage transformation={transformation} pricing={pricing} addRequest={addRequest} user={currentUser} />} />
            <Route path="/gallery" element={<GalleryPage artworks={artworks} />} />
            <Route path="/artworks" element={<ArtworksPage artworks={artworks} />} />
            <Route path="/auth" element={<AuthPage login={login} signup={signup} loginWithGoogle={loginWithGoogle} />} />
            
            <Route path="/admin" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <AdminPage 
                  artworks={artworks} 
                  setArtworks={handleSetArtworks} 
                  transformation={transformation} 
                  setTransformation={setTransformation}
                  saveTransformation={saveTransformation}
                  pricing={pricing}
                  setPricing={setPricing}
                  savePricing={savePricing}
                  user={currentUser}
                  clientRequests={clientRequests}
                  updateRequest={updateRequest}
                  reloadRequests={reloadRequests}
                />
              </ProtectedRoute>
            } />

            <Route path="/order" element={<OrderPage user={currentUser} pricing={pricing} addRequest={addRequest} clientRequests={clientRequests} updateRequest={updateRequest} />} />
          </Routes>
        </main>
        <SocialButtons />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
