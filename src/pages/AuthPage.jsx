import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import './AuthPage.css';

const AuthPage = ({ login, signup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";




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
        console.log('Attempting login with username:', formData.username);
        const user = await login(formData.username, formData.password);
        if (user) {
          console.log('Login successful, user:', user);
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
        
        console.log('Attempting signup with username:', formData.username);
        const result = await signup(formData.username, formData.password);
        if (result.success) {
          console.log('Signup successful');
          navigate('/order');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
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
            <label>Username / Email</label>
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
            {isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>


        <div className="auth-footer">
          <p className="text-dim">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="auth-link" 
              onClick={() => { if (!isSubmitting) { setIsLogin(!isLogin); setError(''); } }}
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
