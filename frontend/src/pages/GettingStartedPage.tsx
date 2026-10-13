import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  GraduationCap,
  Sparkles,
  MessageCircle,
  Calendar,
  Magnet,
  FileText,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CreatorOnboardingWizard } from '../components/onboarding/CreatorOnboardingWizard';
import './GettingStartedPage.css';

export function GettingStartedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="getting-started-page">
      {/* Top Status Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="getting-started__pill">
          <Sparkles size={13} />
          <span>Paid features included</span>
        </div>

        <button
          className="btn btn-sm btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          onClick={() => setShowWizard(true)}
          type="button"
        >
          <Rocket size={14} />
          <span>Run 2-Min Setup Wizard</span>
        </button>
      </div>

      {/* Greeting Heading */}
      <h1 className="getting-started__greeting">
        Hello, {user.name}!
      </h1>

      {/* Learn Banner (Screenshot 1) */}
      <div className="getting-started__learn-banner">
        <div className="learn-banner__title">
          Learn how to grow and sell with CreatorHub
        </div>
        <Link to="/learn" className="learn-banner__btn">
          <GraduationCap size={16} />
          <span>Go to Learn</span>
        </Link>
      </div>

      {/* Roadmap to making money Card (Screenshot 1) */}
      <div className="getting-started__roadmap-card">
        <div className="roadmap-card__header">
          <div className="roadmap-card__title">Roadmap to making ₹₹₹</div>
          <div className="roadmap-card__progress-text">2/3 completed</div>
        </div>

        <div className="roadmap-progress-bar">
          <div className="roadmap-progress-fill" />
        </div>

        <div className="roadmap-steps-list">
          {/* Step 1: AutoDM */}
          <div className="roadmap-step-item">
            <div className="roadmap-step-status-icon status-icon--checked">
              <Check size={14} />
            </div>
            <div className="roadmap-step-content">
              <div className="roadmap-step-name">Setup automation on AutoDM</div>
              <div className="roadmap-step-desc">
                Turn your IG engagement to potential leads with 100% automations.
              </div>
            </div>
            <Link to="/autodm" className="roadmap-step-action-btn">
              View AutoDM
            </Link>
          </div>

          {/* Step 2: Store */}
          <div className="roadmap-step-item">
            <div className="roadmap-step-status-icon status-icon--checked">
              <Check size={14} />
            </div>
            <div className="roadmap-step-content">
              <div className="roadmap-step-name">Launch your Store</div>
              <div className="roadmap-step-desc">
                Make sure your social bio has it all — the only link in bio store you'll need.
              </div>
            </div>
            <Link to="/store" className="roadmap-step-action-btn">
              Open Store
            </Link>
          </div>

          {/* Step 3: Product */}
          <div className="roadmap-step-item">
            <div className="roadmap-step-status-icon status-icon--pending" />
            <div className="roadmap-step-content">
              <div className="roadmap-step-name">Create a product</div>
              <div className="roadmap-step-desc">
                Launch Digital Products, Webinars, Courses, 1:1 coaching, and more.
              </div>
            </div>
            <button
              className="roadmap-step-action-btn"
              type="button"
              onClick={() => navigate('/store')}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Explore More Apps Section */}
      <div className="getting-started__apps-section">
        <div className="apps-section__header">
          <div className="apps-section__title">Explore more apps</div>
          <Link to="/apps" className="apps-section__view-all-btn">
            <span>View all 10+ apps</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="apps-grid">
          <Link to="/autodm" className="app-feature-card">
            <div
              className="app-feature-icon"
              style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}
            >
              <MessageCircle size={20} />
            </div>
            <div className="app-feature-info">
              <div className="app-feature-name">AutoDM</div>
              <div className="app-feature-tagline">Instagram comment-to-DM</div>
            </div>
          </Link>

          <Link to="/apps/bookings" className="app-feature-card">
            <div
              className="app-feature-icon"
              style={{ background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24' }}
            >
              <Calendar size={20} />
            </div>
            <div className="app-feature-info">
              <div className="app-feature-name">Bookings</div>
              <div className="app-feature-tagline">1:1 Call Consultations</div>
            </div>
          </Link>

          <Link to="/apps/lead-magnet" className="app-feature-card">
            <div
              className="app-feature-icon"
              style={{ background: 'rgba(232, 121, 249, 0.12)', color: '#e879f9' }}
            >
              <Magnet size={20} />
            </div>
            <div className="app-feature-info">
              <div className="app-feature-name">Lead Magnet</div>
              <div className="app-feature-tagline">Capture email subscribers</div>
            </div>
          </Link>

          <Link to="/apps/payment-pages" className="app-feature-card">
            <div
              className="app-feature-icon"
              style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399' }}
            >
              <FileText size={20} />
            </div>
            <div className="app-feature-info">
              <div className="app-feature-name">Payment Pages</div>
              <div className="app-feature-tagline">UPI & Card checkout</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Interactive Creator Onboarding Wizard */}
      <CreatorOnboardingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
      />
    </div>
  );
}
