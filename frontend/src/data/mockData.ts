/**
 * CreatorHub — Master Mock Data Store
 * Modeled exactly after SuperProfile's creator commerce & Instagram AutoDM architecture.
 */

export interface AutoDMWorkflow {
  id: string;
  name: string;
  captionPreview: string;
  thumbnailUrl: string;
  keyword: string;
  dmMessage: string;
  publicReply: string;
  followersGained: number;
  runs: number;
  buttonClicks: number;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface StoreContentBlock {
  id: string;
  type: 'digital' | 'lead_magnet' | 'booking' | 'community' | 'course' | 'link';
  title: string;
  subtitle?: string;
  price?: number;
  badge?: string;
  url?: string;
  visible: boolean;
}

export interface AudienceSegment {
  id: string;
  name: string;
  type: 'dynamic' | 'custom';
  contactsCount: number;
  campaignsCount: number;
  lastUpdated: string;
  createdOn: string;
  platformIcon?: 'instagram' | 'cart' | 'user' | 'bell';
}

export interface AudienceContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  instagramHandle?: string;
  segment: string;
  totalSpend: number;
  ordersCount: number;
  lastActive: string;
}

export interface PaymentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  status: 'completed' | 'refunded' | 'pending';
  transactionRef: string;
  date: string;
}

/* ============================================================
   1. Creator Profile Config (Matching SuperProfile Screenshot)
   ============================================================ */
export const mockCreatorProfile = {
  name: 'narayan prasad maurya',
  handle: 'codewithnarayan',
  tagline: 'Welcome to my SuperProfile! 🚀',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  instagram: 'https://instagram.com/codewithnarayan',
  storeUrl: 'creatorhub.io/codewithnarayan',
  plan: 'Free Plan',
  connectedAccounts: {
    instagram: {
      handle: '@codewithnarayan',
      connected: true,
      mode: 'demo' as const, // clearly distinguish demo data from live Meta API
      followers: '24.8K',
    },
    metaApiStatus: 'Ready for Meta App Review',
  },
};

/* ============================================================
   2. AutoDM Data (Exact metrics from Screenshot 5)
   ============================================================ */
export const mockAutoDMStats = {
  dmsSent: 277,
  emailsCollected: 5,
  followersGained: 184,
  referralEarnings: 48302,
};

export const mockAutoDMWorkflows: AutoDMWorkflow[] = [
  {
    id: 'adm-1',
    name: 'Instagram Reel: AI Tools Roadmap 2026',
    captionPreview: 'Top 5 AI tools every developer must master. Comment "AI" to get direct link!',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    keyword: 'AI',
    dmMessage: 'Hey {{first_name}}! Here is your curated list of AI Tools & Roadmap PDF: {{link}} 🚀',
    publicReply: 'Sent to your DMs! Check your inbox 📥',
    followersGained: 82,
    runs: 142,
    buttonClicks: 118,
    status: 'active',
    createdAt: '11 Oct 2026',
  },
  {
    id: 'adm-2',
    name: 'Instagram Post: Figma UI Kit Starter Pack',
    captionPreview: 'Giving away my design tokens system for free! Drop "TOKENS" below 👇',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&q=80',
    keyword: 'TOKENS',
    dmMessage: 'Here is your Figma component tokens file: {{link}}. Enjoy designing! 🎨',
    publicReply: 'Check your DM! Sent right away ⚡',
    followersGained: 64,
    runs: 95,
    buttonClicks: 74,
    status: 'active',
    createdAt: '12 Oct 2026',
  },
  {
    id: 'adm-3',
    name: 'Carousel: Freelance Remote Contract Checklist',
    captionPreview: 'How I landed $80/hr remote clients. Comment "GUIDE" for the proposal template.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&q=80',
    keyword: 'GUIDE',
    dmMessage: 'Hey {{first_name}}! Download your free Remote Pitch Deck & Contract: {{link}}',
    publicReply: 'Just sent the guide to your DM! 📩',
    followersGained: 38,
    runs: 40,
    buttonClicks: 32,
    status: 'active',
    createdAt: '13 Oct 2026',
  },
];

/* ============================================================
   3. Store Blocks (Screenshot 2)
   ============================================================ */
export const mockStoreBlocks: StoreContentBlock[] = [
  {
    id: 'blk-1',
    type: 'digital',
    title: 'AI Engineering Roadmap 2026 (PDF + Code)',
    subtitle: 'Comprehensive guide to building production AI agents',
    price: 499,
    badge: 'Bestseller 🔥',
    visible: true,
  },
  {
    id: 'blk-2',
    type: 'lead_magnet',
    title: 'Free 50+ Figma SaaS Design Tokens',
    subtitle: 'Join 10k+ designers using this production library',
    price: 0,
    badge: 'FREE',
    visible: true,
  },
  {
    id: 'blk-3',
    type: 'booking',
    title: '1:1 Career Strategy & Code Review Call',
    subtitle: '45-minute video consultation on Google Meet',
    price: 1999,
    badge: '3 Slots Left',
    visible: true,
  },
  {
    id: 'blk-4',
    type: 'community',
    title: 'VIP Telegram Developer Community',
    subtitle: 'Daily job leads, code reviews, and insider AMAs',
    price: 299,
    badge: 'VIP',
    visible: true,
  },
];

/* ============================================================
   4. Audience Segments (Screenshot 4)
   ============================================================ */
export const mockAudienceSegments: AudienceSegment[] = [
  {
    id: 'seg-1',
    name: 'Abandoned Carts',
    type: 'dynamic',
    contactsCount: 0,
    campaignsCount: 0,
    lastUpdated: '11:03 PM, 12 Oct 2026',
    createdOn: '11:02 PM, 12 Oct 2026',
    platformIcon: 'cart',
  },
  {
    id: 'seg-2',
    name: 'Customers',
    type: 'dynamic',
    contactsCount: 0,
    campaignsCount: 0,
    lastUpdated: '11:02 PM, 12 Oct 2026',
    createdOn: '11:02 PM, 12 Oct 2026',
    platformIcon: 'user',
  },
  {
    id: 'seg-3',
    name: 'Followers',
    type: 'dynamic',
    contactsCount: 0,
    campaignsCount: 0,
    lastUpdated: '06:45 PM, 13 Oct 2026',
    createdOn: '11:02 PM, 12 Oct 2026',
    platformIcon: 'bell',
  },
  {
    id: 'seg-4',
    name: 'Instagram Contacts',
    type: 'dynamic',
    contactsCount: 5,
    campaignsCount: 0,
    lastUpdated: '06:45 PM, 13 Oct 2026',
    createdOn: '05:04 PM, 11 Oct 2026',
    platformIcon: 'instagram',
  },
];

export const mockAudienceContacts: AudienceContact[] = [
  {
    id: 'c-1',
    name: 'Priya Sharma',
    email: 'priya.s@gmail.com',
    phone: '+91 98765 43210',
    instagramHandle: '@priya_codes',
    segment: 'Instagram Contacts',
    totalSpend: 499,
    ordersCount: 1,
    lastActive: '10 min ago',
  },
  {
    id: 'c-2',
    name: 'Arjun Mehta',
    email: 'arjun.m@techcorp.in',
    phone: '+91 98112 34567',
    instagramHandle: '@arjun_dev',
    segment: 'Instagram Contacts',
    totalSpend: 1999,
    ordersCount: 1,
    lastActive: '2 hours ago',
  },
  {
    id: 'c-3',
    name: 'Neha Gupta',
    email: 'neha.g@designhub.co',
    phone: '+91 97234 56789',
    instagramHandle: '@neha_designs',
    segment: 'Instagram Contacts',
    totalSpend: 0,
    ordersCount: 0,
    lastActive: '1 day ago',
  },
  {
    id: 'c-4',
    name: 'Rahul Verma',
    email: 'rahul.v@codecraft.org',
    instagramHandle: '@rahul_v',
    segment: 'Instagram Contacts',
    totalSpend: 299,
    ordersCount: 1,
    lastActive: '2 days ago',
  },
  {
    id: 'c-5',
    name: 'Ananya Singh',
    email: 'ananya.s@creator.ai',
    instagramHandle: '@ananya_creator',
    segment: 'Instagram Contacts',
    totalSpend: 499,
    ordersCount: 1,
    lastActive: '3 days ago',
  },
];

/* ============================================================
   5. Payment Transactions
   ============================================================ */
export const mockPaymentTransactions: PaymentTransaction[] = [
  {
    id: 'PAY-8912',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@gmail.com',
    productName: 'AI Engineering Roadmap 2026 (PDF)',
    amount: 499,
    paymentMethod: 'upi',
    status: 'completed',
    transactionRef: 'UPI-8912-RZP',
    date: '13 Oct 2026, 17:42',
  },
  {
    id: 'PAY-8911',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.m@techcorp.in',
    productName: '1:1 Career Strategy & Code Review Call',
    amount: 1999,
    paymentMethod: 'card',
    status: 'completed',
    transactionRef: 'CARD-4192-STRIPE',
    date: '13 Oct 2026, 14:15',
  },
  {
    id: 'PAY-8910',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.v@codecraft.org',
    productName: 'VIP Telegram Developer Community',
    amount: 299,
    paymentMethod: 'upi',
    status: 'completed',
    transactionRef: 'UPI-7712-RZP',
    date: '12 Oct 2026, 19:30',
  },
];
