import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchPayments } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin, logout, refreshUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [paymentCount, setPaymentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        await refreshUser();
        const res = await fetchPayments();
        if (res.success) {
          setPaymentCount(res.count);
        }
      } catch {
        // Keep the profile shell available if the payment summary request fails.
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    success('Logged out successfully.');
    navigate('/login');
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  if (loading) {
    return <LoadingSpinner text="Loading your profile..." size={32} />;
  }

  return (
    <div className="animate-fade-in dashboard-responsive-layout">
      {/* Profile Hero Card inspired by reference screenshots */}
      <div className="profile-hero">
        <div className="profile-avatar-large">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 className="profile-name">{user?.username || 'User'}</h2>
        <p className="profile-email">{user?.email}</p>

        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'var(--success-light)',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={13} /> Verified Account
          </span>

          {isAdmin && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#fef3c7',
                color: '#b45309',
              }}
            >
              <ShieldAlert size={13} /> Administrator
            </span>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="profile-stats-grid">
          <div className="stat-box">
            <div className="stat-number">{paymentCount}</div>
            <div className="stat-label">Saved Payment Methods</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '4px' }}>
              {formattedDate}
            </div>
            <div className="stat-label">Member Since</div>
          </div>
        </div>

        <Link
          to="/payments"
          className="btn-primary"
          style={{ width: '100%', textDecoration: 'none' }}
        >
          <CreditCard size={18} />
          <span>Manage Payment Methods</span>
        </Link>
      </div>

      {/* Menu / Options List inspired by screenshot */}
      <div className="profile-menu-list">
        <Link to="/payments" className="profile-menu-item">
          <div className="menu-item-left">
            <div className="menu-icon-circle">
              <CreditCard size={18} />
            </div>
            <span>Manage Payment Methods</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {paymentCount}
            </span>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>
        </Link>

        <Link to="/payments/add" className="profile-menu-item">
          <div className="menu-item-left">
            <div className="menu-icon-circle">
              <PlusCircle size={18} />
            </div>
            <span>Add New Payment Method</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </Link>

        {isAdmin && (
          <Link to="/admin" className="profile-menu-item">
            <div className="menu-item-left">
              <div className="menu-icon-circle" style={{ background: '#fef3c7', color: '#b45309' }}>
                <ShieldAlert size={18} />
              </div>
              <span>Admin Control Center</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </Link>
        )}

        <div className="profile-menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-left">
            <div className="menu-icon-circle">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div>Account Security</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                JWT Authentication Active
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--success)',
              background: 'var(--success-light)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            Secured
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="profile-menu-item"
          style={{ width: '100%', textAlign: 'left', background: 'none' }}
        >
          <div className="menu-item-left">
            <div className="menu-icon-circle" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
              <LogOut size={18} />
            </div>
            <span style={{ color: 'var(--danger)' }}>Logout</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
