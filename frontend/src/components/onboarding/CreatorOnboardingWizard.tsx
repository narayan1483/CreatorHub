import { useState } from 'react';
import {
  Check,
  Instagram,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Zap,
  BookOpen,
  Calendar,
  MessageCircle,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './CreatorOnboardingWizard.css';

interface CreatorOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorOnboardingWizard({ isOpen, onClose }: CreatorOnboardingWizardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [handle, setHandle] = useState(user.storeUrl.split('/')[1] || 'alexrivera');
  const [category, setCategory] = useState('Tech & AI');
  const [metaConnected, setMetaConnected] = useState(true);
  const [productType, setProductType] = useState<'ebook' | 'call' | 'community'>('ebook');
  const [productName, setProductName] = useState('100-Day Startup Growth Playbook');
  const [productPrice, setProductPrice] = useState('499');

  if (!isOpen) return null;

  const categories = [
    { id: 'tech', label: 'Tech & AI', icon: '💻' },
    { id: 'finance', label: 'Personal Finance', icon: '📈' },
    { id: 'fitness', label: 'Fitness & Health', icon: '💪' },
    { id: 'design', label: 'Design & Creative', icon: '🎨' },
    { id: 'marketing', label: 'Content Marketing', icon: '🚀' },
    { id: 'lifestyle', label: 'Lifestyle & Travel', icon: '✈️' },
  ];

  const handleFinish = () => {
    showToast('🎉 Onboarding Complete! Welcome to CreatorHub Pro!', 'success');
    onClose();
  };

  return (
    <div className="onboarding-backdrop" onClick={onClose}>
      <div className="onboarding-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-step-indicator">
            <span className="step-tag">Step {currentStep} of 4</span>
            <div className="step-progress-track">
              <div
                className="step-progress-fill"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
          <button className="onboarding-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: CLAIM HANDLE */}
        {currentStep === 1 && (
          <div className="onboarding-step-content">
            <div className="step-icon-badge">
              <Sparkles size={24} color="#6366f1" />
            </div>
            <h2 className="step-title">Claim your unique Creator Link</h2>
            <p className="step-subtitle">
              This is your official storefront URL where followers buy your digital downloads and 1:1 calls.
            </p>

            <div className="handle-input-box">
              <span className="handle-prefix">creatorhub.to/@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="handle-input"
                placeholder="yourname"
              />
              <span className="handle-status-pill">
                <Check size={12} />
                Available
              </span>
            </div>

            <div className="handle-preview-card">
              <div className="preview-url-text">
                Your live storefront: <strong>https://creatorhub.to/@{handle || 'yourname'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE NICHE */}
        {currentStep === 2 && (
          <div className="onboarding-step-content">
            <div className="step-icon-badge">
              <Zap size={24} color="#f59e0b" />
            </div>
            <h2 className="step-title">Select your primary niche</h2>
            <p className="step-subtitle">
              We customize your AutoDM workflows, AI reply prompts, and template recommendations based on your category.
            </p>

            <div className="category-grid">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className={`category-card ${category === c.label ? 'category-card--active' : ''}`}
                  onClick={() => setCategory(c.label)}
                >
                  <span className="category-emoji">{c.icon}</span>
                  <span className="category-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CONNECT INSTAGRAM */}
        {currentStep === 3 && (
          <div className="onboarding-step-content">
            <div className="step-icon-badge" style={{ background: 'rgba(225, 48, 108, 0.1)' }}>
              <Instagram size={24} color="#e1306c" />
            </div>
            <h2 className="step-title">Connect your Instagram Creator Account</h2>
            <p className="step-subtitle">
              Official Meta Graph API webhook permissions for automated comment-to-DM triggers.
            </p>

            <div className="meta-connection-card">
              <div className="meta-account-header">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                  alt="avatar"
                  className="meta-avatar"
                />
                <div>
                  <div className="meta-handle">@{handle || 'alexrivera'}</div>
                  <div className="meta-status">
                    <span className="status-dot-active" />
                    Instagram Creator Account Verified
                  </div>
                </div>
              </div>

              <div className="permissions-checklist">
                <div className="perm-item">
                  <ShieldCheck size={16} color="#22c55e" />
                  <span>Receive comment notifications on posts and Reels</span>
                </div>
                <div className="perm-item">
                  <ShieldCheck size={16} color="#22c55e" />
                  <span>Send direct message links with 1-click checkout</span>
                </div>
                <div className="perm-item">
                  <ShieldCheck size={16} color="#22c55e" />
                  <span>Post algorithm-boosting public comment replies</span>
                </div>
              </div>

              <button
                className={`btn-meta-connect ${metaConnected ? 'btn-meta-connect--connected' : ''}`}
                onClick={() => setMetaConnected(!metaConnected)}
                type="button"
              >
                <Instagram size={16} />
                <span>{metaConnected ? 'Meta Graph API Connected ✓' : 'Connect with Meta Instagram'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FIRST PRODUCT & LAUNCH */}
        {currentStep === 4 && (
          <div className="onboarding-step-content">
            <div className="step-icon-badge" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
              <CheckCircle2 size={24} color="#22c55e" />
            </div>
            <h2 className="step-title">Set up your first product</h2>
            <p className="step-subtitle">
              Followers will receive this product link whenever they comment on your Reels.
            </p>

            <div className="product-type-row">
              <button
                type="button"
                className={`type-chip ${productType === 'ebook' ? 'type-chip--active' : ''}`}
                onClick={() => setProductType('ebook')}
              >
                <BookOpen size={14} />
                <span>Ebook / Guide</span>
              </button>
              <button
                type="button"
                className={`type-chip ${productType === 'call' ? 'type-chip--active' : ''}`}
                onClick={() => setProductType('call')}
              >
                <Calendar size={14} />
                <span>1:1 Consultation</span>
              </button>
              <button
                type="button"
                className={`type-chip ${productType === 'community' ? 'type-chip--active' : ''}`}
                onClick={() => setProductType('community')}
              >
                <MessageCircle size={14} />
                <span>Telegram VIP Access</span>
              </button>
            </div>

            <div className="onboarding-form-inputs">
              <div className="form-group-custom">
                <label>Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="form-group-custom">
                <label>Price (INR ₹)</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="checkout-input"
                />
              </div>
            </div>

            <div className="ready-banner">
              <Laptop size={18} color="#38bdf8" />
              <span>Everything is ready! Click finish to launch your CreatorHub workspace.</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="onboarding-footer">
          {currentStep > 1 ? (
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
              type="button"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              type="button"
            >
              <span>Continue</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
              onClick={handleFinish}
              type="button"
            >
              <Sparkles size={16} />
              <span>Launch CreatorHub Pro 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
