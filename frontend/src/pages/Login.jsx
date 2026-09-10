import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, EyeOff, Link as LinkIcon, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_ACCOUNTS = [
  { name: 'Vivek Nair', email: 'demo@payvault.com', password: 'User@12345', info: '5 Methods (All Types)' },
  { name: 'Admin', email: 'admin@payvault.com', password: 'Admin@12345', info: 'Full System Control' },
  { name: 'Rahul Sharma', email: 'rahul@payvault.com', password: 'User@12345', info: 'Bank & UPI' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setIsGoogleLoading(true);
          try {
            const result = await loginWithGoogle({ credential });
            success(`Signed in with Google as ${result.user.username}!`);
            navigate(result.user.role === 'admin' ? '/admin' : '/payments');
          } catch (err) {
            error(err.response?.data?.message || err.message || 'Google Sign-In failed.');
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large', width: 400, text: 'continue_with' });
    };
    if (window.google) {
      initializeGoogle();
      return undefined;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
    return () => script.remove();
  }, [googleClientId, loginWithGoogle, navigate, success, error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      success(`Welcome back, ${result.user.username}!`);
      navigate(result.user.role === 'admin' ? '/admin' : '/payments');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in auth-page-container">
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <div className="auth-logo-badge"><ShieldCheck size={36} /></div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>Login with PayVault</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Manage your payment methods securely across Bank, UPI, Paytm, PayPal & USDT</p>
      </div>

      {googleClientId && <div className="google-auth-section"><div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '40px' }} />{isGoogleLoading && <p className="google-trust-badge">Signing in with Google...</p>}</div>}
      <div className="auth-divider"><span>{googleClientId ? 'or sign in with password' : 'Sign in with password'}</span></div>

      <div className="demo-accounts-card">
        <div className="demo-accounts-title"><span>QUICK DEMO ACCOUNTS FOR EVALUATION</span></div>
        <div className="demo-accounts-grid">
          {DEMO_ACCOUNTS.map((account) => <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword(account.password); }} className="demo-pill" title={`Click to fill ${account.name}`}><span className="demo-pill-name">{account.name}</span><span className="demo-pill-sub">{account.info}</span></button>)}
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group"><label className="form-label"><Mail size={15} /><span>Email Address</span></label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="form-input" required /></div>
          <div className="form-group"><label className="form-label"><Lock size={15} /><span>Password</span></label><div style={{ position: 'relative' }}><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="form-input" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-action-btn" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '14px' }} disabled={isSubmitting}><LogIn size={18} /><span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span></button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Don't have an account yet? <Link to="/register" style={{ fontWeight: 700 }}>Create Account <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link></div>
      <div className="security-trust-box"><div className="security-trust-item"><LinkIcon size={16} color="var(--primary)" /><span>Encrypted payment storage</span></div><div className="security-trust-item"><CheckCircle size={16} color="var(--success)" /><span>Strict field isolation</span></div><div className="security-trust-item"><ShieldCheck size={16} color="var(--primary)" /><span>IDOR Guard Protected</span></div></div>
    </div>
  );
};

export default Login;
