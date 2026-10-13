import { useState } from 'react';
import { Plus, Copy, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PaymentPageItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  orders: number;
  revenue: number;
  status: 'published' | 'draft';
}

export function PaymentPagesPage() {
  const [pages] = useState<PaymentPageItem[]>([
    {
      id: 'pp-1',
      title: 'Fullstack Next.js & AI Masterclass Checkout',
      slug: 'nextjs-masterclass-checkout',
      price: 4999,
      orders: 342,
      revenue: 1709658,
      status: 'published',
    },
    {
      id: 'pp-2',
      title: '1:1 Tech Mentorship Consultation Booking',
      slug: 'tech-mentorship-booking',
      price: 1999,
      orders: 78,
      revenue: 155922,
      status: 'published',
    },
  ]);

  const { showToast } = useToast();

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
            Payment Pages (Checkout Landing Pages)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Dedicated high-converting checkout pages with UPI QR, cards, countdown timers, and discount tags
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('Create Payment Page wizard opened', 'info')}
          type="button"
        >
          <Plus size={15} />
          <span>Create Payment Page</span>
        </button>
      </div>

      <div className="audience-table-card">
        <table className="autodm-table">
          <thead>
            <tr>
              <th>PAGE TITLE</th>
              <th>PRICE</th>
              <th>TOTAL SALES</th>
              <th>REVENUE EARNED</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td>
                  <div>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{p.title}</strong>
                    <div style={{ fontSize: 11, color: '#38bdf8' }}>creatorhub.io/pay/{p.slug}</div>
                  </div>
                </td>
                <td>
                  <strong style={{ color: 'var(--color-text-primary)' }}>₹{p.price}</strong>
                </td>
                <td>{p.orders} orders</td>
                <td>
                  <strong style={{ color: '#34d399' }}>₹{p.revenue.toLocaleString('en-IN')}</strong>
                </td>
                <td>
                  <span className="badge badge-emerald">● {p.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => showToast('Payment page link copied!', 'success')}
                      type="button"
                      title="Copy Checkout Link"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => showToast('Preview opened', 'info')}
                      type="button"
                      title="Preview Page"
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
