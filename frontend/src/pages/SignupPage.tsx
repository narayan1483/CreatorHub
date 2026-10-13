import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!handle) {
      setHandle(val.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    }
  };

  const validate = (): boolean => {
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters');
      return false;
    }
    const cleanHandle = handle.trim().toLowerCase();
    if (!cleanHandle || cleanHandle.length < 3) {
      setErrorMessage('Store handle must be at least 3 characters');
      return false;
    }
    if (!/^[a-z0-9_-]+$/.test(cleanHandle)) {
      setErrorMessage('Store handle can only contain letters, numbers, hyphens, and underscores');
      return false;
    }
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
      await signup(name.trim(), email.trim(), handle.trim(), password);
      showToast(`Welcome to CreatorHub, ${name}! Your store is ready 🚀`, 'success');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your inputs.';
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
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#signupBolt)" />
              <defs>
                <linearGradient id="signupBolt" x1="3" y1="2" x2="21" y2="22">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="auth-brand-name">CreatorHub</span>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-title">Create your Creator Store</h1>
          <p className="auth-subtitle">
            Join thousands of creators monetizing with AutoDM and link-in-bio commerce.
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
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={name}
                disabled={isSubmitting}
                onChange={(e) => handleNameChange(e.target.value)}
                className="form-input"
                placeholder="e.g. Alex Rivera"
                style={{ paddingLeft: '2.4rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Choose your Store Handle *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={handle}
                disabled={isSubmitting}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="form-input"
                placeholder="alexrivera"
                style={{ paddingLeft: '2.4rem' }}
              />
              <AtSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            </div>
            <span style={{ fontSize: 11, color: '#38bdf8', marginTop: 4, display: 'block' }}>
              Your store URL: <strong>creatorhub.to/@{handle || 'yourhandle'}</strong>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="alex@creatorhub.to"
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
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
                <span>Creating Your Store...</span>
              </>
            ) : (
              'Create Free Store & Start Selling 🚀'
            )}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{' '}
          <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}
