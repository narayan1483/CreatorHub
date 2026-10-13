import { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function ReferAndEarnPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const refUrl = `https://creatorhub.io/signup?ref=${user.handle}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(refUrl);
    setCopied(true);
    showToast('Referral link copied! Share with other creators 🚀', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Refer & Earn Program
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Earn 20% lifetime recurring commissions on every creator you refer to CreatorHub
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCopy} type="button">
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          <span>{copied ? 'Copied Link' : 'Share Referral Link'}</span>
        </button>
      </div>

      {/* Hero Stats */}
      <div
        style={{
          borderRadius: 20,
          background: 'radial-gradient(circle at 80% 50%, #1e3a8a 0%, #090e1a 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Referral Earnings
          </span>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginTop: 4 }}>
            ₹48,302
          </div>
          <span style={{ fontSize: 12, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <TrendingUp size={14} /> +₹12,400 this month
          </span>
        </div>

        <div>
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Referred Creators
          </span>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            24 Creators
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
            Selling actively on CreatorHub
          </span>
        </div>

        <div>
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Your Commission Rate
          </span>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            20% Forever
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
            Paid out on 1st of every month
          </span>
        </div>
      </div>

      {/* Unique Link Card */}
      <div
        style={{
          background: 'var(--color-surface-solid)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Your Unique Referral Link
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            readOnly
            value={refUrl}
            className="form-input"
            style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button className="btn btn-primary" onClick={handleCopy} type="button">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Referred Creators List */}
      <div className="audience-table-card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Referred Creators & Monthly Payouts
          </h3>
        </div>
        <table className="autodm-table">
          <thead>
            <tr>
              <th>CREATOR</th>
              <th>STORE HANDLE</th>
              <th>THEIR MONTHLY SALES</th>
              <th>YOUR 20% COMMISSION</th>
              <th style={{ textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Kavita Iyer', handle: '@kavitacooks', sales: 64200, comm: 12840, status: 'Active' },
              { name: 'Dev Sharma', handle: '@dev_fitness', sales: 48900, comm: 9780, status: 'Active' },
              { name: 'Manish Verma', handle: '@manish_coder', sales: 32000, comm: 6400, status: 'Active' },
              { name: 'Simran Kaur', handle: '@simran_art', sales: 18500, comm: 3700, status: 'Active' },
            ].map((c) => (
              <tr key={c.handle}>
                <td>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{c.name}</strong>
                </td>
                <td style={{ color: '#38bdf8' }}>{c.handle}</td>
                <td>₹{c.sales.toLocaleString('en-IN')}</td>
                <td>
                  <strong style={{ color: '#34d399' }}>₹{c.comm.toLocaleString('en-IN')}</strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge badge-emerald">● {c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
