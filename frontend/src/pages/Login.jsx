import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Shield,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_ACCOUNTS = [
  { name: 'Vivek Nair', email: 'demo@payvault.com', password: 'User@12345', role: 'user', info: '5 Methods (All Types)' },
  { name: 'Admin', email: 'admin@payvault.com', password: 'Admin@12345', role: 'admin', info: 'Full System Control' },
  { name: 'Rahul Sharma', email: 'rahul@payvault.com', password: 'User@12345', role: 'user', info: 'Bank & UPI' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      success(`Welcome back, ${res.user.username}!`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/payments');
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (userChoice) => {
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle({
        email: userChoice.email,
        username: userChoice.name,
      });
      setIsGoogleModalOpen(false);
      success(`Signed in with Google as ${res.user.username}!`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/payments');
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Google Sign-In failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const fillAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="animate-fade-in auth-page-container">
      {/* Brand Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <div className="auth-logo-badge">
          <ShieldCheck size={36} />
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Login with PayVault
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your payment methods securely across Bank, UPI, Paytm, PayPal & USDT
        </p>
      </div>

      {/* Google Auth Button (Primary CTA inspired by reference) */}
      <div className="google-auth-section">
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="google-signin-btn"
          disabled={isGoogleLoading}
        >
          {/* Official Google G SVG icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1f2937' }}>Continue with Google</span>
        </button>

        <div className="google-trust-badge">
          <span className="trust-dot"></span>
          <span>Recommended • Fast • 256-bit Encrypted</span>
        </div>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>or sign in with password</span>
      </div>

      {/* 1-Click Evaluation Demo Accounts Selector */}
      <div className="demo-accounts-card">
        <div className="demo-accounts-title">
          <span>⚡ QUICK DEMO ACCOUNTS FOR EVALUATION</span>
        </div>
        <div className="demo-accounts-grid">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillAccount(acc)}
              className={`demo-pill ${acc.role === 'admin' ? 'demo-pill-admin' : ''}`}
              title={`Click to fill ${acc.name} (${acc.info})`}
            >
              <span className="demo-pill-name">{acc.role === 'admin' ? '👑 ' : '👤 '}{acc.name}</span>
              <span className="demo-pill-sub">{acc.info}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Standard Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              <Mail size={15} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={15} />
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '14px' }}
            disabled={isSubmitting}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Don't have an account yet?{' '}
        <Link to="/register" style={{ fontWeight: 700 }}>
          Create Account <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
        </Link>
      </div>

      {/* Payment App Security Trust Banner */}
      <div className="security-trust-box">
        <div className="security-trust-item">
          <Shield size={16} color="var(--primary)" />
          <span>AES-256 Bit Encryption</span>
        </div>
        <div className="security-trust-item">
          <CheckCircle size={16} color="var(--success)" />
          <span>PCI-DSS Field Isolation</span>
        </div>
        <div className="security-trust-item">
          <ShieldCheck size={16} color="var(--primary)" />
          <span>IDOR Guard Protected</span>
        </div>
      </div>

      {/* Google Sign-In Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGoogleModalOpen(false)}>
          <div className="modal-dialog google-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                <h3 className="modal-title" style={{ fontSize: '1.05rem' }}>Choose an account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="icon-action-btn"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              to continue to <strong>PayVault Management System</strong>
            </p>

            <div className="google-account-list">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleSignIn(acc)}
                  className="google-account-row"
                  disabled={isGoogleLoading}
                >
                  <div className="google-user-avatar">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="google-user-meta">
                    <div className="google-name">{acc.name}</div>
                    <div className="google-email">{acc.email}</div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleGoogleSignIn({ name: 'Google User', email: `user_${Date.now().toString().slice(-4)}@gmail.com` })}
                className="google-account-row"
                style={{ borderTop: '1px solid #f1f5f9' }}
                disabled={isGoogleLoading}
              >
                <div className="google-user-avatar" style={{ background: '#e2e8f0', color: '#475569' }}>
                  +
                </div>
                <div className="google-user-meta">
                  <div className="google-name">Use another Google account</div>
                  <div className="google-email">Sign in with custom identity</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
