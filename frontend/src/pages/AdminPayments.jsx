import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CreditCard,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { fetchAllPayments } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const TYPE_OPTIONS = ['All', 'Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'];

const AdminPayments = () => {
  const { error, info } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Inspection modal state
  const [inspectPayment, setInspectPayment] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllPayments({
        page,
        limit: 10,
        search: searchTerm,
        paymentType: selectedType,
      });

      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to query payment records.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedType, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setPage(1);
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    info(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderPaymentSummary = (p) => {
    switch (p.paymentType) {
      case 'Bank':
        return `${p.bankName || 'Bank'} • A/C: ${p.accountNumber || '—'} (IFSC: ${p.ifscCode || '—'})`;
      case 'Paytm':
        return `Phone: ${p.paytmNumber || '—'}`;
      case 'UPI':
        return `UPI: ${p.upiId || '—'}`;
      case 'PayPal':
        return `Email: ${p.paypalEmail || '—'}`;
      case 'USDT':
        return `Wallet: ${p.usdtAddress ? `${p.usdtAddress.slice(0, 10)}...${p.usdtAddress.slice(-6)}` : '—'}`;
      default:
        return '—';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.35rem' }}>Payment Records Directory</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Search, filter, and inspect user payment methods across the system.
          </p>
        </div>

        <Link to="/admin" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
          Overview
        </Link>
      </div>

      {/* Backend Search & Filter Toolbar */}
      <form onSubmit={handleSearchSubmit} className="admin-filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, bank, IFSC, UPI, wallet..."
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto', padding: '9px 12px' }}
          >
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Types' : type}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary" style={{ padding: '9px 16px', fontSize: '0.85rem' }}>
            Search
          </button>

          {(searchTerm || selectedType !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-secondary"
              style={{ padding: '9px 12px' }}
              title="Reset search and filters"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </form>

      {/* Table & Results */}
      {loading ? (
        <LoadingSpinner text="Querying payment records..." size={32} />
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-circle">
            <CreditCard size={32} />
          </div>
          <h3 className="empty-title">No payment records found.</h3>
          <p className="empty-desc">
            No payment methods matched your search criteria or type filter.
          </p>
          {(searchTerm || selectedType !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-outline"
              style={{ marginTop: '8px' }}
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Payment Summary</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.user?.username || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email || '—'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.paymentType}`}>
                      {p.paymentType}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {renderPaymentSummary(p)}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setInspectPayment(p)}
                      className="btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Inspect full details"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <span>
              Showing {payments.length} of {pagination.total} records (Page {pagination.page} of {pagination.pages})
            </span>
            <div className="pagination-btns">
              <button
                type="button"
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="page-btn"
                disabled={page >= pagination.pages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Inspection Modal for Admin */}
      {inspectPayment && (
        <div className="modal-backdrop" onClick={() => setInspectPayment(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge badge-${inspectPayment.paymentType}`}>
                  {inspectPayment.paymentType}
                </span>
                <h3 className="modal-title">Payment Record Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectPayment(null)}
                className="icon-action-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECORD OWNER</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inspectPayment.user?.username} ({inspectPayment.user?.email})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID: {inspectPayment.user?._id}</div>
              </div>

              {inspectPayment.paymentType === 'Bank' && (
                <>
                  <div className="card-row">
                    <span className="card-label">Bank Name</span>
                    <span className="card-value">{inspectPayment.bankName}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Branch Name</span>
                    <span className="card-value">{inspectPayment.branchName}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Account Holder</span>
                    <span className="card-value">{inspectPayment.accountHolderName}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Account Number</span>
                    <span className="card-value">
                      <span className="card-value-mono">{inspectPayment.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(inspectPayment.accountNumber, 'Account')}
                        className="icon-action-btn"
                      >
                        {copiedKey === 'Account' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      </button>
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">IFSC Code</span>
                    <span className="card-value">
                      <span className="card-value-mono">{inspectPayment.ifscCode}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(inspectPayment.ifscCode, 'IFSC')}
                        className="icon-action-btn"
                      >
                        {copiedKey === 'IFSC' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      </button>
                    </span>
                  </div>
                </>
              )}

              {inspectPayment.paymentType === 'Paytm' && (
                <div className="card-row">
                  <span className="card-label">Paytm Number</span>
                  <span className="card-value">
                    <span className="card-value-mono">{inspectPayment.paytmNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectPayment.paytmNumber, 'Paytm')}
                      className="icon-action-btn"
                    >
                      {copiedKey === 'Paytm' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </span>
                </div>
              )}

              {inspectPayment.paymentType === 'UPI' && (
                <div className="card-row">
                  <span className="card-label">UPI ID</span>
                  <span className="card-value">
                    <span className="card-value-mono">{inspectPayment.upiId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectPayment.upiId, 'UPI')}
                      className="icon-action-btn"
                    >
                      {copiedKey === 'UPI' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </span>
                </div>
              )}

              {inspectPayment.paymentType === 'PayPal' && (
                <div className="card-row">
                  <span className="card-label">PayPal Email</span>
                  <span className="card-value">
                    <span className="card-value-mono">{inspectPayment.paypalEmail}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectPayment.paypalEmail, 'PayPal')}
                      className="icon-action-btn"
                    >
                      {copiedKey === 'PayPal' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </span>
                </div>
              )}

              {inspectPayment.paymentType === 'USDT' && (
                <div className="card-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span className="card-label">USDT Wallet Address</span>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
                    <span className="card-value-mono" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {inspectPayment.usdtAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectPayment.usdtAddress, 'USDT')}
                      className="icon-action-btn"
                    >
                      {copiedKey === 'USDT' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '6px' }}>
                Payment Record ID: {inspectPayment._id} • Created: {new Date(inspectPayment.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setInspectPayment(null)}
                className="btn-primary"
                style={{ padding: '8px 18px' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
