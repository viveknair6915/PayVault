import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { fetchPaymentById, updatePayment } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const EditPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const res = await fetchPaymentById(id);
        if (res.success && res.data) {
          setPaymentData(res.data);
        } else {
          error('Payment method not found.');
          navigate('/payments');
        }
      } catch (err) {
        error(err.response?.data?.message || 'Could not load payment method.');
        navigate('/payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [id, navigate, error]);

  const handleSubmit = async (updatedData) => {
    setIsSubmitting(true);
    try {
      const res = await updatePayment(id, updatedData);
      success(res.message || 'Payment method updated successfully!');
      navigate('/payments');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update payment method.';
      error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading payment details..." size={32} />;
  }

  return (
    <div className="animate-fade-in form-page-container">
      <div className="page-header-block">
        <h1 className="page-heading">Edit Payment Method</h1>
        <p className="page-subheading">
          Update account parameters or seamlessly change payment type.
        </p>
      </div>

      <PaymentForm
        initialData={paymentData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default EditPayment;
