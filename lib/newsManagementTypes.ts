// ============================================
// NEWS MANAGEMENT SYSTEM - TYPE DEFINITIONS
// Optimized for high-traffic operations
// ============================================

// News Categories
export type NewsCategory = 'breaking' | 'trending' | 'celebrity' | 'entertainment' | 'viral';

// Publishing Status
export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'rejected';

// Analytics Metrics
export interface NewsAnalytics {
  newsId: string;
  views: number;
  shares: number;
  comments: number;
  timestamp: number;
  engagement_rate: number;
  viral_score: number;
}

// Social Media Platforms
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram';

// Social Posting Status
export interface SocialPostStatus {
  platform: SocialPlatform;
  status: 'pending' | 'posted' | 'failed' | 'skipped';
  url?: string;
  error?: string;
  timestamp: number;
}

// Main News Document
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: NewsCategory;
  content: string;
  image_url?: string;
  video_url?: string;
  author: string;
  source?: string;
  
  // Status & Publishing
  status: PublishStatus;
  published_at?: number;
  scheduled_at?: number;
  created_at: number;
  updated_at: number;
  
  // Tags & SEO
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  
  // Social Media
  social_posts: SocialPostStatus[];
  auto_post_enabled: boolean;
  hashtags?: string[];
  
  // Analytics
  analytics?: NewsAnalytics;
  
  // Admin
  admin_id: string;
  approved_by?: string;
  rejection_reason?: string;
  visibility: 'public' | 'private' | 'scheduled';
}

// Bulk Operations
export interface BulkNewsOperation {
  operation_id: string;
  type: 'publish' | 'schedule' | 'archive' | 'delete' | 'social_post';
  news_ids: string[];
  category?: NewsCategory;
  scheduled_for?: number;
  social_platforms?: SocialPlatform[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  completed: number;
  failed: number;
  created_at: number;
  completed_at?: number;
  error_message?: string;
}

// Real-time Updates
export interface RealtimeUpdate {
  type: 'new_post' | 'engagement_spike' | 'trending_change' | 'social_success' | 'alert';
  news_id?: string;
  category?: NewsCategory;
  data: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// News Aggregation Source
export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  api_key?: string;
  is_active: boolean;
  last_synced: number;
}

// Schedule Item
export interface ScheduledNews {
  news_id: string;
  scheduled_for: number;
  category: NewsCategory;
  auto_social_post: boolean;
  created_by: string;
}

// Trending News Item (Live Trend Desk)
export interface TrendingNews {
  news_id: string;
  title: string;
  category: NewsCategory;
  current_rank: number;
  previous_rank: number;
  trend_score: number;
  momentum: number; // 1-10
  estimated_reach: number;
  last_updated: number;
}

// Intelligence Report (Social & News Hub)
export interface IntelligenceReport {
  report_id: string;
  generated_at: number;
  period_start: number;
  period_end: number;
  
  // Overall Metrics
  total_posts: number;
  total_engagement: number;
  avg_engagement_rate: number;
  
  // Category Breakdown
  category_performance: {
    [key in NewsCategory]: {
      count: number;
      avg_engagement: number;
      top_post?: NewsItem;
    };
  };
  
  // Social Performance
  social_performance: {
    platform: SocialPlatform;
    posts_count: number;
    engagement: number;
    reach: number;
  }[];
  
  // Trending Topics
  trending_topics: {
    topic: string;
    mentions: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  
  // Recommendations
  recommendations: string[];
}

// Role-Based Permissions
export interface AdminRole {
  role_id: string;
  role_name: string;
  permissions: {
    can_create_news: boolean;
    can_publish_news: boolean;
    can_schedule_news: boolean;
    can_bulk_operations: boolean;
    can_access_analytics: boolean;
    can_manage_social: boolean;
    can_approve_news: boolean;
    can_manage_sources: boolean;
    can_view_intelligence: boolean;
    can_export_data: boolean;
  };
}

// Admin User
export interface AdminUser {
  admin_id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: number;
  last_login: number;
}
