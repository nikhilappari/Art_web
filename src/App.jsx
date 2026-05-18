import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { artworks as initialArtworks } from './data/artworks';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import OrderPage from './pages/OrderPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  const [artworks, setArtworks] = useState(() => {
    const saved = localStorage.getItem('artworks');
    return saved ? JSON.parse(saved) : [];
  });

  const [transformation, setTransformation] = useState(() => {
    const saved = localStorage.getItem('transformation');
    return saved ? JSON.parse(saved) : {
      before: '',
      after: '',
      title: 'The Transformation',
      subtitle: 'See how we turn your favorite memories into hand-drawn masterpieces.'
    };
  });

  const [pricing, setPricing] = useState(() => {
    const saved = localStorage.getItem('pricing');
    return saved ? JSON.parse(saved) : {
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
      frameA3Premium: '700'
    };
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    const initialUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' }
    ];
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [clientRequests, setClientRequests] = useState(() => {
    const saved = localStorage.getItem('clientRequests');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync users to localStorage
  React.useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Sync currentUser to localStorage
  React.useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync clientRequests to localStorage
  React.useEffect(() => {
    localStorage.setItem('clientRequests', JSON.stringify(clientRequests));
  }, [clientRequests]);

  const addRequest = (requestData) => {
    const newRequest = {
      ...requestData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setClientRequests(prev => [newRequest, ...prev]);
  };

  const updateRequest = (updatedRequest) => {
    setClientRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
  };

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const signup = (username, password) => {
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists.' };
    }
    const newUser = { username, password, role: 'user' };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ... (previous useEffects for artworks, transformation, pricing)
  React.useEffect(() => {
    try {
      localStorage.setItem('artworks', JSON.stringify(artworks));
    } catch (e) {
      console.error("Failed to save artworks to localStorage:", e);
    }
  }, [artworks]);

  React.useEffect(() => {
    try {
      localStorage.setItem('transformation', JSON.stringify(transformation));
    } catch (e) {
      console.error("Failed to save transformation to localStorage:", e);
    }
  }, [transformation]);

  React.useEffect(() => {
    try {
      localStorage.setItem('pricing', JSON.stringify(pricing));
    } catch (e) {
      console.error("Failed to save pricing to localStorage:", e);
    }
  }, [pricing]);

  return (
    <Router>
      <div className="app">
        <Navbar user={currentUser} logout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage transformation={transformation} pricing={pricing} addRequest={addRequest} user={currentUser} />} />
            <Route path="/gallery" element={<GalleryPage artworks={artworks} />} />
            <Route path="/auth" element={<AuthPage login={login} signup={signup} />} />
            
            <Route path="/admin" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <AdminPage 
                  artworks={artworks} 
                  setArtworks={setArtworks} 
                  transformation={transformation} 
                  setTransformation={setTransformation}
                  pricing={pricing}
                  setPricing={setPricing}
                  user={currentUser}
                  clientRequests={clientRequests}
                  updateRequest={updateRequest}
                />
              </ProtectedRoute>
            } />

            <Route path="/order" element={<OrderPage user={currentUser} pricing={pricing} addRequest={addRequest} clientRequests={clientRequests} updateRequest={updateRequest} />} />
          </Routes>
        </main>
        <WhatsAppButton />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
