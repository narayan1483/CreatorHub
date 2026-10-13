import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  Palette,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  LogOut,
  UserCheck,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { ThemeMode } from '../../types';
import './Header.css';

const themeOptions: { id: ThemeMode; label: string; previewColor: string }[] = [
  { id: 'indigo', label: 'Midnight Indigo', previewColor: '#6366f1' },
  { id: 'obsidian', label: 'Obsidian Velvet', previewColor: '#a855f7' },
  { id: 'emerald', label: 'Cyber Emerald', previewColor: '#10b981' },
  { id: 'sunset', label: 'Sunset Coral', previewColor: '#f43f5e' },
  { id: 'light', label: 'Clean SaaS Light', previewColor: '#3b82f6' },
];

const pageTitles: Record<string, string> = {
  '/': 'Getting Started',
  '/store': 'Store & Link-in-Bio',
  '/payments': 'Payments & Orders',
  '/learn': 'Creator Academy',
  '/audience': 'Audience Segments',
  '/autodm': 'Instagram AutoDM',
  '/refer-and-earn': 'Refer & Earn',
  '/connected-agents': 'Connected Agents',
  '/apps': 'Explore Apps',
  '/apps/schedule': 'Schedule & Content Planner',
  '/apps/superlinks': 'SuperLinks Tracker',
  '/apps/lead-magnet': 'Lead Magnets',
  '/apps/payment-pages': 'Payment Pages',
  '/apps/bookings': '1:1 Bookings & Consultations',
  '/apps/content-studio': 'AI Content Studio',
  '/content-studio': 'AI Content Studio',
  '/apps/broadcast': 'Broadcast Studio',
  '/broadcast': 'Broadcast Studio',
};

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { user, logout, switchCreator, allCreators } = useAuth();

  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const currentTitle = pageTitles[location.pathname] || 'CreatorHub';

  const userInitials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyStoreLink = () => {
    const url = `https://${user.storeUrl}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    showToast('Store link copied to clipboard! 🚀', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out of CreatorHub', 'info');
    } catch {
      showToast('Logged out of CreatorHub', 'info');
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="app-header" role="banner">
      <div className="app-header__left">
        <h1 className="app-header__page-title">{currentTitle}</h1>
        <div className="app-header__badge">
          <span className="live-pulse" />
          <span>Live Store</span>
        </div>
      </div>

      <div className="app-header__right">
        {/* Store Link Pill */}
        <div className="app-header__store-pill">
          <span className="store-pill-handle">{user.storeUrl}</span>
          <button
            onClick={handleCopyStoreLink}
            className="store-pill-btn"
            title="Copy store link"
            type="button"
          >
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <Link
            to="/store"
            className="store-pill-btn"
            title="Preview storefront"
          >
            <ExternalLink size={13} />
          </Link>
        </div>

        {/* Search */}
        <div className={`app-header__search ${searchFocused ? 'app-header__search--focused' : ''}`}>
          <Search size={15} className="app-header__search-icon" />
          <input
            type="search"
            placeholder="Search automations, contacts, orders..."
            className="app-header__search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search"
          />
        </div>

        {/* Theme Switcher Dropdown */}
        <div className="app-header__dropdown-wrapper" ref={themeDropdownRef}>
          <button
            className={`app-header__icon-btn ${themeOpen ? 'app-header__icon-btn--active' : ''}`}
            onClick={() => setThemeOpen(!themeOpen)}
            type="button"
            aria-label="Change Theme"
            title="Change Theme & Appearance"
          >
            <Palette size={18} />
          </button>

          {themeOpen && (
            <div className="theme-dropdown-menu">
              <div className="dropdown-menu-header">
                <Sparkles size={14} className="text-brand" />
                <span>Color Theme</span>
              </div>
              <div className="theme-options-grid">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={`theme-option-btn ${theme === opt.id ? 'theme-option-btn--active' : ''}`}
                    onClick={() => {
                      setTheme(opt.id);
                      setThemeOpen(false);
                      showToast(`Switched theme to ${opt.label}`, 'info');
                    }}
                    type="button"
                  >
                    <span
                      className="theme-dot-indicator"
                      style={{ backgroundColor: opt.previewColor }}
                    />
                    <span className="theme-option-label">{opt.label}</span>
                    {theme === opt.id && <Check size={14} className="theme-check-icon" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="app-header__dropdown-wrapper" ref={notifDropdownRef}>
          <button
            className={`app-header__icon-btn ${notifOpen ? 'app-header__icon-btn--active' : ''}`}
            onClick={() => setNotifOpen(!notifOpen)}
            type="button"
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="app-header__notification-dot" />
          </button>

          {notifOpen && (
            <div className="notif-dropdown-menu">
              <div className="dropdown-menu-header">
                <span>Recent Notifications</span>
                <span className="badge badge-indigo">3 New</span>
              </div>
              <div className="notif-list">
                <div className="notif-item">
                  <div className="notif-icon notif-icon--order">₹</div>
                  <div className="notif-info">
                    <p className="notif-text"><strong>Priya Sharma</strong> bought <strong>AI Roadmap PDF</strong></p>
                    <span className="notif-time">2 min ago • ₹499</span>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-icon notif-icon--auto">⚡</div>
                  <div className="notif-info">
                    <p className="notif-text">AutoDM triggered: <strong>277 DMs sent</strong> on Instagram Reel</p>
                    <span className="notif-time">18 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile with Multi-Creator Dropdown */}
        <div className="app-header__dropdown-wrapper" ref={userDropdownRef}>
          <div
            className="app-header__user"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="app-header__avatar">{userInitials}</div>
            <div className="app-header__user-text">
              <span className="app-header__username">{user.name}</span>
              <span className="app-header__plan">{user.plan}</span>
            </div>
            <ChevronDown size={14} className="app-header__user-arrow" />
          </div>

          {userMenuOpen && (
            <div
              className="notif-dropdown-menu"
              style={{
                minWidth: 260,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 13 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {user.email} • @{user.handle}
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', padding: '4px 6px' }}>
                YOUR WORKSPACES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {allCreators.map((c) => (
                  <button
                    key={c.id}
                    className="theme-option-btn"
                    style={{
                      background: c.id === user.id ? 'var(--color-bg-hover)' : 'transparent',
                      padding: '6px 8px',
                    }}
                    onClick={() => {
                      switchCreator(c.id);
                      setUserMenuOpen(false);
                      showToast(`Switched account to ${c.name}`, 'success');
                    }}
                    type="button"
                  >
                    <UserCheck size={14} style={{ color: '#38bdf8' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>@{c.handle}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link
                  to="/login"
                  className="theme-option-btn"
                  onClick={() => setUserMenuOpen(false)}
                  style={{ padding: '6px 8px', color: 'var(--color-text-primary)' }}
                >
                  <LogIn size={14} />
                  <span>Log In as Different User</span>
                </Link>

                <Link
                  to="/signup"
                  className="theme-option-btn"
                  onClick={() => setUserMenuOpen(false)}
                  style={{ padding: '6px 8px', color: '#38bdf8' }}
                >
                  <UserPlus size={14} />
                  <span>Register New Creator Store</span>
                </Link>

                <button
                  className="theme-option-btn"
                  onClick={handleLogout}
                  style={{ padding: '6px 8px', color: 'var(--color-danger)' }}
                  type="button"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
