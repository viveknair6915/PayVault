import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  PlusCircle,
  User,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  SunMedium,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = ({ showBack = false }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo & Name */}
        <div className="header-left">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="icon-action-btn back-btn-nav"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="brand-logo-title">
            <div className="logo-badge">
              <ShieldCheck size={20} />
            </div>
            <div className="brand-text-group">
              <span className="app-brand-name">PayVault</span>
              <span className="app-brand-sub">Multi-Payment System</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="desktop-nav-links" aria-label="Desktop Navigation">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <User size={16} />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/payments"
              end
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={16} />
              <span>Manage Payments</span>
            </NavLink>

            <NavLink
              to="/payments/add"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <PlusCircle size={16} />
              <span>Add Method</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
              >
                <ShieldAlert size={16} />
                <span>Admin Center</span>
              </NavLink>
            )}
          </nav>
        )}

        {/* Right Section: TaskPlanet-inspired Status Badges & User Avatar */}
        <div className="header-right">
          {isAuthenticated && user ? (
            <>
              {/* Reference-inspired points & balance badges */}
              <div className="header-badge-group">
                <div className="ref-badge ref-badge-points" title="Available Points">
                  <span className="ref-badge-num">50</span>
                  <span className="ref-badge-icon star-icon">★</span>
                </div>

                <div className="ref-badge ref-badge-cash" title="Vault Balance">
                  <span className="ref-badge-num">₹0.00</span>
                  <SunMedium size={14} className="sun-icon" />
                </div>
              </div>

              <Link to="/dashboard" className="user-profile-ring" title="View Profile">
                <div className="avatar-ring-container">
                  <div className="user-avatar-mini">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="ring-badge">20%</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="desktop-logout-btn"
                title="Sign out of PayVault"
              >
                <LogOut size={16} />
                <span className="logout-text">Logout</span>
              </button>
            </>
          ) : (
            <div className="auth-header-links">
              <Link to="/login" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
