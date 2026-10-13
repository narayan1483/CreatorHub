import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('alex@creatorhub.to');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = (): boolean => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      showToast('Welcome back! Logged in successfully 🚀', 'success');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(demoEmail, demoPass);
      showToast(`Logged in as ${demoEmail} 🚀`, 'success');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Brand */}
        <div className="auth-brand-row">
          <div className="auth-brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#loginBolt)" />
              <defs>
                <linearGradient id="loginBolt" x1="3" y1="2" x2="21" y2="22">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="auth-brand-name">CreatorHub</span>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-title">Welcome back, Creator</h1>
          <p className="auth-subtitle">
            Log in to manage your Storefront, AutoDM, and daily UPI payouts.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@creator.com"
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <span style={{ fontSize: 11, color: '#38bdf8', cursor: 'pointer' }} onClick={() => showToast('Demo credentials are: alex@creatorhub.to / password', 'info')}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '2.4rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              'Log In to Creator Dashboard'
            )}
          </button>
        </form>

        <div className="auth-divider">Pre-Seeded Production Demo Account</div>

        {/* Pre-Seeded Quick Login */}
        <div className="demo-accounts-grid">
          <div
            className="demo-account-chip"
            onClick={() => handleQuickLogin('alex@creatorhub.to', 'password')}
          >
            <div>
              <strong style={{ color: 'var(--color-text-primary)' }}>Alex Rivera</strong>
              <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 6 }}>@alexrivera</span>
            </div>
            <UserCheck size={14} style={{ color: '#38bdf8' }} />
          </div>
        </div>

        <div className="auth-footer-link">
          Don't have an account?{' '}
          <Link to="/signup">Create your store for free 🚀</Link>
        </div>
      </div>
    </div>
  );
}
