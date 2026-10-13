/* ============================================================
   CreatorHub — AI Phase 2 Types & Interfaces
   Typed service contracts for AI AutoDM, Replies, Content & Knowledge
   ============================================================ */

export type AITone = 'friendly' | 'professional' | 'persuasive' | 'concise';

export type AIIntent =
  | 'product_inquiry'
  | 'pricing'
  | 'discount_request'
  | 'course_access'
  | 'support'
  | 'complaint'
  | 'general';

export type WorkflowStatus = 'active' | 'draft' | 'paused' | 'error';

export type WorkflowTriggerType =
  | 'comment_keyword'
  | 'reel_keyword'
  | 'story_reply'
  | 'dm_received';

export type WorkflowStepType =
  | 'trigger'
  | 'condition'
  | 'ai_intent'
  | 'reply_generation'
  | 'approval_mode'
  | 'action';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  title: string;
  description: string;
  config: {
    keyword?: string;
    matchType?: 'exact' | 'contains' | 'fuzzy';
    intent?: AIIntent;
    confidenceThreshold?: number; // e.g. 0.85
    tone?: AITone;
    autoApprove?: boolean;
    channel?: 'instagram_dm' | 'whatsapp' | 'email';
    actionPayload?: string;
  };
  status: 'configured' | 'pending' | 'warning';
}

export interface AutoDMWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  isDemo: boolean;
  triggerKeyword: string;
  matchType: 'exact' | 'contains';
  targetPost: 'all_posts' | 'specific_reel' | 'latest_3_posts';
  targetPostTitle?: string;
  steps: WorkflowStep[];
  stats: {
    runs: number;
    dmsSent: number;
    leadsCaptured: number;
    conversionRate: number;
  };
  approvalMode: 'auto' | 'human_in_loop';
  lastRun?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AIReplyConversation {
  id: string;
  userHandle: string;
  userAvatar: string;
  postTitle: string;
  postThumbnail: string;
  lastComment: string;
  commentTimestamp: string;
  detectedIntent: AIIntent;
  confidence: number;
  suggestedReplies: Record<AITone, string>;
  activeTone: AITone;
  customReply: string;
  status: 'pending_approval' | 'approved' | 'sent' | 'rejected';
  isMock: boolean;
}

export type ContentFormatType =
  | 'caption'
  | 'hooks'
  | 'hashtags'
  | 'product_description'
  | 'promo_message';

export interface AIContentGeneratorInput {
  topic: string;
  targetAudience: string;
  tone: AITone;
  language: string;
  callToAction: string;
  formatType: ContentFormatType;
  productContext?: string;
}

export interface AIContentDraft {
  id: string;
  formatType: ContentFormatType;
  topic: string;
  targetAudience: string;
  tone: AITone;
  language: string;
  callToAction: string;
  generatedText: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface ProductFAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'pricing' | 'delivery' | 'support' | 'curriculum';
}

export interface AIProductKnowledgeItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  type: string;
  summary: string;
  deliveryMethod: string;
  refundPolicy: string;
  prerequisites: string;
  faqs: ProductFAQItem[];
  knownLimitations: string[];
}

export interface GroundedAnswerResult {
  question: string;
  isGrounded: boolean;
  groundedSource?: string;
  answer: string;
  missingInformationWarning?: string;
  confidenceScore: number;
  suggestedFollowUp?: string;
}

export interface AIUsageMetrics {
  totalRequests: number;
  requestsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  estimatedCostUSD: number;
  costLimitUSD: number;
  activeWorkflows: number;
  period: string;
  isSampleData: true;
  lastUpdated: string;
}
