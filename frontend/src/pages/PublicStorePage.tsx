import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  Send,
} from 'lucide-react';
import { mockCreatorProfile, mockStoreBlocks, type StoreContentBlock } from '../data/mockData';
import { SaaSCheckoutModal } from '../components/checkout/SaaSCheckoutModal';
import './PublicStorePage.css';

export function PublicStorePage() {
  const [selectedBlock, setSelectedBlock] = useState<StoreContentBlock | null>(null);

  const handleOpenCheckout = (block: StoreContentBlock) => {
    setSelectedBlock(block);
  };

  return (
    <div className="public-store-wrapper">
      <div className="public-store-container">
        {/* Top Banner */}
        <div className="public-store-banner" />

        {/* Avatar */}
        <img
          src={mockCreatorProfile.avatarUrl}
          alt={mockCreatorProfile.name}
          className="public-store-avatar"
        />

        {/* Profile info */}
        <div className="public-store-header-info">
          <h1 className="public-store-name">
            {mockCreatorProfile.name}
            <CheckCircle size={18} fill="#6366f1" color="#fff" />
          </h1>
          <div className="public-store-handle">@{mockCreatorProfile.handle}</div>
          <p className="public-store-bio">{mockCreatorProfile.tagline}</p>

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
          {mockStoreBlocks
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
            ))}
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
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
}
