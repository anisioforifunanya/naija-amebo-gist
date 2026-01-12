// Traffic Source Detection & Attribution
// Identifies where visitors come from: Google, Social Media, Direct, Referrals, etc.

import { NextRequest, NextResponse } from 'next/server';

export interface TrafficSource {
  type:
    | 'google'
    | 'instagram'
    | 'tiktok'
    | 'x'
    | 'facebook'
    | 'linkedin'
    | 'whatsapp'
    | 'telegram'
    | 'direct'
    | 'referral'
    | 'organic'
    | 'paid'
    | 'email'
    | 'unknown';
  source: string;
  medium: string;
  campaign?: string;
  keyword?: string;
  confidence: number;
}

export interface TrafficSourceMetrics {
  source: string;
  visitors: number;
  pageViews: number;
  avgTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
}

// Track traffic sources
const trafficSources = new Map<string, TrafficSourceMetrics>();

/**
 * Detect traffic source from referrer and URL parameters
 */
export function detectTrafficSource(
  referrer: string,
  searchParams: URLSearchParams
): TrafficSource {
  // Check UTM parameters first
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');
  const utmTerm = searchParams.get('utm_term');

  if (utmSource) {
    return {
      type: utmSource.toLowerCase() as any,
      source: utmSource,
      medium: utmMedium || 'organic',
      campaign: utmCampaign ?? undefined,
      keyword: utmTerm ?? undefined,
      confidence: 0.99,
    };
  }

  // If no referrer, it's direct
  if (!referrer || referrer === '' || referrer === 'no referrer') {
    return {
      type: 'direct',
      source: 'Direct',
      medium: 'direct',
      confidence: 1.0,
    };
  }

  // Detect from referrer string
  return detectFromReferrer(referrer);
}

/**
 * Detect source from referrer domain
 */
function detectFromReferrer(referrer: string): TrafficSource {
  const url = new URL(referrer);
  const domain = url.hostname.toLowerCase();
  const searchParams = url.searchParams;

  // Google Search
  if (domain.includes('google.')) {
    const keyword = searchParams.get('q') || '';
    return {
      type: 'google',
      source: 'Google',
      medium: 'organic',
      keyword,
      confidence: 0.98,
    };
  }

  // Instagram
  if (
    domain.includes('instagram.com') ||
    domain.includes('l.instagram.com')
  ) {
    return {
      type: 'instagram',
      source: 'Instagram',
      medium: 'social',
      confidence: 0.95,
    };
  }

  // TikTok
  if (domain.includes('tiktok.com') || domain.includes('vt.tiktok.com')) {
    return {
      type: 'tiktok',
      source: 'TikTok',
      medium: 'social',
      confidence: 0.95,
    };
  }

  // Twitter/X
  if (
    domain.includes('twitter.com') ||
    domain.includes('x.com') ||
    domain.includes('t.co')
  ) {
    return {
      type: 'x',
      source: 'X (Twitter)',
      medium: 'social',
      confidence: 0.95,
    };
  }

  // Facebook
  if (domain.includes('facebook.com') || domain.includes('fb.com')) {
    return {
      type: 'facebook',
      source: 'Facebook',
      medium: 'social',
      confidence: 0.95,
    };
  }

  // LinkedIn
  if (domain.includes('linkedin.com')) {
    return {
      type: 'linkedin',
      source: 'LinkedIn',
      medium: 'social',
      confidence: 0.95,
    };
  }

  // WhatsApp
  if (domain.includes('whatsapp.com') || domain.includes('wa.me')) {
    return {
      type: 'whatsapp',
      source: 'WhatsApp',
      medium: 'messaging',
      confidence: 0.9,
    };
  }

  // Telegram
  if (domain.includes('telegram.com') || domain.includes('t.me')) {
    return {
      type: 'telegram',
      source: 'Telegram',
      medium: 'messaging',
      confidence: 0.9,
    };
  }

  // Email (common patterns)
  if (domain.includes('mail.') || domain.includes('email')) {
    return {
      type: 'email',
      source: 'Email',
      medium: 'email',
      confidence: 0.85,
    };
  }

  // Other organic search engines
  if (
    domain.includes('bing.') ||
    domain.includes('yahoo.') ||
    domain.includes('yandex.') ||
    domain.includes('duckduckgo.') ||
    domain.includes('baidu.')
  ) {
    return {
      type: 'organic',
      source: domain.split('.')[0].toUpperCase(),
      medium: 'organic',
      keyword: searchParams.get('q') || '',
      confidence: 0.9,
    };
  }

  // Default: other referral
  return {
    type: 'referral',
    source: domain,
    medium: 'referral',
    confidence: 0.7,
  };
}

/**
 * Track traffic source metrics
 */
export async function trackTrafficSource(
  source: TrafficSource,
  metrics: {
    pageViews: number;
    timeOnSite: number;
    bounceRate: number;
    conversionRate: number;
  }
) {
  const key = source.source;

  if (!trafficSources.has(key)) {
    trafficSources.set(key, {
      source: key,
      visitors: 0,
      pageViews: 0,
      avgTimeOnSite: 0,
      bounceRate: 0,
      conversionRate: 0,
    });
  }

  const current = trafficSources.get(key)!;
  current.visitors++;
  current.pageViews += metrics.pageViews;
  current.avgTimeOnSite =
    (current.avgTimeOnSite + metrics.timeOnSite) / current.visitors;
  current.bounceRate =
    (current.bounceRate + metrics.bounceRate) / current.visitors;
  current.conversionRate =
    (current.conversionRate + metrics.conversionRate) / current.visitors;
}

/**
 * Get traffic source statistics
 */
export function getTrafficSourceStats(): TrafficSourceMetrics[] {
  return Array.from(trafficSources.values()).sort(
    (a, b) => b.visitors - a.visitors
  );
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer, url, metrics } = body;

    const searchParams = new URL(url).searchParams;
    const source = detectTrafficSource(referrer, searchParams);

    // Track the source
    await trackTrafficSource(source, metrics);

    return NextResponse.json({
      success: true,
      source,
      message: 'Traffic source tracked',
    });
  } catch (error) {
    console.error('Error tracking traffic source:', error);
    return NextResponse.json(
      { error: 'Failed to track traffic source' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const stats = getTrafficSourceStats();
    const totalVisitors = stats.reduce((sum, s) => sum + s.visitors, 0);
    const totalPageViews = stats.reduce((sum, s) => sum + s.pageViews, 0);
    const avgBounceRate =
      stats.reduce((sum, s) => sum + s.bounceRate, 0) / stats.length || 0;

    return NextResponse.json({
      totalVisitors,
      totalPageViews,
      avgBounceRate,
      sources: stats.map((s) => ({
        ...s,
        percentage: ((s.visitors / totalVisitors) * 100).toFixed(2),
      })),
    });
  }

  if (action === 'detect') {
    const referrer = searchParams.get('referrer') || '';
    const url = searchParams.get('url') || 'https://example.com';
    const source = detectTrafficSource(
      referrer,
      new URL(url).searchParams
    );
    return NextResponse.json(source);
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
