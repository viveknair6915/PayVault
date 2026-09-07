import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard } from 'lucide-react';
import { fetchPayments, deletePayment } from '../services/paymentService';
import PaymentCard from '../components/PaymentCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const FILTER_TABS = ['All', 'Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'];

const Payments = () => {
  const { success, error } = useToast();

  const [payments, setPayments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPayments = async (tab = selectedTab) => {
    setLoading(true);
    try {
      const res = await fetchPayments(tab);
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(selectedTab);
  }, [selectedTab]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePayment(paymentToDelete._id);
      if (res.success) {
        success('Payment method removed successfully.');
        // Remove from local state immediately
        setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
        setPaymentToDelete(null);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete payment method.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Screen Title & Add CTA */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.35rem' }}>Manage Payments</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage your saved payment methods securely.
          </p>
        </div>

        <Link
          to="/payments/add"
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
        >
          <Plus size={16} />
          <span>Add Method</span>
        </Link>
      </div>

      {/* Filter Tabs (Horizontal Pill scroll inspired by screenshots) */}
      <div className="type-selector-bar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`type-pill ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Payment Cards List / Loading / Empty State */}
      {loading ? (
        <LoadingSpinner text="Fetching your payment methods..." size={30} />
      ) : payments.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <div className="empty-icon-circle">
            <CreditCard size={32} />
          </div>
          <h3 className="empty-title">No payment methods yet</h3>
          <p className="empty-desc">
            {selectedTab === 'All'
              ? 'Add your first payment method to easily manage and withdraw funds.'
              : `You haven't saved any ${selectedTab} payment methods yet.`}
          </p>
          <Link
            to="/payments/add"
            className="btn-primary"
            style={{ marginTop: '8px', textDecoration: 'none' }}
          >
            <Plus size={18} />
            <span>+ Add Payment Method</span>
          </Link>
        </div>
      ) : (
        <div className="payments-grid">
          {payments.map((payment) => (
            <PaymentCard
              key={payment._id}
              payment={payment}
              onDeleteClick={(p) => setPaymentToDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Method"
        message={`Are you sure you want to delete this ${paymentToDelete?.paymentType || ''} payment method? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};

export default Payments;
