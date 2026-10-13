/* ============================================================
   CreatorHub — Types & Interfaces
   Comprehensive Production-grade SaaS Types
   ============================================================ */

export type ProductType =
  | 'digital'
  | 'course'
  | 'service'
  | 'community'
  | 'webinar'
  | 'bundle';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  originalPrice?: number;
  salesCount: number;
  revenue: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  thumbnailUrl: string;
  category: string;
  isFeatured?: boolean;
  fileDetails?: {
    size: string;
    format: string;
    downloads: number;
  };
  serviceDetails?: {
    durationMinutes: number;
    platform: 'google_meet' | 'zoom';
    availableSlots: number;
  };
  communityDetails?: {
    platform: 'telegram' | 'discord';
    membersCount: number;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  conversionRate: number;
  conversionChange: number;
  averageOrderValue: number;
  storeViews: number;
}

export interface RevenueDataPoint {
  label: string;
  revenue: number;
  orders: number;
  views: number;
}

export type OrderStatus = 'completed' | 'pending' | 'refunded' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  productName: string;
  productId: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  createdAt: string;
  refundReason?: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'review' | 'automation';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  totalSpend: number;
  ordersCount: number;
  lastActive: string;
  tags: string[];
  joinedAt: string;
  source: 'instagram' | 'youtube' | 'direct' | 'whatsapp';
  recentProduct: string;
}

export interface AutomationRule {
  id: string;
  title: string;
  platform: 'instagram' | 'whatsapp' | 'email';
  triggerType: 'comment_keyword' | 'story_reply' | 'cart_abandoned' | 'post_purchase';
  triggerKeyword?: string;
  responsePreview: string;
  actionSummary: string;
  active: boolean;
  sentCount: number;
  conversionRate: number;
  extraRevenue: number;
  lastTriggered: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'resource';
  isFreePreview?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  thumbnailUrl: string;
  studentsCount: number;
  completionRate: number;
  rating: number;
  reviewsCount: number;
  price: number;
  revenue: number;
  status: 'published' | 'draft';
  totalDuration: string;
  sectionsCount: number;
  lessonsCount: number;
  sections: CourseSection[];
}

export interface IntegrationApp {
  id: string;
  name: string;
  category: 'payments' | 'social' | 'marketing' | 'utilities';
  description: string;
  icon: string;
  connected: boolean;
  badge?: string;
  lastSync?: string;
  config?: Record<string, string>;
}

export interface StorefrontBlock {
  id: string;
  type: 'product' | 'course' | 'booking' | 'link' | 'newsletter' | 'banner' | 'faq';
  title: string;
  subtitle?: string;
  url?: string;
  targetId?: string;
  badge?: string;
  visible: boolean;
  highlight?: boolean;
}

export interface StorefrontConfig {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerGradient: string;
  themePreset: 'indigo' | 'obsidian' | 'emerald' | 'sunset' | 'clean_light';
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  cardStyle: 'glass' | 'solid' | 'bordered';
  verified: boolean;
  socials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    telegram?: string;
    whatsapp?: string;
    linkedin?: string;
  };
  blocks: StorefrontBlock[];
}

export type ThemeMode = 'indigo' | 'obsidian' | 'emerald' | 'sunset' | 'light';
