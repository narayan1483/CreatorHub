import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Instagram } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function MetaOAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectedHandle, setConnectedHandle] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (errorParam || errorDesc) {
      setStatus('error');
      setErrorMessage(errorDesc || errorParam || 'User cancelled or Meta denied OAuth authorization.');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMessage('Missing OAuth authorization code or state parameter in Meta callback.');
      return;
    }

    const workspaceId = activeWorkspace?.id || localStorage.getItem('creatorhub_active_workspace_id');
    if (!workspaceId) {
      setStatus('error');
      setErrorMessage('No active CreatorHub workspace found. Please log in first and retry connection.');
      return;
    }

    let isMounted = true;

    async function handleExchange() {
      try {
        const diagnostics = await apiClient.exchangeMetaOAuthCode(workspaceId as string, { code: code!, state: state! });
        if (isMounted) {
          setStatus('success');
          setConnectedHandle(diagnostics.accountHandle || 'Instagram Creator');
          showToast(`Successfully connected Instagram @${diagnostics.accountHandle}`, 'success');
          setTimeout(() => {
            navigate('/autodm?connected=true');
          }, 1800);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to exchange Meta OAuth authorization code.');
          showToast(err.message || 'Instagram connection failed', 'error');
        }
      }
    }

    handleExchange();

    return () => {
      isMounted = false;
    };
  }, [searchParams, activeWorkspace, navigate, showToast]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background-primary, #090d16)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'var(--color-surface-solid, #131b2e)',
        border: '1px solid var(--color-border, #1e293b)',
        borderRadius: 20,
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Header Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: status === 'error'
            ? 'rgba(239, 68, 68, 0.15)'
            : status === 'success'
            ? 'rgba(16, 185, 129, 0.15)'
            : 'linear-gradient(135deg, rgba(225, 48, 108, 0.2), rgba(131, 58, 180, 0.2))',
          color: status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : '#e1306c',
        }}>
          {status === 'processing' && <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
          {status === 'success' && <CheckCircle2 size={36} />}
          {status === 'error' && <AlertTriangle size={36} />}
        </div>

        {/* Status Content */}
        {status === 'processing' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', marginBottom: 8 }}>
              Connecting Instagram Professional
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Exchanging Meta OAuth 2.0 authorization code and securely storing your encrypted Page Access Token...
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(225, 48, 108, 0.1)',
              color: '#e1306c',
              fontSize: 12,
              fontWeight: 600,
            }}>
              <Instagram size={14} />
              <span>Official Meta Graph API v19.0+</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
              Account Connected!
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Your Instagram Professional account <strong>@{connectedHandle}</strong> has been securely linked to CreatorHub.
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Redirecting to AutoDM dashboard in a moment...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
              Connection Failed
            </h2>
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 12,
              padding: '1rem',
              fontSize: 12,
              color: '#fca5a5',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              {errorMessage}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={() => navigate('/autodm')}
            >
              <ArrowLeft size={16} />
              Return to AutoDM Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
