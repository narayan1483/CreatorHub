/* ============================================================
   CreatorHub — AI Service Layer
   Typed service interface for future backend integration + Mock implementation
   ============================================================ */

import type {
  AITone,
  AIIntent,
  AutoDMWorkflow,
  AIReplyConversation,
  AIContentGeneratorInput,
  AIProductKnowledgeItem,
  GroundedAnswerResult,
  AIUsageMetrics,
} from '../types/ai';

export interface AIServiceInterface {
  // 1. AI AutoDM Workflows
  getWorkflows(): Promise<AutoDMWorkflow[]>;
  saveWorkflow(workflow: AutoDMWorkflow): Promise<AutoDMWorkflow>;
  toggleWorkflowStatus(id: string, newStatus?: 'active' | 'paused'): Promise<AutoDMWorkflow>;
  deleteWorkflow(id: string): Promise<void>;

  // 2. AI Reply Assistant
  getReplyConversations(): Promise<AIReplyConversation[]>;
  generateReplySuggestions(
    commentText: string,
    detectedIntent: AIIntent,
    productName?: string
  ): Promise<Record<AITone, string>>;
  approveReply(conversationId: string, replyText: string): Promise<AIReplyConversation>;
  rejectReply(conversationId: string): Promise<AIReplyConversation>;

  // 3. AI Content Studio
  generateContentDraft(input: AIContentGeneratorInput): Promise<string>;

  // 4. Product Knowledge & Grounded QA
  getProductKnowledgeList(): Promise<AIProductKnowledgeItem[]>;
  saveProductKnowledge(item: AIProductKnowledgeItem): Promise<AIProductKnowledgeItem>;
  evaluateGroundedAnswer(productId: string, question: string): Promise<GroundedAnswerResult>;

  // 5. AI Usage Dashboard
  getUsageMetrics(): Promise<AIUsageMetrics>;
}

// Initial Mock Data
const initialWorkflows: AutoDMWorkflow[] = [
  {
    id: 'wf-1',
    name: 'AI Roadmap Auto-Deliver',
    description: 'Triggered when users comment "ROADMAP" on the 2026 Engineering reel. Delivers PDF link with personalized greeting.',
    status: 'active',
    isDemo: false,
    triggerKeyword: 'ROADMAP',
    matchType: 'contains',
    targetPost: 'specific_reel',
    targetPostTitle: 'How to build fullstack AI apps in 2026 🚀',
    approvalMode: 'auto',
    stats: {
      runs: 382,
      dmsSent: 277,
      leadsCaptured: 198,
      conversionRate: 71.4,
    },
    lastRun: '12 min ago',
    createdAt: '2026-10-10',
    steps: [
      {
        id: 'step-1',
        type: 'trigger',
        title: 'Comment Keyword Detected',
        description: 'Monitors comments for "ROADMAP" (case-insensitive)',
        config: { keyword: 'ROADMAP', matchType: 'contains' },
        status: 'configured',
      },
      {
        id: 'step-2',
        type: 'condition',
        title: 'Follower Verification Check',
        description: 'Verifies user is following @codewithnarayan to reward loyal followers',
        config: { channel: 'instagram_dm' },
        status: 'configured',
      },
      {
        id: 'step-3',
        type: 'ai_intent',
        title: 'Intent Classification',
        description: 'AI verifies user genuinely requests the roadmap resource',
        config: { intent: 'product_inquiry', confidenceThreshold: 0.88 },
        status: 'configured',
      },
      {
        id: 'step-4',
        type: 'reply_generation',
        title: 'Generate Personalized DM',
        description: 'Creates warm response incorporating user first name and direct store download link',
        config: { tone: 'friendly' },
        status: 'configured',
      },
      {
        id: 'step-5',
        type: 'approval_mode',
        title: 'Autonomous Delivery',
        description: 'Sent instantly via Meta Graph API without waiting for manual creator review',
        config: { autoApprove: true },
        status: 'configured',
      },
      {
        id: 'step-6',
        type: 'action',
        title: 'Send Instagram Direct Message',
        description: 'Dispatches payload with one-click direct download button',
        config: { channel: 'instagram_dm', actionPayload: 'creatorhub.io/pay/ai-engineering-roadmap' },
        status: 'configured',
      },
    ],
  },
  {
    id: 'wf-2',
    name: 'Figma Tokens Lead Magnet Bot',
    description: 'Comments matching "TOKENS" or "FIGMA" receive the free 50+ tokens pack.',
    status: 'active',
    isDemo: false,
    triggerKeyword: 'TOKENS',
    matchType: 'contains',
    targetPost: 'all_posts',
    approvalMode: 'auto',
    stats: {
      runs: 142,
      dmsSent: 118,
      leadsCaptured: 89,
      conversionRate: 75.4,
    },
    lastRun: '44 min ago',
    createdAt: '2026-10-11',
    steps: [
      {
        id: 'step-1',
        type: 'trigger',
        title: 'Comment Keyword Detected',
        description: 'Matches "TOKENS" across any reel or carousel post',
        config: { keyword: 'TOKENS', matchType: 'contains' },
        status: 'configured',
      },
      {
        id: 'step-2',
        type: 'ai_intent',
        title: 'AI Intent: Free Resource Download',
        description: 'Identifies interest in design tokens design library',
        config: { intent: 'product_inquiry', confidenceThreshold: 0.9 },
        status: 'configured',
      },
      {
        id: 'step-3',
        type: 'reply_generation',
        title: 'AI Reply Generation',
        description: 'Concise direct message with link',
        config: { tone: 'concise' },
        status: 'configured',
      },
      {
        id: 'step-4',
        type: 'action',
        title: 'Deliver Freebie Link',
        description: 'Dispatches DM with instant Figma community link',
        config: { channel: 'instagram_dm', actionPayload: 'creatorhub.io/l/figma-tokens-pack' },
        status: 'configured',
      },
    ],
  },
  {
    id: 'wf-3',
    name: '1:1 Mentorship Intake & Pre-qualification (Demo)',
    description: 'Detects high-intent comments on coaching reels and qualifies candidates for 1:1 consultation.',
    status: 'draft',
    isDemo: true,
    triggerKeyword: 'CALL',
    matchType: 'exact',
    targetPost: 'specific_reel',
    targetPostTitle: 'How I scaled from ₹0 to ₹3 Lakh/mo as a tech creator',
    approvalMode: 'human_in_loop',
    stats: {
      runs: 0,
      dmsSent: 0,
      leadsCaptured: 0,
      conversionRate: 0,
    },
    createdAt: '2026-10-13',
    steps: [
      {
        id: 'step-1',
        type: 'trigger',
        title: 'Keyword "CALL" Trigger',
        description: 'Exact match trigger on mentorship promo video',
        config: { keyword: 'CALL', matchType: 'exact' },
        status: 'configured',
      },
      {
        id: 'step-2',
        type: 'ai_intent',
        title: 'AI Intent & Sentiment Filter',
        description: 'Flags serious inquiries vs spam before reaching creator queue',
        config: { intent: 'pricing', confidenceThreshold: 0.85 },
        status: 'configured',
      },
      {
        id: 'step-3',
        type: 'approval_mode',
        title: 'Human Creator Approval Required',
        description: 'Creator reviews the suggested personalized response before sending',
        config: { autoApprove: false },
        status: 'configured',
      },
      {
        id: 'step-4',
        type: 'action',
        title: 'Send Booking Calendar Link',
        description: 'Shares private 30-min Google Meet booking slot',
        config: { channel: 'instagram_dm', actionPayload: 'creatorhub.io/apps/bookings' },
        status: 'pending',
      },
    ],
  },
  {
    id: 'wf-4',
    name: 'Discount Code Auto-Responder (Paused)',
    description: 'Temporarily disabled campaign for festive coupon codes.',
    status: 'paused',
    isDemo: true,
    triggerKeyword: 'OFFER',
    matchType: 'contains',
    targetPost: 'all_posts',
    approvalMode: 'auto',
    stats: {
      runs: 85,
      dmsSent: 64,
      leadsCaptured: 42,
      conversionRate: 65.6,
    },
    lastRun: 'Yesterday',
    createdAt: '2026-10-09',
    steps: [
      {
        id: 'step-1',
        type: 'trigger',
        title: 'Keyword "OFFER" Trigger',
        description: 'Matches "OFFER" on any post',
        config: { keyword: 'OFFER', matchType: 'contains' },
        status: 'configured',
      },
      {
        id: 'step-2',
        type: 'action',
        title: 'Send 20% Coupon Code',
        description: 'Dispatches coupon code "CREATOR20" for storewide checkout',
        config: { channel: 'instagram_dm', actionPayload: 'Use code CREATOR20 for 20% off!' },
        status: 'configured',
      },
    ],
  },
];

const initialConversations: AIReplyConversation[] = [
  {
    id: 'conv-1',
    userHandle: '@sneha_frontend',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    postTitle: '10x Your Web Dev Career in 2026 🚀',
    postThumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&q=80',
    lastComment: 'Hey Narayan, loved this reel! Is the AI Roadmap suitable for someone with 6 months of JavaScript experience?',
    commentTimestamp: '4 min ago',
    detectedIntent: 'product_inquiry',
    confidence: 0.94,
    activeTone: 'friendly',
    customReply: 'Hey Sneha! Absolutely 🙌 It starts right from modern ES6+ foundations and guides you step-by-step into LangChain and AI engineering. Grab your copy here: creatorhub.io/codewithnarayan/roadmap',
    status: 'pending_approval',
    isMock: true,
    suggestedReplies: {
      friendly: 'Hey Sneha! Absolutely 🙌 It starts right from modern ES6+ foundations and guides you step-by-step into LangChain and AI engineering. Grab your copy here: creatorhub.io/codewithnarayan/roadmap',
      professional: 'Hello Sneha. Yes, the curriculum is structured for engineers with at least 6 months of core JavaScript knowledge. You can review the full chapter breakdown here: creatorhub.io/codewithnarayan/roadmap',
      persuasive: 'Hey Sneha! 6 months of JS is the perfect sweet spot! You will skip 2 years of trial and error and master AI APIs faster than 90% of devs. Here is your direct access: creatorhub.io/codewithnarayan/roadmap',
      concise: 'Hey Sneha! Yes, perfect for 6 months JS experience. Direct link: creatorhub.io/codewithnarayan/roadmap 🚀',
    },
  },
  {
    id: 'conv-2',
    userHandle: '@vikram_tech',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    postTitle: 'Fullstack Next.js & AI Masterclass',
    postThumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&q=80',
    lastComment: 'What is the price of the 1:1 strategy call and do I get a recording afterwards?',
    commentTimestamp: '18 min ago',
    detectedIntent: 'pricing',
    confidence: 0.98,
    activeTone: 'professional',
    customReply: 'Hi Vikram, the 1:1 Strategy & Code Review session is ₹1,999 for 45 minutes. You receive a 1080p recording, personalized action sheet, and GitHub review within 24 hours. Booking slots available: creatorhub.io/apps/bookings',
    status: 'pending_approval',
    isMock: true,
    suggestedReplies: {
      friendly: 'Hey Vikram! The 1:1 call is ₹1,999 for 45 minutes, and yes, you get full HD recording + GitHub action plan sent to your email right after! Book your slot here: creatorhub.io/apps/bookings',
      professional: 'Hi Vikram, the 1:1 Strategy & Code Review session is ₹1,999 for 45 minutes. You receive a 1080p recording, personalized action sheet, and GitHub review within 24 hours. Booking slots available: creatorhub.io/apps/bookings',
      persuasive: 'Hey Vikram! It is just ₹1,999 for 45 minutes of direct 1:1 architecture breakdown. Most devs save weeks of debugging in just 1 session, plus you get the full recording forever! Reserve your slot: creatorhub.io/apps/bookings',
      concise: 'Hi Vikram. Price is ₹1,999 (45 mins). Yes, full recording included. Book here: creatorhub.io/apps/bookings',
    },
  },
  {
    id: 'conv-3',
    userHandle: '@rohit_codes',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    postTitle: 'Free 50+ Figma Tokens Pack',
    postThumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&q=80',
    lastComment: 'Do you have any discount code available for the VIP Telegram community?',
    commentTimestamp: '1 hour ago',
    detectedIntent: 'discount_request',
    confidence: 0.91,
    activeTone: 'friendly',
    customReply: 'Hey Rohit! Use code CREATOR20 at checkout for an instant 20% off your first month in our VIP community: creatorhub.io/codewithnarayan/telegram-vip',
    status: 'approved',
    isMock: true,
    suggestedReplies: {
      friendly: 'Hey Rohit! Use code CREATOR20 at checkout for an instant 20% off your first month in our VIP community: creatorhub.io/codewithnarayan/telegram-vip',
      professional: 'Hello Rohit. You can apply the code CREATOR20 during checkout to receive 20% off membership: creatorhub.io/codewithnarayan/telegram-vip',
      persuasive: 'Hey Rohit! For today only you can use CREATOR20 to save 20% instantly and join 1,200+ active builders: creatorhub.io/codewithnarayan/telegram-vip',
      concise: 'Hey Rohit, use code CREATOR20 for 20% off: creatorhub.io/codewithnarayan/telegram-vip',
    },
  },
];

const initialProductKnowledge: AIProductKnowledgeItem[] = [
  {
    id: 'pk-1',
    productId: 'prod-1',
    productName: 'AI Engineering Roadmap 2026 (PDF + Code)',
    price: 499,
    type: 'Digital Download',
    summary: 'A 140-page complete roadmap covering TypeScript, Python, Vector DBs (Pinecone, pgvector), LangChain, and production RAG systems.',
    deliveryMethod: 'Instant download link sent to email and available in CreatorHub buyer dashboard upon payment.',
    refundPolicy: '7-day no-questions-asked refund policy if unsatisfied with the content.',
    prerequisites: 'Basic knowledge of HTML, CSS, and introductory JavaScript.',
    knownLimitations: [
      'Does not include 1:1 live tutoring (purchased separately via Bookings).',
      'Requires your own OpenAI or Anthropic API key for running code examples.',
      'Cryptocurrency payments are not supported (UPI, Cards, and NetBanking only).',
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'Is this roadmap suitable for complete beginners with no coding background?',
        answer: 'It is recommended to have at least basic familiarity with JavaScript fundamentals (variables, functions, async/await). Complete non-programmers should start with our free YouTube starter playlist first.',
        category: 'curriculum',
      },
      {
        id: 'faq-2',
        question: 'How do I receive updates when new AI models are released?',
        answer: 'All buyers get free lifetime access to version updates via Notion and updated PDF downloads in their account.',
        category: 'delivery',
      },
      {
        id: 'faq-3',
        question: 'What payment methods are supported in India and internationally?',
        answer: 'All Indian UPI apps (Google Pay, PhonePe, Paytm, CRED), credit/debit cards (Visa, MasterCard, RuPay), and international Stripe cards are accepted.',
        category: 'pricing',
      },
    ],
  },
  {
    id: 'pk-2',
    productId: 'prod-2',
    productName: '1:1 Career Strategy & Code Review Call',
    price: 1999,
    type: '1:1 Video Consultation',
    summary: 'A 45-minute private 1:1 Google Meet call with personalized code architecture review, portfolio critique, and interview prep.',
    deliveryMethod: 'Calendar invitation with automated Google Meet link sent immediately after booking.',
    refundPolicy: 'Full refund or free reschedule allowed up to 4 hours before the scheduled time.',
    prerequisites: 'Share your GitHub repo, resume, or current problem statement at least 2 hours before the call.',
    knownLimitations: [
      'Calls are strictly 45 minutes long.',
      'Rescheduling within 4 hours of the call incurs a ₹200 slot re-booking fee.',
      'Language options: English and Hindi only.',
    ],
    faqs: [
      {
        id: 'faq-4',
        question: 'Will I get a recording of our call?',
        answer: 'Yes! A private 1080p recording is generated automatically and delivered to your email within 2 hours.',
        category: 'delivery',
      },
      {
        id: 'faq-5',
        question: 'Can we reschedule if an emergency occurs?',
        answer: 'Yes, you can click the reschedule link in your confirmation email anytime up to 4 hours before the call at no additional fee.',
        category: 'support',
      },
    ],
  },
];

const initialUsageMetrics: AIUsageMetrics = {
  totalRequests: 1420,
  requestsLimit: 5000,
  tokensUsed: 284100,
  tokensLimit: 1000000,
  estimatedCostUSD: 0.57,
  costLimitUSD: 5.0,
  activeWorkflows: 3,
  period: 'Current Billing Cycle (Oct 2026)',
  isSampleData: true,
  lastUpdated: 'Just now',
};

// Mock Service Implementation
class MockAIService implements AIServiceInterface {
  private workflows: AutoDMWorkflow[] = [...initialWorkflows];
  private conversations: AIReplyConversation[] = [...initialConversations];
  private productKnowledge: AIProductKnowledgeItem[] = [...initialProductKnowledge];
  private usage: AIUsageMetrics = { ...initialUsageMetrics };

  private delay(ms = 350): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  async getWorkflows(): Promise<AutoDMWorkflow[]> {
    await this.delay(200);
    return [...this.workflows];
  }

  async saveWorkflow(workflow: AutoDMWorkflow): Promise<AutoDMWorkflow> {
    await this.delay(350);
    const existingIndex = this.workflows.findIndex((w) => w.id === workflow.id);
    if (existingIndex >= 0) {
      this.workflows[existingIndex] = workflow;
    } else {
      this.workflows = [workflow, ...this.workflows];
    }
    this.usage.totalRequests += 1;
    this.usage.tokensUsed += 420;
    return workflow;
  }

  async toggleWorkflowStatus(id: string, newStatus?: 'active' | 'paused'): Promise<AutoDMWorkflow> {
    await this.delay(200);
    const wf = this.workflows.find((w) => w.id === id);
    if (!wf) throw new Error('Workflow not found');
    wf.status = newStatus || (wf.status === 'active' ? 'paused' : 'active');
    return { ...wf };
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.delay(200);
    this.workflows = this.workflows.filter((w) => w.id !== id);
  }

  async getReplyConversations(): Promise<AIReplyConversation[]> {
    await this.delay(200);
    return [...this.conversations];
  }

  async generateReplySuggestions(
    commentText: string,
    detectedIntent: AIIntent,
    productName = 'AI Roadmap 2026'
  ): Promise<Record<AITone, string>> {
    await this.delay(450);
    this.usage.totalRequests += 1;
    this.usage.tokensUsed += 680;

    const lower = commentText.toLowerCase();

    if (detectedIntent === 'pricing' || lower.includes('price') || lower.includes('cost')) {
      return {
        friendly: `Hey! The ${productName} is currently available for just ₹499 (limited launch pricing) 🙌 Grab your copy here: creatorhub.io/codewithnarayan/pay`,
        professional: `Hello. The standard fee for ${productName} is ₹499 with lifetime access and community support. Review details: creatorhub.io/codewithnarayan/pay`,
        persuasive: `Hey! It is just ₹499 today — the price increases to ₹999 this Sunday! Secure your copy now: creatorhub.io/codewithnarayan/pay`,
        concise: `Hey! Price is ₹499. Checkout link: creatorhub.io/codewithnarayan/pay`,
      };
    }

    if (detectedIntent === 'discount_request' || lower.includes('discount') || lower.includes('coupon')) {
      return {
        friendly: `Hey there! Yes, you can use code LAUNCH20 at checkout for an instant 20% discount 🎉 Here is your direct link: creatorhub.io/codewithnarayan`,
        professional: `Hello. A promotional voucher LAUNCH20 is valid for a 20% reduction at checkout: creatorhub.io/codewithnarayan`,
        persuasive: `Hey! Use code LAUNCH20 right now to claim 20% off before the voucher cap is reached! creatorhub.io/codewithnarayan`,
        concise: `Use coupon code LAUNCH20 for 20% off: creatorhub.io/codewithnarayan`,
      };
    }

    return {
      friendly: `Hey! Thanks so much for reaching out 🙌 You can check out all the details for ${productName} right here: creatorhub.io/codewithnarayan. Let me know if you need anything else!`,
      professional: `Hello. Thank you for your inquiry regarding ${productName}. Comprehensive details and documentation are available at creatorhub.io/codewithnarayan.`,
      persuasive: `Hey! Ready to level up your career? Check out ${productName} right now and start building today: creatorhub.io/codewithnarayan`,
      concise: `Hey! Full details for ${productName}: creatorhub.io/codewithnarayan`,
    };
  }

  async approveReply(conversationId: string, replyText: string): Promise<AIReplyConversation> {
    await this.delay(300);
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    conv.status = 'approved';
    conv.customReply = replyText;
    this.usage.totalRequests += 1;
    this.usage.tokensUsed += 250;
    return { ...conv };
  }

  async rejectReply(conversationId: string): Promise<AIReplyConversation> {
    await this.delay(200);
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    conv.status = 'rejected';
    return { ...conv };
  }

  async generateContentDraft(input: AIContentGeneratorInput): Promise<string> {
    await this.delay(600);
    this.usage.totalRequests += 1;
    this.usage.tokensUsed += 850;

    const { topic, targetAudience, tone, language, callToAction, formatType } = input;

    if (formatType === 'hooks') {
      return [
        `1. "Stop learning Web Development like it's 2022. Here is the modern 2026 stack:"`,
        `2. "I spent 4 years building SaaS apps — here are 3 mistakes costing you clients every week:"`,
        `3. "If you are struggling with ${topic}, here is the exact 5-step framework:"`,
        `4. "Nobody talks about this, but ${topic} can be mastered in 30 days if you follow this roadmap:"`,
        `5. "The biggest lie junior developers believe about ${topic} (and what actually works):"`,
      ].join('\n\n');
    }

    if (formatType === 'hashtags') {
      return `#${topic.replace(/\s+/g, '')} #WebDev2026 #CodeNewbie #CreatorCommerce #SuperProfile #FrontendDev #FullstackLife #TechCareers #LearnInPublic #SaaSBuilder #IndieHacker`;
    }

    if (formatType === 'product_description') {
      return `Transform your workflow with ${topic}.\n\nBuilt specifically for ${targetAudience}, this complete pack gives you everything you need to build, launch, and monetize faster.\n\n✨ Key Highlights:\n- Production-tested frameworks & real-world architectures\n- Zero fluff: straight to actionable code and strategies\n- Lifetime access with free future updates included\n\n👉 ${callToAction || 'Tap the link in bio to secure your copy today!'}`;
    }

    if (formatType === 'promo_message') {
      return `Hey everyone! 👋\n\nExcited to share that our brand new guide on ${topic} is officially live!\n\nWhether you are looking to save hours of development or boost your revenue, this guide is crafted specifically for ${targetAudience}.\n\n🔥 Limited Launch Offer:\nUse code LAUNCH20 at checkout for an exclusive 20% discount.\n\n${callToAction || 'Click the link in bio to get instant access!'}`;
    }

    // Default: Captions
    const toneIntro =
      tone === 'friendly'
        ? 'Here is something I wish someone had told me earlier 🙌'
        : tone === 'persuasive'
        ? 'If you are serious about leveling up, pay close attention to this ⚡'
        : tone === 'concise'
        ? 'Quick breakdown:'
        : 'Key insights and analysis for developers:';

    return `${toneIntro}\n\nWhen it comes to ${topic}, most ${targetAudience} get stuck trying to do everything at once.\n\nHere are 3 rules that will save you months of trial & error:\n\n1️⃣ Focus on high-leverage fundamentals first.\n2️⃣ Automate the repetitive tasks so you can focus on creative engineering.\n3️⃣ Always ship real projects rather than staying trapped in tutorial hell.\n\nDrop a comment with "${topic.split(' ')[0].toUpperCase()}" and I will send you the full breakdown in your DMs!\n\n${callToAction || '🔗 Link in bio to explore the complete resource library.'}\n\nLanguage: ${language} | Audience: ${targetAudience}`;
  }

  async getProductKnowledgeList(): Promise<AIProductKnowledgeItem[]> {
    await this.delay(200);
    return [...this.productKnowledge];
  }

  async saveProductKnowledge(item: AIProductKnowledgeItem): Promise<AIProductKnowledgeItem> {
    await this.delay(300);
    const idx = this.productKnowledge.findIndex((p) => p.id === item.id);
    if (idx >= 0) {
      this.productKnowledge[idx] = item;
    } else {
      this.productKnowledge = [...this.productKnowledge, item];
    }
    return item;
  }

  async evaluateGroundedAnswer(productId: string, question: string): Promise<GroundedAnswerResult> {
    await this.delay(400);
    this.usage.totalRequests += 1;
    this.usage.tokensUsed += 520;

    const prod = this.productKnowledge.find((p) => p.id === productId || p.productId === productId);
    const qLower = question.toLowerCase();

    // Check for ungrounded/unknown questions explicitly
    if (
      qLower.includes('bitcoin') ||
      qLower.includes('crypto') ||
      qLower.includes('cash on delivery') ||
      qLower.includes('offline classes') ||
      qLower.includes('job guarantee') ||
      qLower.includes('certificate accredited')
    ) {
      return {
        question,
        isGrounded: false,
        confidenceScore: 0.22,
        missingInformationWarning: `Information regarding "${question}" is NOT documented in the product knowledge base for ${prod?.productName || 'this product'}. The AI has explicitly declined to guess or fabricate facts to protect creator trust.`,
        answer: `I do not have verified information in the official product specifications regarding this inquiry. Please verify directly with the creator or support team before purchasing.`,
        suggestedFollowUp: 'Add a verified FAQ in the Knowledge Base to allow AI to answer this question accurately in future DMs.',
      };
    }

    if (!prod) {
      return {
        question,
        isGrounded: false,
        confidenceScore: 0.1,
        missingInformationWarning: 'Product could not be resolved in the knowledge base.',
        answer: 'Product details currently unavailable.',
      };
    }

    // Check pricing
    if (qLower.includes('price') || qLower.includes('cost') || qLower.includes('how much')) {
      return {
        question,
        isGrounded: true,
        groundedSource: `Pricing Specs: ${prod.productName} — ₹${prod.price}`,
        confidenceScore: 0.98,
        answer: `The official price for ${prod.productName} is ₹${prod.price}. Payments are securely processed via UPI and cards.`,
      };
    }

    // Check refund policy
    if (qLower.includes('refund') || qLower.includes('money back') || qLower.includes('cancel')) {
      return {
        question,
        isGrounded: true,
        groundedSource: `Refund Policy: ${prod.refundPolicy}`,
        confidenceScore: 0.95,
        answer: `Official policy: ${prod.refundPolicy}`,
      };
    }

    // Check delivery
    if (qLower.includes('deliver') || qLower.includes('access') || qLower.includes('download') || qLower.includes('receive')) {
      return {
        question,
        isGrounded: true,
        groundedSource: `Delivery Method: ${prod.deliveryMethod}`,
        confidenceScore: 0.96,
        answer: `Official delivery: ${prod.deliveryMethod}`,
      };
    }

    // Check existing FAQs
    const matchedFaq = prod.faqs.find((f) => {
      const fWords = f.question.toLowerCase().split(' ');
      return fWords.some((w) => w.length > 4 && qLower.includes(w));
    });

    if (matchedFaq) {
      return {
        question,
        isGrounded: true,
        groundedSource: `Verified FAQ: "${matchedFaq.question}"`,
        confidenceScore: 0.92,
        answer: matchedFaq.answer,
      };
    }

    // Fallback grounded on product summary & prerequisites
    return {
      question,
      isGrounded: true,
      groundedSource: `Product Overview: ${prod.summary}`,
      confidenceScore: 0.86,
      answer: `${prod.summary} Prerequisites: ${prod.prerequisites}`,
    };
  }

  async getUsageMetrics(): Promise<AIUsageMetrics> {
    await this.delay(150);
    return { ...this.usage };
  }
}

// Singleton export
export const aiService: AIServiceInterface = new MockAIService();
