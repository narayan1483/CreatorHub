import { useState, useEffect } from 'react';
import {
  Download,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';
import {
  mockPaymentTransactions,
  type PaymentTransaction,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import './PaymentsPage.css';

export function PaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockPaymentTransactions);
  const { activeWorkspace } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let cancelled = false;
    apiClient.getWorkspaceOrders(activeWorkspace.id)
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: PaymentTransaction[] = data.map((o) => {
            const rawMethod = (o.paymentMethod || 'upi').toLowerCase();
            const method: 'upi' | 'card' | 'netbanking' =
              rawMethod === 'card' ? 'card' : rawMethod === 'netbanking' ? 'netbanking' : 'upi';
            return {
              id: o.id,
              transactionRef: o.transactionRef || o.id,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              productName: o.productTitle || 'Digital Product',
              amount: Number(o.amount),
              date: new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'completed' as const,
              paymentMethod: method,
            };
          });
          setTransactions(mapped);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeWorkspace?.id]);

  const totalGross = transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0);

  const handleRefund = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'refunded' } : t))
    );
    showToast(`Transaction ${id} refunded successfully`, 'info');
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Customer Email', 'Product', 'Method', 'Amount (INR)', 'Date', 'Status'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.customerName.replace(/"/g, '""')}"`,
      `"${t.customerEmail}"`,
      `"${t.productName.replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      t.amount,
      `"${t.date}"`,
      `"${t.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `creatorhub_payment_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${transactions.length} payment records to CSV! 📥`, 'success');
  };

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1 className="payments-title">Payments & Settlements</h1>
        <button
          className="btn btn-secondary"
          onClick={() => showToast('Payout settlement schedule: T+1 daily to registered HDFC bank', 'info')}
          type="button"
        >
          <Building size={15} />
          <span>Bank Account Details</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="payments-kpis-grid">
        <div className="payment-kpi-card">
          <span className="kpi-card__label">Gross Sales</span>
          <span className="kpi-card__value">₹{totalGross.toLocaleString('en-IN')}</span>
          <span className="kpi-card__subtext">100% payments settled directly via UPI</span>
        </div>

        <div className="payment-kpi-card">
          <span className="kpi-card__label">Next Daily Settlement</span>
          <span className="kpi-card__value" style={{ color: '#38bdf8' }}>Tomorrow, 8:00 AM</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Auto-transfer to HDFC ••••1928</span>
        </div>

        <div className="payment-kpi-card">
          <span className="kpi-card__label">Platform Fee</span>
          <span className="kpi-card__value">0%</span>
          <span className="kpi-card__subtext">CreatorHub 0% commission on Free Plan</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="audience-table-card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Recent Transactions</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Real-time orders and payments</span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleExportCSV}
            type="button"
          >
            <Download size={13} />
            <span>Export Invoices</span>
          </button>
        </div>

        <table className="autodm-table">
          <thead>
            <tr>
              <th>TRANSACTION</th>
              <th>CUSTOMER</th>
              <th>PRODUCT</th>
              <th>METHOD</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong style={{ color: '#38bdf8' }}>#{t.id}</strong>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{t.date}</div>
                </td>
                <td>
                  <div>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{t.customerName}</strong>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.customerEmail}</div>
                  </div>
                </td>
                <td>{t.productName}</td>
                <td>
                  <span className="badge badge-indigo" style={{ textTransform: 'uppercase' }}>
                    <CreditCard size={11} /> {t.paymentMethod}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: 14 }}>₹{t.amount}</strong>
                </td>
                <td>
                  <span
                    className={`badge ${
                      t.status === 'completed'
                        ? 'badge-emerald'
                        : t.status === 'refunded'
                        ? 'badge-rose'
                        : 'badge-amber'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {t.status === 'completed' ? (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleRefund(t.id)}
                      type="button"
                      style={{ color: '#f43f5e' }}
                      title="Refund Transaction"
                    >
                      <RotateCcw size={13} /> Refund
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Refunded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
