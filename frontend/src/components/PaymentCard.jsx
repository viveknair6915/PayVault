import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Smartphone,
  AtSign,
  Send,
  Coins,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PaymentCard = ({ payment, onDeleteClick }) => {
  const navigate = useNavigate();
  const { info } = useToast();
  const [copiedField, setCopiedField] = useState(null);
  const [isMasked, setIsMasked] = useState(true);

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    info(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const maskString = (str, visibleStart = 0, visibleEnd = 4) => {
    if (!str || str.length <= visibleStart + visibleEnd) return str;
    const start = str.slice(0, visibleStart);
    const end = str.slice(-visibleEnd);
    return `${start}••••••${end}`;
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'Bank':
        return <Landmark size={18} />;
      case 'Paytm':
        return <Smartphone size={18} />;
      case 'UPI':
        return <AtSign size={18} />;
      case 'PayPal':
        return <Send size={18} />;
      case 'USDT':
        return <Coins size={18} />;
      default:
        return <Landmark size={18} />;
    }
  };

  return (
    <div className="payment-card-ref animate-fade-in">
      {/* Top Card Title & Masking Toggle */}
      <div className="ref-card-header">
        <div className="ref-card-header-left">
          <span className={`ref-badge-pill ref-badge-${payment.paymentType}`}>
            {renderIcon(payment.paymentType)}
            <span>{payment.paymentType}</span>
          </span>
          <h3 className="ref-card-main-title">
            {payment.paymentType === 'Bank'
              ? payment.bankName
              : payment.paymentType === 'USDT'
              ? 'USDT Wallet'
              : `${payment.paymentType} Transfer`}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsMasked(!isMasked)}
          className="ref-mask-toggle-btn"
          title={isMasked ? 'Reveal full digits' : 'Mask sensitive info'}
          aria-label={isMasked ? 'Reveal sensitive info' : 'Mask sensitive info'}
        >
          {isMasked ? <Eye size={15} /> : <EyeOff size={15} />}
          <span>{isMasked ? 'Reveal' : 'Mask'}</span>
        </button>
      </div>

      {/* Account Information Box (Identical to Screenshot) */}
      <div className="ref-info-box">
        <div className="ref-box-title">Account Information</div>

        {payment.paymentType === 'Bank' && (
          <div className="ref-field-list">
            <div className="ref-field-row">
              <span className="ref-field-label">Account Name:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value">{payment.accountHolderName}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.accountHolderName, 'Account Name')}
                  className="ref-copy-icon-btn"
                  title="Copy Name"
                >
                  {copiedField === 'Account Name' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="ref-field-row">
              <span className="ref-field-label">Account:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value-mono">
                  {isMasked ? maskString(payment.accountNumber, 0, 4) : payment.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.accountNumber, 'Account Number')}
                  className="ref-copy-icon-btn"
                  title="Copy Account Number"
                >
                  {copiedField === 'Account Number' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="ref-field-row">
              <span className="ref-field-label">IFSC Code:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value-mono">{payment.ifscCode}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.ifscCode, 'IFSC Code')}
                  className="ref-copy-icon-btn"
                  title="Copy IFSC"
                >
                  {copiedField === 'IFSC Code' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="ref-field-row">
              <span className="ref-field-label">Bank Name:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value">{payment.bankName}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.bankName, 'Bank Name')}
                  className="ref-copy-icon-btn"
                  title="Copy Bank"
                >
                  {copiedField === 'Bank Name' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="ref-field-row">
              <span className="ref-field-label">Branch:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{payment.branchName}</span>
              </div>
            </div>
          </div>
        )}

        {payment.paymentType === 'Paytm' && (
          <div className="ref-field-list">
            <div className="ref-field-row">
              <span className="ref-field-label">Paytm Mobile:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value-mono">
                  {isMasked ? maskString(payment.paytmNumber, 2, 4) : payment.paytmNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.paytmNumber, 'Paytm Number')}
                  className="ref-copy-icon-btn"
                  title="Copy Number"
                >
                  {copiedField === 'Paytm Number' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {payment.paymentType === 'UPI' && (
          <div className="ref-field-list">
            <div className="ref-field-row">
              <span className="ref-field-label">UPI ID:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value-mono">{payment.upiId}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.upiId, 'UPI ID')}
                  className="ref-copy-icon-btn"
                  title="Copy UPI ID"
                >
                  {copiedField === 'UPI ID' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {payment.paymentType === 'PayPal' && (
          <div className="ref-field-list">
            <div className="ref-field-row">
              <span className="ref-field-label">PayPal Email:</span>
              <div className="ref-field-value-wrap">
                <span className="ref-field-value-mono">{payment.paypalEmail}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.paypalEmail, 'PayPal Email')}
                  className="ref-copy-icon-btn"
                  title="Copy Email"
                >
                  {copiedField === 'PayPal Email' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {payment.paymentType === 'USDT' && (
          <div className="ref-field-list">
            <div className="ref-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <span className="ref-field-label">USDT Wallet Address:</span>
              <div className="ref-field-value-wrap" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span className="ref-field-value-mono" style={{ fontSize: '0.82rem', wordBreak: 'break-all' }}>
                  {isMasked ? maskString(payment.usdtAddress, 4, 4) : payment.usdtAddress}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.usdtAddress, 'USDT Address')}
                  className="ref-copy-icon-btn"
                  title="Copy Wallet Address"
                >
                  {copiedField === 'USDT Address' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot-Style Disclaimer Box */}
      <div className="ref-disclaimer-card">
        <div className="ref-disclaimer-header">
          <AlertTriangle size={15} color="#d97706" />
          <span>Disclaimer</span>
        </div>
        <div className="ref-disclaimer-pill">
          <ShieldCheck size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            {payment.paymentType === 'Bank' && 'Ensure transfer details match the registered bank beneficiary.'}
            {payment.paymentType === 'UPI' && 'Ensure you are sending to the correct verified UPI VPA.'}
            {payment.paymentType === 'Paytm' && 'Only transfers to verified Paytm wallet numbers are processed.'}
            {payment.paymentType === 'PayPal' && 'Transfers are delivered via PayPal invoice or direct credit.'}
            {payment.paymentType === 'USDT' && 'Only send Tether USD (BEP20 / TRC20) assets. Other assets cannot be recovered.'}
          </span>
        </div>
      </div>

      {/* Card Action Buttons (Edit & Delete) */}
      <div className="ref-card-actions">
        <button
          type="button"
          onClick={() => navigate(`/payments/edit/${payment._id}`)}
          className="btn-outline ref-btn-edit"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDeleteClick(payment)}
          className="btn-danger-outline ref-btn-del"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentCard;
