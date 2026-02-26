import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Heart, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/signup', label: 'Sign Up', authenticated: false },
    { path: '/login', label: 'Login', authenticated: false },
    { path: '/mother-dashboard', label: 'Mother Dashboard', authenticated: true, role: 'mother' },
    { path: '/symptoms', label: 'Symptoms', authenticated: true, role: 'mother' },
    { path: '/risk-result', label: 'Risk Results', authenticated: true },
    { path: '/chv-dashboard', label: 'CHV Dashboard', authenticated: true, role: 'chv' },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (link.authenticated === undefined) return true;
    if (link.authenticated && !isAuthenticated) return false;
    if (!link.authenticated && isAuthenticated) return false;
    if (link.role && user?.role !== link.role) return false;
    return true;
  });

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Heart size={24} className="logo-icon" />
          <span>BirthGuard</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu-desktop">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="nav-user-info">
              <span className="user-name">{user?.full_name || 'User'}</span>
              <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="navbar-menu-mobile">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="mobile-user-info">
                <span>{user?.full_name || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="mobile-logout-btn"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
