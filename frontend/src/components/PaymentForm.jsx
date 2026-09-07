import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const PAYMENT_TYPES = [
  { id: 'Bank', label: 'Bank Transfer', icon: Landmark },
  { id: 'Paytm', label: 'Paytm', icon: Smartphone },
  { id: 'UPI', label: 'UPI', icon: AtSign },
  { id: 'PayPal', label: 'PayPal', icon: Send },
  { id: 'USDT', label: 'USDT (Crypto)', icon: Coins },
];

const PaymentForm = ({ initialData = null, onSubmit, isSubmitting = false }) => {
  const navigate = useNavigate();

  const [paymentType, setPaymentType] = useState(initialData?.paymentType || 'Bank');
  const [formData, setFormData] = useState({
    bankName: initialData?.bankName || '',
    branchName: initialData?.branchName || '',
    accountHolderName: initialData?.accountHolderName || '',
    accountNumber: initialData?.accountNumber || '',
    ifscCode: initialData?.ifscCode || '',
    paytmNumber: initialData?.paytmNumber || '',
    upiId: initialData?.upiId || '',
    paypalEmail: initialData?.paypalEmail || '',
    usdtAddress: initialData?.usdtAddress || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setPaymentType(initialData.paymentType || 'Bank');
      setFormData({
        bankName: initialData.bankName || '',
        branchName: initialData.branchName || '',
        accountHolderName: initialData.accountHolderName || '',
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifscCode || '',
        paytmNumber: initialData.paytmNumber || '',
        upiId: initialData.upiId || '',
        paypalEmail: initialData.paypalEmail || '',
        usdtAddress: initialData.usdtAddress || '',
      });
    }
  }, [initialData]);

  const handleTypeChange = (newType) => {
    setPaymentType(newType);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ifscCode' ? value.toUpperCase() : value,
    }));
    // Clear field-specific error upon typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateFrontend = () => {
    const newErrors = {};

    if (paymentType === 'Bank') {
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required.';
      if (!formData.branchName.trim()) newErrors.branchName = 'Branch name is required.';
      if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required.';
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required.';
      } else if (!/^\d{9,18}$/.test(formData.accountNumber.trim())) {
        newErrors.accountNumber = 'Account number must be 9 to 18 digits.';
      }

      if (!formData.ifscCode.trim()) {
        newErrors.ifscCode = 'IFSC code is required.';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.trim())) {
        newErrors.ifscCode = 'Invalid IFSC code (e.g. HDFC0001234, 11 alphanumeric characters).';
      }
    } else if (paymentType === 'Paytm') {
      if (!formData.paytmNumber.trim()) {
        newErrors.paytmNumber = 'Paytm mobile number is required.';
      } else if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(formData.paytmNumber.trim())) {
        newErrors.paytmNumber = 'Enter a valid 10-digit mobile number.';
      }
    } else if (paymentType === 'UPI') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required.';
      } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/.test(formData.upiId.trim())) {
        newErrors.upiId = 'Invalid UPI ID (e.g. username@bank or mobile@upi).';
      }
    } else if (paymentType === 'PayPal') {
      if (!formData.paypalEmail.trim()) {
        newErrors.paypalEmail = 'PayPal email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail.trim())) {
        newErrors.paypalEmail = 'Enter a valid email address.';
      }
    } else if (paymentType === 'USDT') {
      if (!formData.usdtAddress.trim()) {
        newErrors.usdtAddress = 'USDT wallet address is required.';
      } else if (formData.usdtAddress.trim().length < 24 || formData.usdtAddress.trim().length > 70) {
        newErrors.usdtAddress = 'Address length is invalid for TRC20, ERC20 or BEP20.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFrontend()) return;

    // Filter to strictly send only relevant fields
    const payload = { paymentType };
    if (paymentType === 'Bank') {
      payload.bankName = formData.bankName.trim();
      payload.branchName = formData.branchName.trim();
      payload.accountHolderName = formData.accountHolderName.trim();
      payload.accountNumber = formData.accountNumber.trim();
      payload.ifscCode = formData.ifscCode.trim().toUpperCase();
    } else if (paymentType === 'Paytm') {
      payload.paytmNumber = formData.paytmNumber.trim();
    } else if (paymentType === 'UPI') {
      payload.upiId = formData.upiId.trim().toLowerCase();
    } else if (paymentType === 'PayPal') {
      payload.paypalEmail = formData.paypalEmail.trim().toLowerCase();
    } else if (paymentType === 'USDT') {
      payload.usdtAddress = formData.usdtAddress.trim();
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div className="form-card animate-fade-in">
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ marginBottom: '8px' }}>
          Select Payment Type
        </label>
        <div className="type-selector-bar">
          {PAYMENT_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={`type-pill ${paymentType === t.id ? 'active' : ''}`}
                onClick={() => handleTypeChange(t.id)}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* BANK FIELDS */}
        {paymentType === 'Bank' && (
          <>
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">
                  Bank Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className={`form-input ${errors.bankName ? 'input-error' : ''}`}
                />
                {errors.bankName && <span className="error-text">{errors.bankName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Branch Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="e.g. Koramangala Branch, Bangalore"
                  className={`form-input ${errors.branchName ? 'input-error' : ''}`}
                />
                {errors.branchName && <span className="error-text">{errors.branchName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Account Holder Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                placeholder="e.g. Vivek Nair"
                className={`form-input ${errors.accountHolderName ? 'input-error' : ''}`}
              />
              {errors.accountHolderName && <span className="error-text">{errors.accountHolderName}</span>}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">
                  Account Number <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 501002348912"
                  maxLength={18}
                  className={`form-input ${errors.accountNumber ? 'input-error' : ''}`}
                />
                {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  IFSC Code <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  style={{ textTransform: 'uppercase' }}
                  className={`form-input ${errors.ifscCode ? 'input-error' : ''}`}
                />
                {errors.ifscCode && <span className="error-text">{errors.ifscCode}</span>}
              </div>
            </div>
            <span className="help-text" style={{ marginTop: '-8px', marginBottom: '14px', display: 'block' }}>
              11-character code provided by your bank (e.g. HDFC0001234).
            </span>
          </>
        )}

        {/* PAYTM FIELDS */}
        {paymentType === 'Paytm' && (
          <div className="form-group">
            <label className="form-label">
              Paytm Registered Mobile Number <span className="required-star">*</span>
            </label>
            <input
              type="tel"
              name="paytmNumber"
              value={formData.paytmNumber}
              onChange={handleInputChange}
              placeholder="e.g. 9876543210"
              maxLength={13}
              className={`form-input ${errors.paytmNumber ? 'input-error' : ''}`}
            />
            {errors.paytmNumber && <span className="error-text">{errors.paytmNumber}</span>}
            <span className="help-text">The phone number linked to your Paytm wallet/bank.</span>
          </div>
        )}

        {/* UPI FIELDS */}
        {paymentType === 'UPI' && (
          <div className="form-group">
            <label className="form-label">
              UPI ID / VPA <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
              className={`form-input ${errors.upiId ? 'input-error' : ''}`}
            />
            {errors.upiId && <span className="error-text">{errors.upiId}</span>}
            <span className="help-text">Your Virtual Payment Address for fast transfers.</span>
          </div>
        )}

        {/* PAYPAL FIELDS */}
        {paymentType === 'PayPal' && (
          <div className="form-group">
            <label className="form-label">
              PayPal Email Address <span className="required-star">*</span>
            </label>
            <input
              type="email"
              name="paypalEmail"
              value={formData.paypalEmail}
              onChange={handleInputChange}
              placeholder="e.g. user@example.com"
              className={`form-input ${errors.paypalEmail ? 'input-error' : ''}`}
            />
            {errors.paypalEmail && <span className="error-text">{errors.paypalEmail}</span>}
            <span className="help-text">The email address tied to your PayPal account.</span>
          </div>
        )}

        {/* USDT FIELDS */}
        {paymentType === 'USDT' && (
          <div className="form-group">
            <label className="form-label">
              USDT Wallet Address <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="usdtAddress"
              value={formData.usdtAddress}
              onChange={handleInputChange}
              placeholder="e.g. 0x8a9e7F9B... (ERC20/BEP20) or T9yD14... (TRC20)"
              className={`form-input ${errors.usdtAddress ? 'input-error' : ''}`}
            />
            {errors.usdtAddress && <span className="error-text">{errors.usdtAddress}</span>}
            <span className="help-text">Ensure you provide the correct TRC20 or ERC20/BEP20 address.</span>
          </div>
        )}

        {/* Disclaimer Note Styled Exactly Like Screenshot */}
        <div className="ref-disclaimer-card" style={{ marginTop: '20px' }}>
          <div className="ref-disclaimer-header">
            <AlertTriangle size={15} color="#d97706" />
            <span>Disclaimer</span>
          </div>
          <div className="ref-disclaimer-pill">
            <span style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.4 }}>
              {paymentType === 'Bank' && 'Ensure transfer details match the registered bank beneficiary.'}
              {paymentType === 'UPI' && 'Ensure you are entering the correct verified UPI ID.'}
              {paymentType === 'Paytm' && 'Only transfers to verified Paytm wallet numbers are processed.'}
              {paymentType === 'PayPal' && 'PayPal email address is encrypted and verified.'}
              {paymentType === 'USDT' && 'Only send Tether USD (BEP20 / TRC20) assets. Other assets cannot be recovered.'}
            </span>
          </div>
        </div>

        {/* Dual Form Action Buttons (Previous & Submit) */}
        <div className="ref-dual-buttons" style={{ marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="ref-btn-prev"
            disabled={isSubmitting}
          >
            Previous
          </button>
          <button
            type="submit"
            className="ref-btn-sub"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{initialData ? 'Update Details' : 'Submit'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
