import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Store,
  CreditCard,
  GraduationCap,
  Users,
  IndianRupee,
  Sparkles,
  MessageCircle,
  Calendar,
  Link2,
  Magnet,
  FileText,
  CalendarDays,
  Grid,
  ChevronDown,
  Menu,
  X,
  LogIn,
  UserPlus,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface NavItemDef {
  label: string;
  path: string;
  icon: any;
  badge?: string;
  isApp?: boolean;
}

const mainNavItems: NavItemDef[] = [
  { label: 'Getting Started', path: '/', icon: Home },
  { label: 'Store', path: '/store', icon: Store },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Learn', path: '/learn', icon: GraduationCap },
  { label: 'Audience', path: '/audience', icon: Users },
  { label: 'Refer & Earn', path: '/refer-and-earn', icon: IndianRupee },
  { label: 'Connected agents', path: '/connected-agents', icon: Sparkles },
];

const appNavItems: NavItemDef[] = [
  { label: 'AutoDM', path: '/autodm', icon: MessageCircle, badge: 'HOT', isApp: true },
  { label: 'AI Content Studio', path: '/apps/content-studio', icon: Sparkles, badge: 'AI', isApp: true },
  { label: 'Broadcast Studio', path: '/apps/broadcast', icon: Send, badge: 'NEW', isApp: true },
  { label: 'Schedule', path: '/apps/schedule', icon: Calendar, isApp: true },
  { label: 'SuperLinks', path: '/apps/superlinks', icon: Link2, isApp: true },
  { label: 'Lead Magnet', path: '/apps/lead-magnet', icon: Magnet, isApp: true },
  { label: 'Payment Pages', path: '/apps/payment-pages', icon: FileText, isApp: true },
  { label: 'Bookings', path: '/apps/bookings', icon: CalendarDays, isApp: true },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  const renderLink = (item: NavItemDef) => {
    const isActive = location.pathname === item.path;
    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''} ${
            item.label === 'AutoDM' ? 'sidebar__link--autodm' : ''
          }`}
          onClick={closeMobile}
        >
          <item.icon size={18} className="sidebar__link-icon" />
          <span className="sidebar__link-label">{item.label}</span>
          {item.badge && (
            <span className="sidebar__link-badge sidebar__link-badge--hot">
              {item.badge}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  const { user } = useAuth();
  const userInitials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        type="button"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobile}
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="sidebar__header">
          <NavLink to="/" className="sidebar__brand" onClick={closeMobile}>
            <div className="sidebar__logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  fill="url(#boltGrad)"
                />
                <defs>
                  <linearGradient id="boltGrad" x1="3" y1="2" x2="21" y2="22">
                    <stop stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="sidebar__brand-text">CreatorHub</span>
          </NavLink>
          <button
            className="sidebar__close-mobile"
            onClick={closeMobile}
            type="button"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="sidebar__nav">
          <ul className="sidebar__list">{mainNavItems.map(renderLink)}</ul>

          <div className="sidebar__section-label">YOUR APPS</div>
          <ul className="sidebar__list">
            {appNavItems.map(renderLink)}
            <li>
              <NavLink
                to="/apps"
                className="sidebar__link sidebar__link--explore"
                onClick={closeMobile}
              >
                <Grid size={17} className="sidebar__link-icon" />
                <span className="sidebar__link-label">Explore All Apps</span>
              </NavLink>
            </li>
          </ul>

          <div className="sidebar__section-label">ACCOUNT & MULTI-USER</div>
          <ul className="sidebar__list">
            <li>
              <NavLink
                to="/login"
                className="sidebar__link"
                onClick={closeMobile}
              >
                <LogIn size={18} className="sidebar__link-icon" />
                <span className="sidebar__link-label">Switch / Log In</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className="sidebar__link"
                onClick={closeMobile}
              >
                <UserPlus size={18} className="sidebar__link-icon" />
                <span className="sidebar__link-label">Create New Store</span>
                <span className="sidebar__link-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  NEW
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* SuperProfile Free Plan Upgrade Card */}
        <div className="sidebar__upgrade-card">
          <div className="upgrade-card__title">You're on {user.plan}</div>
          <div className="upgrade-card__desc">
            Unlock unlimited access to all features and get paid.
          </div>
          <button
            className="upgrade-card__btn"
            type="button"
            onClick={() => alert('CreatorHub Pro Plan: Unlimited AutoDMs, Custom Domain, 0% Commission!')}
          >
            Explore Now 🚀
          </button>
        </div>

        {/* Bottom User Bar */}
        <NavLink to="/store" className="sidebar__user-footer" onClick={closeMobile}>
          <div className="sidebar__user-avatar">{userInitials}</div>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name">{user.name}</span>
            <span className="sidebar__user-handle">@{user.handle}</span>
          </div>
          <ChevronDown size={14} className="sidebar__user-arrow" />
        </NavLink>
      </aside>
    </>
  );
}
