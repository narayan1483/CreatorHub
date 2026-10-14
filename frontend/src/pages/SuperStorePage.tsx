import { useState, useEffect } from 'react';
import {
  Copy,
  Share2,
  Instagram,
  Edit2,
  Play,
  Plus,
  Heading,
  Check,
  ChevronRight,
  X,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import {
  mockStoreBlocks,
  type StoreContentBlock,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import './SuperStorePage.css';

export function SuperStorePage() {
  const [activeTab, setActiveTab] = useState<'store' | 'appearance' | 'analytics' | 'settings'>('store');
  const [blocks, setBlocks] = useState<StoreContentBlock[]>(mockStoreBlocks);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, activeWorkspace } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let cancelled = false;
    apiClient.getWorkspaceProducts(activeWorkspace.id)
      .then((res: any) => {
        if (!cancelled && Array.isArray(res) && res.length > 0) {
          const mapped: StoreContentBlock[] = res.map((p: any) => ({
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
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeWorkspace?.id]);

  const userInitials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Appearance theme customization state
  const [phoneTheme, setPhoneTheme] = useState<'dark_red' | 'midnight' | 'emerald' | 'clean_light'>('dark_red');

  // New content block state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<StoreContentBlock['type']>('digital');
  const [newPrice, setNewPrice] = useState('499');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyLink = () => {
    const slug = activeWorkspace?.slug || user.handle;
    const url = `${window.location.origin}/store/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    showToast(`Storefront link copied: ${url} 🔗`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVisibility = async (blockId: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await apiClient.toggleProductVisibility(activeWorkspace.id, blockId);
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b))
      );
      showToast('Product visibility updated!', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update visibility', 'error');
    }
  };

  const handleDeleteProduct = async (blockId: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await apiClient.deleteProduct(activeWorkspace.id, blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      showToast('Product removed from store', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const typeMapping: Record<string, string> = {
      digital: 'DIGITAL_FILE',
      booking: 'CALL',
      community: 'COMMUNITY',
      lead_magnet: 'LEAD_MAGNET',
      link: 'DIGITAL_FILE',
    };

    if (activeWorkspace?.id) {
      setIsSubmitting(true);
      try {
        const created = await apiClient.createProduct(activeWorkspace.id, {
          title: newTitle.trim(),
          type: typeMapping[newType] || 'DIGITAL_FILE',
          price: newType === 'lead_magnet' ? 0 : Number(newPrice) || 0,
          badge: newType === 'lead_magnet' ? 'FREE' : 'NEW',
          subtitle: newType === 'lead_magnet' ? 'Free download in exchange for email' : 'Instant digital delivery',
          visible: true,
        });

        const newBlock: StoreContentBlock = {
          id: created.id,
          type: newType,
          title: created.title,
          subtitle: created.subtitle || undefined,
          price: Number(created.price),
          badge: created.badge || undefined,
          visible: created.visible,
        };

        setBlocks([newBlock, ...blocks]);
        setIsAddContentOpen(false);
        setNewTitle('');
        showToast(`Added "${newTitle}" to your store! 🚀`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to save product to backend', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const newBlock: StoreContentBlock = {
        id: `blk-${Date.now().toString().slice(-4)}`,
        type: newType,
        title: newTitle,
        subtitle: newType === 'lead_magnet' ? 'Free download in exchange for email' : 'Instant digital delivery',
        price: newType === 'lead_magnet' ? 0 : Number(newPrice) || 0,
        badge: newType === 'lead_magnet' ? 'FREE' : 'NEW',
        visible: true,
      };
      setBlocks([newBlock, ...blocks]);
      setIsAddContentOpen(false);
      setNewTitle('');
      showToast(`Added "${newTitle}" to your store! 🚀`, 'success');
    }
  };

  return (
    <div className="super-store-page">
      {/* Top Sub-tabs Bar (Screenshot 2) */}
      <div className="store-subtabs-row">
        <div className="store-tabs-list">
          <button
            className={`store-tab-link ${activeTab === 'store' ? 'store-tab-link--active' : ''}`}
            onClick={() => setActiveTab('store')}
            type="button"
          >
            Store
          </button>
          <button
            className={`store-tab-link ${activeTab === 'appearance' ? 'store-tab-link--active' : ''}`}
            onClick={() => setActiveTab('appearance')}
            type="button"
          >
            Appearance
          </button>
          <button
            className={`store-tab-link ${activeTab === 'analytics' ? 'store-tab-link--active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            type="button"
          >
            Analytics
          </button>
          <button
            className={`store-tab-link ${activeTab === 'settings' ? 'store-tab-link--active' : ''}`}
            onClick={() => setActiveTab('settings')}
            type="button"
          >
            Settings
          </button>
        </div>

        <div className="store-top-url-badge">
          <div className="store-url-box">
            <span>{user.storeUrl}</span>
            <button
              className="store-url-copy-btn"
              onClick={handleCopyLink}
              type="button"
              title="Copy store link"
            >
              {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
            </button>
          </div>
          <button
            className="store-share-btn"
            onClick={handleCopyLink}
            type="button"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="store-main-split">
        {/* Left Column: Builder Controls or Tab Content */}
        <div className="store-builder-col">
          {activeTab === 'store' && (
            <>
              {/* Live Store Banner (Screenshot 2) */}
              <div className="store-live-banner">
                <div className="live-banner-text">
                  🚀 Your Store is live: <strong>{user.storeUrl}</strong>
                </div>
                <div className="live-banner-actions">
                  <button
                    className="banner-edit-btn"
                    onClick={() => setActiveTab('appearance')}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="banner-share-btn"
                    onClick={handleCopyLink}
                    type="button"
                  >
                    Share Link
                  </button>
                </div>
              </div>

              {/* Profile Card (Screenshot 2) */}
              <div className="store-profile-card">
                <div className="store-profile-left">
                  <div className="store-profile-avatar">
                    {userInitials}
                  </div>
                  <div className="store-profile-info">
                    <div className="store-profile-name">{user.name}</div>
                    <div className="store-profile-tagline">{user.tagline}</div>
                    <div style={{ marginTop: 4 }}>
                      <a
                        href={user.instagram}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#e1306c', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <Instagram size={15} />
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  className="store-edit-header-btn"
                  onClick={() => setActiveTab('appearance')}
                  type="button"
                >
                  <Edit2 size={13} />
                  <span>Edit header</span>
                </button>
              </div>

              {/* Get the most out of your Store Checklist Card (Screenshot 2) */}
              <div className="store-checklist-card">
                <div className="checklist-title-row">
                  <div>
                    <div className="checklist-title">Get the most out of your Store</div>
                    <div className="checklist-desc">Use the following steps to elevate your store experience</div>
                  </div>
                  <div className="checklist-video-box">
                    <Play size={20} fill="#fff" color="#fff" />
                  </div>
                </div>

                <div className="checklist-items-list">
                  <div className="checklist-item-row">
                    <span className="checklist-radio-dot" />
                    <span>Showcase your content by adding links</span>
                  </div>
                  <div className="checklist-item-row">
                    <span className="checklist-radio-dot" />
                    <span>Add Lead Magnet to collect leads and grow audience</span>
                  </div>
                  <div className="checklist-item-row">
                    <span className="checklist-radio-dot" />
                    <span>Create and sell products</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Screenshot 2) */}
              <div className="store-action-buttons-row">
                <button
                  className="add-content-btn"
                  onClick={() => setIsAddContentOpen(true)}
                  type="button"
                >
                  <Plus size={16} />
                  <span>+ Add Content</span>
                </button>
                <button
                  className="add-header-btn"
                  onClick={() => showToast('Header section added', 'info')}
                  type="button"
                >
                  <Heading size={16} />
                  <span>Add a Header</span>
                </button>
              </div>

              {/* Active Content Blocks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Store Blocks ({blocks.length})
                </div>
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      background: 'var(--color-surface-solid)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 14,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: block.visible ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>{block.title}</span>
                        {!block.visible && (
                          <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{block.subtitle}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {block.badge && <span className="badge badge-rose">{block.badge}</span>}
                      {block.price !== undefined && (
                        <strong style={{ color: '#38bdf8' }}>
                          {block.price === 0 ? 'FREE' : `₹${block.price}`}
                        </strong>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(block.id)}
                        title={block.visible ? 'Hide from public storefront' : 'Make visible on storefront'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: block.visible ? 'var(--color-text-secondary)' : '#f87171',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {block.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(block.id)}
                        title="Delete product"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <div style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Palette size={18} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Phone Mockup Theme & Preset
                </h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Customize how your store appears on mobile devices to your followers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {[
                  { id: 'dark_red', name: 'Dark Red Gradient (Screenshot 2)', c1: '#881337', c2: '#000000' },
                  { id: 'midnight', name: 'Midnight Obsidian', c1: '#0f172a', c2: '#020617' },
                  { id: 'emerald', name: 'Cyber Emerald', c1: '#064e3b', c2: '#022c22' },
                  { id: 'clean_light', name: 'Clean White Glass', c1: '#f8fafc', c2: '#ffffff' },
                ].map((th) => (
                  <div
                    key={th.id}
                    onClick={() => {
                      setPhoneTheme(th.id as any);
                      showToast(`Applied ${th.name} to phone preview`, 'info');
                    }}
                    style={{
                      border: phoneTheme === th.id ? '2px solid #38bdf8' : '1px solid var(--color-border)',
                      borderRadius: 12,
                      padding: 10,
                      cursor: 'pointer',
                      background: 'var(--color-bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${th.c1}, ${th.c2})` }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{th.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Storefront Traffic & Conversion
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Store Views</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4 }}>26,640</div>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Link Clicks</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>9,840</div>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Conversion Rate</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>4.82%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Custom Domain & SEO
              </h3>
              <div className="form-group">
                <label className="form-label">Storefront Sub-domain</label>
                <input type="text" readOnly value={user.storeUrl} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Custom Domain</label>
                <input type="text" placeholder="store.yourdomain.com" className="form-input" />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => showToast('Domain settings saved', 'success')} type="button">
                Save Domain
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Phone Mockup (Screenshot 2) */}
        <div className="store-phone-col">
          <div className="super-phone-chassis">
            <div
              className="super-phone-screen"
              style={{
                background:
                  phoneTheme === 'dark_red'
                    ? 'linear-gradient(180deg, #2b060d 0%, #0d0103 100%)'
                    : phoneTheme === 'midnight'
                    ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
                    : phoneTheme === 'emerald'
                    ? 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)'
                    : '#ffffff',
                color: phoneTheme === 'clean_light' ? '#0f172a' : '#ffffff',
              }}
            >
              <div className="phone-screen-avatar">{userInitials}</div>
              <div className="phone-screen-name" style={{ color: phoneTheme === 'clean_light' ? '#0f172a' : '#fff' }}>
                {user.name}
              </div>
              <div className="phone-screen-tagline" style={{ color: phoneTheme === 'clean_light' ? '#475569' : '#94a3b8' }}>
                {user.tagline}
              </div>
              <div style={{ color: '#e1306c' }}>
                <Instagram size={16} />
              </div>

              <div className="phone-screen-blocks">
                {blocks
                  .filter((b) => b.visible)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="phone-screen-block-item"
                      style={{
                        background: phoneTheme === 'clean_light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                        borderColor: phoneTheme === 'clean_light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)',
                        color: phoneTheme === 'clean_light' ? '#0f172a' : '#ffffff',
                      }}
                    >
                      <span>{b.title}</span>
                      <ChevronRight size={14} style={{ opacity: 0.6 }} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {isAddContentOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddContentOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: '#38bdf8' }} />
                <h3 className="modal-title">Add Content to Store</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddContentOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBlock}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Content Type</label>
                  <select
                    className="form-select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                  >
                    <option value="digital">📦 Digital Product (PDF, Ebook, Code)</option>
                    <option value="lead_magnet">🧲 Lead Magnet (Freebie in exchange for email)</option>
                    <option value="booking">📅 1:1 Consultation Call (Google Meet)</option>
                    <option value="community">💬 Telegram VIP Community Membership</option>
                    <option value="link">🔗 Custom Social / External Link</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Block Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js 15 Starter Kit or 45-Min Mentorship"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                {newType !== 'lead_magnet' && (
                  <div className="form-group">
                    <label className="form-label">Price (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="499"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddContentOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving to Database...' : 'Add to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
