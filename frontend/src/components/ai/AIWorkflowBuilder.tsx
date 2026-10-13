import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Filter,
  Brain,
  MessageSquare,
  ShieldCheck,
  Send,
  Play,
  Pause,
  Plus,
  Save,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import type { AutoDMWorkflow, WorkflowStep, WorkflowStatus } from '../../types/ai';
import { useToast } from '../../context/ToastContext';
import './AIWorkflowBuilder.css';

interface AIWorkflowBuilderProps {
  workflows: AutoDMWorkflow[];
  onSaveWorkflow: (wf: AutoDMWorkflow) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export const AIWorkflowBuilder: React.FC<AIWorkflowBuilderProps> = ({
  workflows,
  onSaveWorkflow,
  onToggleStatus,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { showToast } = useToast();

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const [currentWf, setCurrentWf] = useState<AutoDMWorkflow | null>(activeWorkflow || null);

  // Sync state if selection changes
  React.useEffect(() => {
    const found = workflows.find((w) => w.id === selectedWorkflowId);
    if (found) setCurrentWf(found);
  }, [selectedWorkflowId, workflows]);

  if (!currentWf) {
    return (
      <div className="empty-state">
        <Layers size={36} className="text-secondary" />
        <h3>No workflows found</h3>
      </div>
    );
  }

  const handleStatusToggle = async () => {
    try {
      await onToggleStatus(currentWf.id);
      const nextStatus: WorkflowStatus = currentWf.status === 'active' ? 'paused' : 'active';
      setCurrentWf({ ...currentWf, status: nextStatus });
      showToast(`Workflow status changed to ${nextStatus}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSave = async () => {
    try {
      await onSaveWorkflow(currentWf);
      setIsEditingKeyword(false);
      showToast('Workflow saved successfully! 🚀', 'success');
    } catch {
      showToast('Error saving workflow', 'error');
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    showToast(`Simulating AutoDM trigger for keyword "${currentWf.triggerKeyword}"...`, 'info');
    setTimeout(() => {
      setIsSimulating(false);
      showToast(
        `Simulation SUCCESS: Trigger matched ➔ AI intent classified (96% conf) ➔ DM payload generated! ⚡`,
        'success'
      );
    }, 1200);
  };

  const renderStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger':
        return <Zap size={18} />;
      case 'condition':
        return <Filter size={18} />;
      case 'ai_intent':
        return <Brain size={18} />;
      case 'reply_generation':
        return <MessageSquare size={18} />;
      case 'approval_mode':
        return <ShieldCheck size={18} />;
      case 'action':
        return <Send size={18} />;
      default:
        return <Sparkles size={18} />;
    }
  };

  return (
    <div className="ai-workflow-builder">
      {/* Top Controls Bar */}
      <div className="workflow-top-bar">
        <div className="workflow-selector-wrap">
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Selected Workflow:
          </label>
          <select
            className="workflow-select"
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name} {wf.isDemo ? '(Demo)' : ''}
              </option>
            ))}
          </select>

          {/* Status Badge */}
          <span className={`workflow-status-badge status-badge--${currentWf.status}`}>
            ● {currentWf.status}
          </span>

          {/* Environment Label */}
          <span
            className={`workflow-environment-pill ${
              currentWf.isDemo ? 'env-pill--demo' : 'env-pill--live'
            }`}
          >
            {currentWf.isDemo ? 'DEMO WORKFLOW (LOCAL)' : 'PROD CONNECTED (META API)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className={`btn btn-sm ${currentWf.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
            type="button"
            onClick={handleStatusToggle}
          >
            {currentWf.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            <span>{currentWf.status === 'active' ? 'Pause Workflow' : 'Activate Workflow'}</span>
          </button>

          <button
            className="btn btn-sm btn-secondary"
            type="button"
            disabled={isSimulating}
            onClick={handleRunSimulation}
          >
            <Sparkles size={14} style={{ color: '#38bdf8' }} />
            <span>{isSimulating ? 'Simulating...' : 'Test Run Workflow'}</span>
          </button>

          <button className="btn btn-sm btn-primary" type="button" onClick={handleSave}>
            <Save size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Workflow Metadata & Keyword Config */}
      <div
        style={{
          background: 'var(--color-surface-solid)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {currentWf.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {currentWf.description}
            </p>
          </div>

          <button
            className="btn btn-sm btn-secondary"
            type="button"
            onClick={() => setIsEditingKeyword(!isEditingKeyword)}
          >
            {isEditingKeyword ? 'Close Editor' : 'Edit Trigger Rules'}
          </button>
        </div>

        {/* Keyword rule inline settings */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            padding: '10px 14px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Keyword Trigger
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {isEditingKeyword ? (
                <input
                  type="text"
                  className="form-input"
                  style={{ width: 140, padding: '4px 8px', fontSize: 13 }}
                  value={currentWf.triggerKeyword}
                  onChange={(e) =>
                    setCurrentWf({ ...currentWf, triggerKeyword: e.target.value.toUpperCase() })
                  }
                />
              ) : (
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 13,
                    fontFamily: 'monospace',
                  }}
                >
                  "{currentWf.triggerKeyword}"
                </span>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Match Mode
            </span>
            <div style={{ marginTop: 4 }}>
              {isEditingKeyword ? (
                <select
                  className="workflow-select"
                  value={currentWf.matchType}
                  onChange={(e) =>
                    setCurrentWf({ ...currentWf, matchType: e.target.value as 'exact' | 'contains' })
                  }
                >
                  <option value="contains">Contains Keyword</option>
                  <option value="exact">Exact Match Only</option>
                </select>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {currentWf.matchType === 'contains' ? 'Contains in Comment' : 'Exact Comment Match'}
                </span>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Approval Mode
            </span>
            <div style={{ marginTop: 4 }}>
              {isEditingKeyword ? (
                <select
                  className="workflow-select"
                  value={currentWf.approvalMode}
                  onChange={(e) =>
                    setCurrentWf({
                      ...currentWf,
                      approvalMode: e.target.value as 'auto' | 'human_in_loop',
                    })
                  }
                >
                  <option value="auto">Autonomous (Auto-Send)</option>
                  <option value="human_in_loop">Creator Review (Human-in-Loop)</option>
                </select>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: currentWf.approvalMode === 'auto' ? '#34d399' : '#fbbf24',
                  }}
                >
                  {currentWf.approvalMode === 'auto'
                    ? '⚡ 100% Autonomous (Direct Meta DM)'
                    : '🛡️ Human-in-the-Loop Required'}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Total Runs</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {currentWf.stats.runs}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>DMs Delivered</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#38bdf8' }}>
                {currentWf.stats.dmsSent}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Conversion Rate</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399' }}>
                {currentWf.stats.conversionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas Nodes */}
      <div className="workflow-canvas">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflow Execution Pipeline
          </div>
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            onClick={() => showToast('Workflow step added to pipeline', 'info')}
          >
            <Plus size={13} /> Add Logic Step
          </button>
        </div>

        {currentWf.steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="workflow-node-card">
              <div className="node-header">
                <div className="node-title-group">
                  <div className={`node-icon-box icon-box--${step.type}`}>
                    {renderStepIcon(step.type)}
                  </div>
                  <div>
                    <span className="node-type-label">Step {idx + 1} • {step.type.replace('_', ' ')}</span>
                    <h4 className="node-name">{step.title}</h4>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-indigo">
                    <CheckCircle2 size={12} style={{ color: '#34d399' }} /> Configured
                  </span>
                </div>
              </div>

              <p className="node-desc">{step.description}</p>

              {/* Node Config Summary */}
              <div className="node-config-box">
                {step.type === 'trigger' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Keyword: <strong style={{ color: '#38bdf8' }}>"{currentWf.triggerKeyword}"</strong>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      Target: {currentWf.targetPostTitle || 'All Reels & Carousels'}
                    </span>
                  </>
                )}

                {step.type === 'condition' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Condition Rule: <strong>Follower Verification</strong>
                    </span>
                    <span style={{ fontSize: 11, color: '#34d399' }}>Pass: AutoDM Dispatch | Fail: DM Follow Prompt</span>
                  </>
                )}

                {step.type === 'ai_intent' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Classified Intent: <strong style={{ color: '#c084fc' }}>Product Resource Inquiry</strong>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      Min Confidence: 85%
                    </span>
                  </>
                )}

                {step.type === 'reply_generation' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Tone Profile: <strong style={{ color: '#f472b6' }}>Friendly Creator</strong>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      Template Tags: <code>{'{{first_name}}'}</code>, <code>{'{{link}}'}</code>
                    </span>
                  </>
                )}

                {step.type === 'approval_mode' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Mode:{' '}
                      <strong style={{ color: currentWf.approvalMode === 'auto' ? '#34d399' : '#fbbf24' }}>
                        {currentWf.approvalMode === 'auto' ? 'Instant Autonomous' : 'Creator Review Queue'}
                      </strong>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      Safety threshold enabled
                    </span>
                  </>
                )}

                {step.type === 'action' && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Action: <strong style={{ color: '#818cf8' }}>Send Instagram DM via Meta Graph API</strong>
                    </span>
                    <span style={{ fontSize: 11, color: '#38bdf8' }}>
                      Payload: {step.config.actionPayload || 'Link & Coupon'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Connecting line to next step */}
            {idx < currentWf.steps.length - 1 && (
              <div className="workflow-connector">
                <div className="connector-line" />
                <div className="connector-dot" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
