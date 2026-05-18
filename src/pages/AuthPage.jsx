import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import './AuthPage.css';

const AuthPage = ({ login, signup, loginWithGoogle }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Google Auth configuration states
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [showGoogleSetupInfo, setShowGoogleSetupInfo] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Fetch Google Client ID and initialize Google script
  useEffect(() => {
    const fetchClientIdAndSetup = async () => {
      try {
        const { clientId } = await api.getGoogleClientId();
        if (clientId) {
          setGoogleClientId(clientId);
          
          // Check if Google GSI client is already loaded, otherwise load it dynamically
          if (window.google) {
            setIsGoogleScriptLoaded(true);
          } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => setIsGoogleScriptLoaded(true);
            document.body.appendChild(script);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Google Client ID from backend:", err);
      }
    };
    fetchClientIdAndSetup();
  }, []);

  // Initialize and render Google Sign-In Button when script and ID are loaded
  useEffect(() => {
    if (isGoogleScriptLoaded && googleClientId && googleBtnContainerRef.current) {
      try {
        /* global google */
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(
          googleBtnContainerRef.current,
          {
            type: 'standard',
            theme: 'filled_dark',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: googleBtnContainerRef.current.offsetWidth || 340
          }
        );
      } catch (err) {
        console.error("Google Sign-In button render failed:", err);
      }
    }
  }, [isGoogleScriptLoaded, googleClientId, isLogin]); // Re-render when switching tabs to ensure div is present!

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(response.credential);
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/order');
        }
      } else {
        setError('Google Authentication was rejected by the server.');
      }
    } catch (err) {
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const user = await login(formData.username, formData.password);
        if (user) {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/order');
          }
        } else {
          setError('Invalid username or password.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters.');
          setIsSubmitting(false);
          return;
        }
        
        const result = await signup(formData.username, formData.password);
        if (result.success) {
          navigate('/order');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
            disabled={isSubmitting}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
            disabled={isSubmitting}
          >
            Sign Up
          </button>
        </div>

        <h2 className="serif auth-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Access your dashboard and manage your orders.' 
            : 'Join our community of art lovers and get your custom sketch.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username (Email if using Google)</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Enter username or email"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          
          <button type="submit" className="btn-primary w-full mt-1" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {/* Dynamic Google Login Section */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="google-auth-section">
          {googleClientId ? (
            <div 
              ref={googleBtnContainerRef} 
              id="google-signin-button" 
              className="google-signin-btn-container"
              style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}
            ></div>
          ) : (
            <div className="google-setup-warning glass" onClick={() => setShowGoogleSetupInfo(!showGoogleSetupInfo)}>
              <span className="warning-icon">🔑</span>
              <div className="warning-content">
                <p className="warning-title">Google Login Available</p>
                <p className="warning-desc">Click here for developer setup instructions.</p>
              </div>
            </div>
          )}

          {showGoogleSetupInfo && (
            <div className="google-setup-details glass-dark mt-1 animate-fade-in" style={{ padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'left', border: '1px solid rgba(215, 180, 106, 0.2)' }}>
              <p style={{ color: '#d7b46a', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔧 Google Sign-In Setup Guide:</p>
              <ol style={{ paddingLeft: '1.2rem', color: '#ccc', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d7b46a', textDecoration: 'underline' }}>Google Cloud Console</a>.</li>
                <li>Create a project and set up your <strong>OAuth Consent Screen</strong>.</li>
                <li>Create an <strong>OAuth Client ID</strong> (Web Application).</li>
                <li>Add <code>http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong>.</li>
                <li>Copy the Client ID and add it in your <code>server/.env</code> file as:
                  <code style={{ display: 'block', background: '#111', padding: '0.3rem', borderRadius: '4px', margin: '0.3rem 0', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.05)' }}>GOOGLE_CLIENT_ID=your_google_client_id_here</code>
                </li>
                <li>Restart your server!</li>
              </ol>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p className="text-dim">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="auth-link" 
              onClick={() => { if (!isSubmitting) setIsLogin(!isLogin); }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
          {isLogin && <p className="hint-text mt-1">Try admin / admin123</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
