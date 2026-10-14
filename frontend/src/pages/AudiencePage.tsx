import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Zap,
  Instagram,
  RefreshCw,
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  mockAudienceSegments,
  mockAudienceContacts,
  type AudienceSegment,
  type AudienceContact,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import './AudiencePage.css';

export function AudiencePage() {
  const [activeTab, setActiveTab] = useState<'segments' | 'contacts'>('segments');
  const [searchQuery, setSearchQuery] = useState('');
  const [segments] = useState<AudienceSegment[]>(mockAudienceSegments);
  const [contacts, setContacts] = useState<AudienceContact[]>(mockAudienceContacts);
  const { activeWorkspace } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let cancelled = false;
    apiClient.getWorkspaceCustomers(activeWorkspace.id)
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const mapped: AudienceContact[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            instagramHandle: c.instagramHandle || '',
            segment: c.segment || 'Customers',
            totalSpend: Number(c.totalSpend),
            ordersCount: c.ordersCount,
            lastActive: 'Active recently',
          }));
          setContacts(mapped);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeWorkspace?.id]);

  const filteredSegments = segments.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.instagramHandle && c.instagramHandle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Instagram Handle', 'Segment', 'Total Spend (INR)', 'Orders Count'];
    const rows = filteredContacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.instagramHandle || ''}"`,
      `"${c.segment}"`,
      c.totalSpend,
      c.ordersCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `creatorhub_audience_contacts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredContacts.length} audience contacts to CSV! 📥`, 'success');
  };

  return (
    <div className="audience-page">
      <h1 className="audience-title">Audience</h1>

      {/* Sub-tabs Row (Screenshot 4) */}
      <div className="audience-tabs-row">
        <button
          className={`audience-tab-pill ${activeTab === 'segments' ? 'audience-tab-pill--active' : ''}`}
          onClick={() => setActiveTab('segments')}
          type="button"
        >
          Segments ({segments.length})
        </button>
        <button
          className={`audience-tab-pill ${activeTab === 'contacts' ? 'audience-tab-pill--active' : ''}`}
          onClick={() => setActiveTab('contacts')}
          type="button"
        >
          All Contacts ({contacts.length})
        </button>
      </div>

      {/* Search & Actions Bar (Screenshot 4) */}
      <div className="audience-controls-bar">
        <div className="autodm-search-input-wrap">
          <Search size={15} className="autodm-search-icon" />
          <input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="autodm-search-input"
          />
        </div>

        <div className="autodm-actions-group">
          <button
            className="autodm-tool-btn"
            type="button"
            onClick={() => showToast('Filters opened', 'info')}
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button
            className="autodm-tool-btn"
            type="button"
            onClick={() => showToast('Sorted list', 'info')}
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
          <button
            className="autodm-tool-btn"
            type="button"
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Segments View (Screenshot 4) */}
      {activeTab === 'segments' ? (
        <div className="audience-table-card">
          <table className="autodm-table">
            <thead>
              <tr>
                <th>SEGMENTS</th>
                <th>CONTACTS</th>
                <th>CAMPAIGNS</th>
                <th>LAST UPDATED</th>
                <th>CREATED ON</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.map((seg) => (
                <tr key={seg.id}>
                  <td>
                    <div className="segment-name-cell">
                      <div className="segment-icon-box">
                        {seg.platformIcon === 'instagram' ? (
                          <Instagram size={17} style={{ color: '#e1306c' }} />
                        ) : (
                          <Zap size={16} />
                        )}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{seg.name}</strong>
                        <span className="segment-badge-tag">{seg.type}</span>
                      </div>
                    </div>
                  </td>
                  <td>{seg.contactsCount}</td>
                  <td>{seg.campaignsCount}</td>
                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{seg.lastUpdated}</td>
                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{seg.createdOn}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        setActiveTab('contacts');
                        showToast(`Opened contacts in ${seg.name}`, 'info');
                      }}
                      type="button"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* All Contacts View */
        <div className="audience-table-card">
          <table className="autodm-table">
            <thead>
              <tr>
                <th>CONTACT</th>
                <th>INSTAGRAM</th>
                <th>SEGMENT</th>
                <th>TOTAL SPEND</th>
                <th>ORDERS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{c.name}</strong>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.email}</div>
                    </div>
                  </td>
                  <td>
                    {c.instagramHandle ? (
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{c.instagramHandle}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className="badge badge-indigo">{c.segment}</span>
                  </td>
                  <td>
                    <strong>₹{c.totalSpend}</strong>
                  </td>
                  <td>{c.ordersCount}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {c.phone && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => showToast(`WhatsApp message opened for ${c.name}`, 'info')}
                          type="button"
                          title="WhatsApp"
                        >
                          <MessageCircle size={13} style={{ color: '#25d366' }} />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => showToast(`Email draft opened for ${c.email}`, 'info')}
                        type="button"
                        title="Email"
                      >
                        <Mail size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
