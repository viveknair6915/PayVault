import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, CreditCard, PlusCircle, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BottomNav = () => {
  const { isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <User className="nav-icon" />
        <span>Profile</span>
      </NavLink>

      <NavLink
        to="/payments"
        end
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <CreditCard className="nav-icon" />
        <span>Payments</span>
      </NavLink>

      <NavLink
        to="/payments/add"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <PlusCircle className="nav-icon" />
        <span>Add</span>
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldAlert className="nav-icon" />
          <span>Admin</span>
        </NavLink>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="nav-item"
        style={{ color: 'rgba(255, 255, 255, 0.75)', cursor: 'pointer' }}
        title="Sign Out"
      >
        <LogOut className="nav-icon" />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default BottomNav;
