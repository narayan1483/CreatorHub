import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle,
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  Send,
  AlertCircle,
  Package,
} from 'lucide-react';
import { mockCreatorProfile, mockStoreBlocks, type StoreContentBlock } from '../data/mockData';
import { SaaSCheckoutModal } from '../components/checkout/SaaSCheckoutModal';
import { apiClient, type WorkspaceSummary } from '../services/apiClient';
import './PublicStorePage.css';

export function PublicStorePage() {
  const { username } = useParams<{ username: string }>();
  const [selectedBlock, setSelectedBlock] = useState<StoreContentBlock | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [blocks, setBlocks] = useState<StoreContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(username));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) {
      setBlocks(mockStoreBlocks);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    apiClient.getWorkspaceBySlug(username)
      .then(async (ws) => {
        if (cancelled) return;
        setWorkspace(ws);
        try {
          const prods = await apiClient.getPublicProducts(ws.id);
          if (cancelled) return;
          const mapped: StoreContentBlock[] = prods.map((p) => ({
            id: p.id,
            type: p.type === 'CALL' ? ('booking' as const) : ('digital' as const),
            title: p.title,
            subtitle: p.subtitle || undefined,
            price: Number(p.price),
            badge: p.badge || undefined,
            url: p.deliveryUrl || undefined,
            visible: p.visible ?? true,
          }));
          setBlocks(mapped);
        } catch {
          if (!cancelled) setBlocks([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleOpenCheckout = (block: StoreContentBlock) => {
    setSelectedBlock(block);
  };

  const displayName = workspace ? workspace.name : mockCreatorProfile.name;
  const displayHandle = workspace ? workspace.slug : mockCreatorProfile.handle;
  const displayTagline = workspace?.tagline || mockCreatorProfile.tagline;

  if (notFound) {
    return (
      <div className="public-store-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 420, textAlign: 'center', background: 'var(--color-surface-solid)', padding: '2.5rem', borderRadius: 24, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8 }}>Creator Store Not Found</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            The storefront for <strong>@{username}</strong> doesn&apos;t exist or has been made private.
          </p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 24px', textDecoration: 'none' }}>
            Go to CreatorHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-store-wrapper">
      <div className="public-store-container">
        {/* Top Banner */}
        <div className="public-store-banner" />

        {/* Avatar */}
        <div
          className="public-store-avatar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 28,
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
          }}
        >
          {displayName.slice(0, 2).toUpperCase()}
        </div>

        {/* Profile info */}
        <div className="public-store-header-info">
          <h1 className="public-store-name">
            {displayName}
            <CheckCircle size={18} fill="#6366f1" color="#fff" />
          </h1>
          <div className="public-store-handle">@{displayHandle}</div>
          <p className="public-store-bio">{displayTagline}</p>

          <div className="public-socials-row">
            <a href={mockCreatorProfile.instagram} target="_blank" rel="noreferrer" className="public-social-btn">
              <Instagram size={17} />
            </a>
            <span className="public-social-btn"><Youtube size={17} /></span>
            <span className="public-social-btn"><Twitter size={17} /></span>
            <span className="public-social-btn"><Send size={17} /></span>
          </div>
        </div>

        {/* Blocks & Products List */}
        <div className="public-blocks-list">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Loading storefront products...</span>
            </div>
          ) : blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, border: '1px dashed var(--color-border)' }}>
              <Package size={32} style={{ color: 'var(--color-text-secondary)', opacity: 0.5, marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>No products available yet</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Check back soon for upcoming digital resources!</div>
            </div>
          ) : (
            blocks
              .filter((b) => b.visible)
              .map((b) => (
                <div
                  key={b.id}
                  className="public-block-card"
                  onClick={() => handleOpenCheckout(b)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="public-block-title">{b.title}</div>
                    {b.subtitle && <div className="public-block-subtitle">{b.subtitle}</div>}
                  </div>
                  {b.badge && <span className="badge badge-rose">{b.badge}</span>}
                  {b.price !== undefined && (
                    <strong style={{ color: '#38bdf8' }}>
                      {b.price === 0 ? 'FREE' : `₹${b.price}`}
                    </strong>
                  )}
                  <ChevronRight size={18} style={{ opacity: 0.6 }} />
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="public-footer-badge">
          <span>Powered by</span>
          <Link to="/" style={{ color: '#818cf8', fontWeight: 600 }}>
            CreatorHub
          </Link>
          <span>• 100% Secure Checkout</span>
        </div>
      </div>

      {/* High-Converting SaaS Checkout Modal */}
      {selectedBlock && (
        <SaaSCheckoutModal
          product={{
            id: selectedBlock.id,
            title: selectedBlock.title,
            price: selectedBlock.price || 0,
            subtitle: selectedBlock.subtitle,
          }}
          workspaceId={workspace?.id}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
}
