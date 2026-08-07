import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/' && !window.location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container-full nav-content">
        <Link to="/" className="logo-container">
          <div className="logo-icon serif">
            <span className="logo-a">A</span>
            <span className="logo-n">N</span>
          </div>
          <div className="logo-text">
            <div className="logo-main serif">aesthetic</div>
            <div className="logo-sub">
              <span className="line"></span>
              <span className="sub-text">by nikhil</span>
              <span className="line"></span>
            </div>
          </div>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
          <li><Link to="/gallery">Artworks</Link></li>
          <li><Link to="/#about" onClick={handleAboutClick}>About</Link></li>
          
          {user ? (
            <>
              {user.role === 'admin' ? (
                <li><Link to="/admin" className="nav-admin-link">Dashboard</Link></li>
              ) : (
                <li><Link to="/order" className="nav-order-link">Order Sketch</Link></li>
              )}
              <li className="user-info">
                <span className="username">@{user.username}</span>
                <button onClick={logout} className="btn-logout-nav">Logout</button>
              </li>
            </>
          ) : (
            <li><Link to="/auth" className="btn-nav">Login / Sign Up</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
