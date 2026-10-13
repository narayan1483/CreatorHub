import { useState } from 'react';
import {
  Lock,
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building2,
  Download,
  Calendar,
  Send,
  Sparkles,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './SaaSCheckoutModal.css';

export interface CheckoutProductInfo {
  id?: string;
  title: string;
  price: number;
  subtitle?: string;
  imageUrl?: string;
}

interface SaaSCheckoutModalProps {
  product: CheckoutProductInfo | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SaaSCheckoutModal({ product, onClose, onSuccess }: SaaSCheckoutModalProps) {
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!product) return null;

  const basePrice = product.price || 0;
  const bumpPrice = 499;
  const subtotal = basePrice + (includeOrderBump ? bumpPrice : 0);
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CREATOR10' || couponCode.trim().toUpperCase() === 'VIP') {
      setDiscountApplied(true);
      showToast('Promo code applied: 10% OFF discount! 🎉', 'success');
    } else {
      showToast('Invalid coupon code. Try "CREATOR10"', 'error');
    }
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) {
      showToast('Please enter your full name and email address', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      showToast('Payment confirmed! Digital assets dispatched 🚀', 'success');
      if (onSuccess) onSuccess();
    }, 1400);
  };

  return (
    <div className="checkout-backdrop" onClick={onClose}>
      <div className="checkout-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="checkout-header">
          <div className="checkout-header-left">
            <div className="secure-badge">
              <Lock size={13} />
              <span>256-Bit Encrypted</span>
            </div>
            <h3 className="checkout-title">CreatorHub 1-Click Checkout</h3>
          </div>
          <button className="checkout-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {isCompleted ? (
          /* SUCCESS STATE */
          <div className="checkout-success-body">
            <div className="success-icon-ring">
              <CheckCircle2 size={52} color="#22c55e" />
            </div>

            <h2 className="success-headline">Payment Successful! 🎉</h2>
            <p className="success-subtext">
              We have generated your instant digital licenses and dispatched receipt to{' '}
              <strong>{buyerEmail}</strong>.
            </p>

            {/* Purchased Items Card */}
            <div className="success-summary-box">
              <div className="summary-item-row">
                <span>{product.title}</span>
                <strong>₹{basePrice === 0 ? 'FREE' : basePrice}</strong>
              </div>
              {includeOrderBump && (
                <div className="summary-item-row">
                  <span>⚡ 30-Min 1:1 Growth Strategy Call</span>
                  <strong>₹{bumpPrice}</strong>
                </div>
              )}
              {discountApplied && (
                <div className="summary-item-row summary-item-row--discount">
                  <span>Promo Discount (CREATOR10)</span>
                  <strong>-₹{discountAmount}</strong>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-item-row summary-item-row--total">
                <span>Amount Paid</span>
                <span className="summary-total-price">
                  {finalTotal === 0 ? 'FREE' : `₹${finalTotal}`}
                </span>
              </div>
            </div>

            {/* Instant Delivery Actions */}
            <div className="success-actions-column">
              <button
                className="btn-download-asset"
                type="button"
                onClick={() => showToast('Downloading Playbook PDF...', 'success')}
              >
                <Download size={18} />
                <span>Download Playbook & Assets (PDF, 24MB)</span>
              </button>

              {includeOrderBump && (
                <button
                  className="btn-schedule-call"
                  type="button"
                  onClick={() => showToast('Opening Calendly Slot Selector...', 'info')}
                >
                  <Calendar size={18} />
                  <span>Schedule Your 1:1 Call Slot</span>
                </button>
              )}

              <button
                className="btn-telegram-group"
                type="button"
                onClick={() => showToast('Redirecting to Private VIP Community...', 'info')}
              >
                <Send size={16} />
                <span>Join VIP Private Telegram Community</span>
              </button>
            </div>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={onClose}
              type="button"
            >
              Return to Storefront
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <form className="checkout-body" onSubmit={handleExecutePayment}>
            {/* Product Summary Row */}
            <div className="checkout-product-card">
              <div className="product-card-left">
                <img
                  src={
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80'
                  }
                  alt={product.title}
                  className="product-card-thumb"
                />
                <div>
                  <div className="product-card-title">{product.title}</div>
                  <div className="product-card-sub">{product.subtitle || 'Instant digital download & verified access'}</div>
                </div>
              </div>
              <div className="product-card-price">
                {basePrice === 0 ? 'FREE' : `₹${basePrice}`}
              </div>
            </div>

            {/* Buyer Contact Form */}
            <div className="checkout-form-grid">
              <div className="form-group-custom">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="form-group-custom">
                <label>Email Address (Access sent here) *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="form-group-custom" style={{ gridColumn: 'span 2' }}>
                <label>WhatsApp Number (For instant delivery update)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="checkout-input"
                />
              </div>
            </div>

            {/* ORDER BUMP (Upsell) */}
            <div
              className={`order-bump-box ${includeOrderBump ? 'order-bump-box--active' : ''}`}
              onClick={() => setIncludeOrderBump(!includeOrderBump)}
            >
              <div className="bump-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={includeOrderBump}
                  onChange={(e) => setIncludeOrderBump(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="bump-info">
                <div className="bump-headline">
                  <Sparkles size={14} color="#f59e0b" />
                  <strong>ONE-TIME OFFER: Add 1:1 Strategy Call (+₹499)</strong>
                </div>
                <p className="bump-desc">
                  Save 40% (Normal price ₹999). Get a private 30-minute 1-on-1 session with the creator to review your roadmap.
                </p>
              </div>
              <div className="bump-badge">Save 40%</div>
            </div>

            {/* Coupon Code Section */}
            {!discountApplied ? (
              <div className="coupon-row">
                <div className="coupon-input-wrap">
                  <Tag size={14} className="coupon-icon" />
                  <input
                    type="text"
                    placeholder="Have a promo code? (try CREATOR10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                </div>
                <button
                  type="button"
                  className="btn-apply-coupon"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="coupon-applied-badge">
                <span>Promo code <strong>{couponCode || 'CREATOR10'}</strong> applied (10% OFF)</span>
                <button
                  type="button"
                  className="coupon-remove-btn"
                  onClick={() => setDiscountApplied(false)}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Payment Methods Switcher */}
            <div className="payment-methods-selector">
              <label className="section-label">Select Payment Method</label>
              <div className="payment-tabs-row">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'payment-tab-btn--active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={16} />
                  <span>UPI / QR / Apps</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'card' ? 'payment-tab-btn--active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={16} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'netbanking' ? 'payment-tab-btn--active' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <Building2 size={16} />
                  <span>NetBanking</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="upi-preview-card">
                  <div className="upi-apps-row">
                    <span className="upi-app-pill">Google Pay</span>
                    <span className="upi-app-pill">PhonePe</span>
                    <span className="upi-app-pill">Paytm</span>
                    <span className="upi-app-pill">Any UPI ID</span>
                  </div>
                  <div className="upi-note">
                    Instant zero-fee transfer supported across all Indian UPI apps.
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="card-inputs-grid">
                  <input
                    type="text"
                    placeholder="Card Number (4000 1234 5678 9010)"
                    className="checkout-input"
                    defaultValue="4111 •••• •••• 4242"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <input type="text" placeholder="MM / YY" className="checkout-input" defaultValue="12/28" />
                    <input type="text" placeholder="CVV" className="checkout-input" defaultValue="•••" />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="netbanking-grid">
                  <span className="nb-pill">HDFC Bank</span>
                  <span className="nb-pill">ICICI Bank</span>
                  <span className="nb-pill">SBI</span>
                  <span className="nb-pill">Axis Bank</span>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <div className="checkout-footer">
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-pay-now"
              >
                {isProcessing ? (
                  <span>Connecting to Razorpay Gateway...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {finalTotal === 0
                        ? 'Claim Free Access Now ➔'
                        : `Pay ₹${finalTotal.toLocaleString('en-IN')} & Get Instant Access`}
                    </span>
                  </>
                )}
              </button>

              <div className="checkout-guarantee-note">
                🔒 100% Money-Back Guarantee if not satisfied within 7 days
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
