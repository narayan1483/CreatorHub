import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Send,
  CheckCircle2,
} from 'lucide-react';
import type {
  AIProductKnowledgeItem,
  GroundedAnswerResult,
  ProductFAQItem,
} from '../../types/ai';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';
import './AIProductKnowledge.css';

interface AIProductKnowledgeProps {
  products: AIProductKnowledgeItem[];
  onSaveProduct: (item: AIProductKnowledgeItem) => Promise<void>;
}

export const AIProductKnowledge: React.FC<AIProductKnowledgeProps> = ({
  products,
  onSaveProduct,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [testQuestion, setTestQuestion] = useState('Can I get a refund if I am not satisfied?');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<GroundedAnswerResult | null>(null);

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  const { showToast } = useToast();

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleTestGrounding = async (q = testQuestion) => {
    if (!selectedProduct || !q.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await aiService.evaluateGroundedAnswer(selectedProduct.id, q);
      setEvalResult(res);
      if (res.isGrounded) {
        showToast('Answer successfully grounded in verified product data! ✅', 'success');
      } else {
        showToast('Missing information detected! AI declined to fabricate facts ⚠️', 'info');
      }
    } catch {
      showToast('Error evaluating answer', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;

    const newFaq: ProductFAQItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQ,
      answer: newFaqA,
      category: 'support',
    };

    const updatedProduct = {
      ...selectedProduct,
      faqs: [...selectedProduct.faqs, newFaq],
    };

    try {
      await onSaveProduct(updatedProduct);
      setNewFaqQ('');
      setNewFaqA('');
      setIsAddingFaq(false);
      showToast('New verified FAQ added to Knowledge Base! 📚', 'success');
    } catch {
      showToast('Failed to save FAQ', 'error');
    }
  };

  if (!selectedProduct) {
    return <div className="empty-state">No products found</div>;
  }

  return (
    <div className="ai-product-knowledge">
      {/* Left Sidebar: Product Knowledge Selector */}
      <div className="knowledge-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            <Database size={15} style={{ color: '#38bdf8' }} />
            <span>Product Vault</span>
          </div>
          <span className="badge badge-indigo">{products.length} Products</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map((p) => {
            const isSel = p.id === selectedProduct.id;
            return (
              <div
                key={p.id}
                className={`knowledge-product-card ${isSel ? 'knowledge-product-card--selected' : ''}`}
                onClick={() => {
                  setSelectedProductId(p.id);
                  setEvalResult(null);
                }}
              >
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {p.productName}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  <span>{p.type}</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>₹{p.price}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                  {p.faqs.length} verified facts documented
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Knowledge Inspector & Live Grounding Simulator */}
      <div className="knowledge-main-pane">
        {/* Product Knowledge Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {selectedProduct.productName}
              </h2>
              <span className="badge badge-emerald">₹{selectedProduct.price}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {selectedProduct.summary}
            </p>
          </div>

          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setIsAddingFaq(!isAddingFaq)}
            type="button"
          >
            <Plus size={13} />
            <span>{isAddingFaq ? 'Close FAQ Form' : 'Add Verified FAQ'}</span>
          </button>
        </div>

        {/* Add FAQ Form */}
        {isAddingFaq && (
          <form
            onSubmit={handleAddFaq}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Add New Verified FAQ Item
            </div>
            <input
              type="text"
              required
              className="form-input"
              value={newFaqQ}
              onChange={(e) => setNewFaqQ(e.target.value)}
              placeholder="e.g. Does this include source code files?"
            />
            <textarea
              required
              className="form-input"
              rows={2}
              value={newFaqA}
              onChange={(e) => setNewFaqA(e.target.value)}
              placeholder="e.g. Yes, full GitHub repository link is included in the Notion dashboard."
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setIsAddingFaq(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
                Save to Knowledge Base
              </button>
            </div>
          </form>
        )}

        {/* Policy & Specifications Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Delivery Method
            </span>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {selectedProduct.deliveryMethod}
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
              Refund Policy
            </span>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {selectedProduct.refundPolicy}
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
              Prerequisites
            </span>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {selectedProduct.prerequisites}
            </p>
          </div>
        </div>

        {/* Interactive Grounding Simulator */}
        <div className="grounding-tester-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} style={{ color: '#34d399' }} />
              <strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                Test Grounded Answer Simulator
              </strong>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Simulates how AI responds to follower DMs
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: 240 }}
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Ask a customer question (e.g. Can I pay with Bitcoin? Or what is refund policy?)"
            />
            <button
              className="btn btn-primary"
              type="button"
              disabled={isEvaluating}
              onClick={() => handleTestGrounding()}
            >
              <Send size={14} className={isEvaluating ? 'animate-spin' : ''} />
              <span>{isEvaluating ? 'Evaluating...' : 'Test Grounding'}</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Quick test cases:</span>
            {[
              'What is the refund policy?',
              'How are files delivered?',
              'Can I pay with Bitcoin or Crypto?',
              'Is there a job guarantee?',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ fontSize: 11, padding: '2px 8px' }}
                onClick={() => {
                  setTestQuestion(preset);
                  handleTestGrounding(preset);
                }}
              >
                "{preset}"
              </button>
            ))}
          </div>

          {/* Evaluation Result Card */}
          {evalResult && (
            <div
              className={`grounded-result-card ${
                evalResult.isGrounded ? 'grounded-result--success' : 'grounded-result--warning'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: evalResult.isGrounded ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {evalResult.isGrounded ? (
                    <>
                      <CheckCircle2 size={14} /> 100% Grounded in Official Knowledge Base
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} /> Missing Information Detected (Declined to Hallucinate)
                    </>
                  )}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Confidence: {Math.round(evalResult.confidenceScore * 100)}%
                </span>
              </div>

              {evalResult.isGrounded ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                    "{evalResult.answer}"
                  </p>
                  {evalResult.groundedSource && (
                    <div style={{ fontSize: 11, color: '#38bdf8' }}>
                      Verified Grounding Source: <code>{evalResult.groundedSource}</code>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#f87171', lineHeight: 1.4 }}>
                    {evalResult.missingInformationWarning}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    Safe Creator Fallback: "{evalResult.answer}"
                  </p>
                  {evalResult.suggestedFollowUp && (
                    <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>
                      💡 Recommended Action: {evalResult.suggestedFollowUp}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Documented FAQs List */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            Documented Knowledge FAQs ({selectedProduct.faqs.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedProduct.faqs.map((faq) => (
              <div
                key={faq.id}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  Q: {faq.question}
                </strong>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                  A: {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
