import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { createPayment } from '../services/paymentService';
import { useToast } from '../context/ToastContext';

const AddPayment = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (paymentData) => {
    setIsSubmitting(true);
    try {
      const res = await createPayment(paymentData);
      success(res.message || 'Payment method saved successfully!');
      navigate('/payments');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add payment method.';
      error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in form-page-container">
      <div className="page-header-block">
        <h1 className="page-heading">Add Payment Method</h1>
        <p className="page-subheading">
          Select your preferred payment channel and enter your account information.
        </p>
      </div>

      <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default AddPayment;
