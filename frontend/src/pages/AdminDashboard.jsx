import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { fetchAdminStats, fetchAllUsers } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { error } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetchAdminStats(),
          fetchAllUsers(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) setUsers(usersRes.data);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load admin metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin analytics..." size={32} />;
  }

  return (
    <div className="animate-fade-in">
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title" style={{ fontSize: '1.35rem' }}>Admin Control Center</h1>
            <span className="admin-tag">System Admin</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            System metrics, registered users, and payment records overview.
          </p>
        </div>

        <Link
          to="/admin/payments"
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
        >
          <CreditCard size={15} />
          <span>All Payments</span>
        </Link>
      </div>

      {/* Top Metrics Cards */}
      <div className="admin-card-grid">
        <div className="admin-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Users</span>
          </div>
          <div className="admin-stat-val">{stats?.totalUsers || 0}</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <CreditCard size={20} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Payment Methods</span>
          </div>
          <div className="admin-stat-val">{stats?.totalPayments || 0}</div>
        </div>
      </div>

      {/* Payment Type Distribution Grid */}
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
          Payment Methods Distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          <div className="stat-box" style={{ background: 'var(--bank-bg)', border: '1px solid var(--primary-border)' }}>
            <Landmark size={18} color="var(--bank-color)" />
            <div className="stat-number" style={{ color: 'var(--bank-color)', fontSize: '1.2rem', marginTop: '4px' }}>
              {stats?.breakdown?.Bank || 0}
            </div>
            <div className="stat-label">Bank Accounts</div>
          </div>

          <div className="stat-box" style={{ background: 'var(--upi-bg)', border: '1px solid #ddd6fe' }}>
            <AtSign size={18} color="var(--upi-color)" />
            <div className="stat-number" style={{ color: 'var(--upi-color)', fontSize: '1.2rem', marginTop: '4px' }}>
              {stats?.breakdown?.UPI || 0}
            </div>
            <div className="stat-label">UPI Accounts</div>
          </div>

          <div className="stat-box" style={{ background: 'var(--paytm-bg)', border: '1px solid #bae6fd' }}>
            <Smartphone size={18} color="var(--paytm-color)" />
            <div className="stat-number" style={{ color: 'var(--paytm-color)', fontSize: '1.2rem', marginTop: '4px' }}>
              {stats?.breakdown?.Paytm || 0}
            </div>
            <div className="stat-label">Paytm Wallets</div>
          </div>

          <div className="stat-box" style={{ background: 'var(--paypal-bg)', border: '1px solid #c7d2fe' }}>
            <Send size={18} color="var(--paypal-color)" />
            <div className="stat-number" style={{ color: 'var(--paypal-color)', fontSize: '1.2rem', marginTop: '4px' }}>
              {stats?.breakdown?.PayPal || 0}
            </div>
            <div className="stat-label">PayPal Emails</div>
          </div>

          <div className="stat-box" style={{ background: 'var(--usdt-bg)', border: '1px solid #a7f3d0' }}>
            <Coins size={18} color="var(--usdt-color)" />
            <div className="stat-number" style={{ color: 'var(--usdt-color)', fontSize: '1.2rem', marginTop: '4px' }}>
              {stats?.breakdown?.USDT || 0}
            </div>
            <div className="stat-label">USDT Wallets</div>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Registered Users ({users.length})
          </h3>
          <Link to="/admin/payments" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            View Payment Database <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Saved Methods</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={u.role === 'admin' ? 'admin-tag' : 'badge badge-Bank'} style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.totalPayments}</span>
                    {u.paymentTypes?.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({u.paymentTypes.join(', ')})
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
