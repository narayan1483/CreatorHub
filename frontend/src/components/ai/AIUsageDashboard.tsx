import React from 'react';
import {
  Activity,
  Cpu,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { AIUsageMetrics } from '../../types/ai';
import { useToast } from '../../context/ToastContext';
import './AIUsageDashboard.css';

interface AIUsageDashboardProps {
  metrics: AIUsageMetrics;
}

export const AIUsageDashboard: React.FC<AIUsageDashboardProps> = ({ metrics }) => {
  const { showToast } = useToast();

  const reqPct = Math.round((metrics.totalRequests / metrics.requestsLimit) * 100);
  const tokenPct = Math.round((metrics.tokensUsed / metrics.tokensLimit) * 100);
  const costPct = Math.round((metrics.estimatedCostUSD / metrics.costLimitUSD) * 100);

  return (
    <div className="ai-usage-dashboard">
      {/* Sample Data Disclaimer Banner */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 14,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={18} style={{ color: '#38bdf8' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              AI Usage & Compute Telemetry (SAMPLE DATA)
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              All metrics and token costs below are mock telemetry simulations for previewing your creator budget guardrails.
            </div>
          </div>
        </div>

        <button
          className="btn btn-sm btn-secondary"
          onClick={() => showToast('Usage report statement exported', 'info')}
          type="button"
        >
          Export Usage Log
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="usage-kpis-grid">
        {/* Total Requests */}
        <div className="usage-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Monthly AI Invocations
            </span>
            <Activity size={16} style={{ color: '#38bdf8' }} />
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {metrics.totalRequests.toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              / {metrics.requestsLimit.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="usage-meter-track">
            <div
              className="usage-meter-fill"
              style={{ width: `${reqPct}%`, background: 'linear-gradient(90deg, #38bdf8, #2563eb)' }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {reqPct}% of monthly quota used
          </span>
        </div>

        {/* Tokens Consumed */}
        <div className="usage-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Tokens Consumed
            </span>
            <Cpu size={16} style={{ color: '#c084fc' }} />
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {(metrics.tokensUsed / 1000).toFixed(1)}k{' '}
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              / {(metrics.tokensLimit / 1000).toFixed(0)}k
            </span>
          </div>

          <div className="usage-meter-track">
            <div
              className="usage-meter-fill"
              style={{ width: `${tokenPct}%`, background: 'linear-gradient(90deg, #c084fc, #9333ea)' }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {tokenPct}% token budget consumed
          </span>
        </div>

        {/* Estimated Cost */}
        <div className="usage-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Estimated API Spend
            </span>
            <DollarSign size={16} style={{ color: '#34d399' }} />
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399' }}>
            ${metrics.estimatedCostUSD.toFixed(2)}{' '}
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              / ${metrics.costLimitUSD.toFixed(2)} cap
            </span>
          </div>

          <div className="usage-meter-track">
            <div
              className="usage-meter-fill"
              style={{ width: `${costPct}%`, background: 'linear-gradient(90deg, #34d399, #059669)' }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {costPct}% of monthly spend ceiling
          </span>
        </div>

        {/* Active Automations */}
        <div className="usage-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Active AI Workflows
            </span>
            <Layers size={16} style={{ color: '#fbbf24' }} />
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {metrics.activeWorkflows}{' '}
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              Live
            </span>
          </div>

          <div className="usage-meter-track">
            <div
              className="usage-meter-fill"
              style={{ width: '60%', background: 'linear-gradient(90deg, #fbbf24, #d97706)' }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            3 active, 1 draft, 1 paused
          </span>
        </div>
      </div>

      {/* Feature Breakdown Table */}
      <div className="usage-breakdown-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Consumption Breakdown by Feature
          </h3>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {metrics.period}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { feature: 'AutoDM Keyword Triggers & Dispatches', requests: '908 calls', tokens: '181.6k tokens', cost: '$0.36', pct: '64%' },
            { feature: 'AI Reply Assistant Tone Suggestions', requests: '298 calls', tokens: '59.6k tokens', cost: '$0.12', pct: '21%' },
            { feature: 'AI Content Studio Generations', requests: '156 calls', tokens: '31.2k tokens', cost: '$0.06', pct: '11%' },
            { feature: 'Grounded Product Knowledge Inquiries', requests: '58 calls', tokens: '11.7k tokens', cost: '$0.03', pct: '4%' },
          ].map((item) => (
            <div key={item.feature} className="breakdown-row">
              <div>
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {item.feature}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {item.requests} • {item.tokens}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {item.cost}
                </strong>
                <div style={{ fontSize: 11, color: '#38bdf8' }}>{item.pct} of total</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
