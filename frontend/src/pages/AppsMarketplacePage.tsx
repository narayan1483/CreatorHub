import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Calendar,
  Link2,
  Magnet,
  FileText,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';

export function AppsMarketplacePage() {
  const allApps = [
    {
      title: 'AutoDM & AI Studio',
      desc: 'Automatic Instagram comment-to-DM conversions with visual AI workflow builder and reply assistant.',
      icon: MessageCircle,
      color: '#38bdf8',
      path: '/autodm',
      badge: 'Flagship 🔥',
    },
    {
      title: 'AI Content Studio',
      desc: 'Draft viral Instagram captions, hooks, hashtags, and product launch descriptions.',
      icon: Sparkles,
      color: '#c084fc',
      path: '/apps/content-studio',
      badge: 'New AI ✨',
    },
    {
      title: 'Store & Link in Bio',
      desc: 'Build your mobile-first creator shop with digital downloads, ebooks, and UPI payments.',
      icon: Sparkles,
      color: '#a855f7',
      path: '/store',
      badge: 'Core',
    },
    {
      title: 'Bookings & 1:1 Calls',
      desc: 'Let clients book consultation slots directly on your calendar with automated Google Meet links.',
      icon: CalendarDays,
      color: '#fbbf24',
      path: '/apps/bookings',
    },
    {
      title: 'Lead Magnet',
      desc: 'Offer free downloads to capture follower emails and build your owned audience.',
      icon: Magnet,
      color: '#e879f9',
      path: '/apps/lead-magnet',
    },
    {
      title: 'Payment Pages',
      desc: 'High-converting standalone checkout landing pages with countdown timers.',
      icon: FileText,
      color: '#34d399',
      path: '/apps/payment-pages',
    },
    {
      title: 'Schedule',
      desc: 'Plan, preview, and auto-publish Instagram Reels and carousels.',
      icon: Calendar,
      color: '#60a5fa',
      path: '/apps/schedule',
    },
    {
      title: 'SuperLinks',
      desc: 'Branded short links with UTM tracking and real-time click analytics.',
      icon: Link2,
      color: '#f43f5e',
      path: '/apps/superlinks',
    },
    {
      title: 'VIP Telegram Communities',
      desc: 'Paid Telegram group subscriptions with instant one-time invite generation.',
      icon: Send,
      color: '#0ea5e9',
      path: '/store',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem 2rem 4rem',
        maxWidth: 1200,
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          CreatorHub App Store & Extensions
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Power your creator business with all 8+ built-in monetization apps
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {allApps.map((app) => (
          <Link
            key={app.title}
            to={app.path}
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textDecoration: 'none',
              transition: 'transform 0.15s, border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: app.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <app.icon size={22} />
              </div>
              {app.badge && <span className="badge badge-indigo">{app.badge}</span>}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {app.title}
            </h3>

            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4, flex: 1 }}>
              {app.desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#38bdf8', fontWeight: 600, marginTop: 4 }}>
              <span>Open App</span>
              <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
