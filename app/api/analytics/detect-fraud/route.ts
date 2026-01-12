// Bot & Fraud Detection System
// Detects malicious traffic, bots, VPN/Proxy usage, and suspicious patterns

import { NextRequest, NextResponse } from 'next/server';

export interface FraudScore {
  sessionId: string;
  score: number; // 0-100, higher = more suspicious
  flags: string[];
  isBot: boolean;
  isVpn: boolean;
  isSuspicious: boolean;
  details: {
    clickPatternScore: number;
    userAgentScore: number;
    interactionScore: number;
    geolocationScore: number;
    networkScore: number;
  };
}

// Bot detection patterns
const BOT_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'scraper',
  'curl',
  'wget',
  'python',
  'java',
  'phantom',
  'headless',
  'selenium',
  'puppeteer',
  'playwright',
];

// Suspicious IP patterns
const SUSPICIOUS_IPS = new Set<string>();
const SESSION_PATTERNS = new Map<string, SessionBehavior>();

interface SessionBehavior {
  totalClicks: number;
  timeSpan: number; // milliseconds
  pagesVisited: number;
  scrollEvents: number;
  avgClickInterval: number;
  mouseMovements: number;
  keyboardEvents: number;
  startTime: number;
  endTime: number;
}

/**
 * Calculate fraud score for a session
 */
export function calculateFraudScore(
  sessionId: string,
  behavior: SessionBehavior,
  deviceInfo: any,
  geoData: any,
  networkInfo: any
): FraudScore {
  const flags: string[] = [];
  let score = 0;

  // 1. USER AGENT ANALYSIS
  const userAgent = deviceInfo.userAgent?.toLowerCase() || '';
  const userAgentScore = analyzeUserAgent(userAgent, flags);
  score += userAgentScore * 0.2;

  // 2. CLICK PATTERN ANALYSIS
  const clickPatternScore = analyzeClickPattern(behavior, flags);
  score += clickPatternScore * 0.3;

  // 3. INTERACTION ANALYSIS
  const interactionScore = analyzeInteractions(behavior, flags);
  score += interactionScore * 0.15;

  // 4. GEOLOCATION ANALYSIS
  const geolocationScore = analyzeGeolocation(geoData, flags);
  score += geolocationScore * 0.15;

  // 5. NETWORK ANALYSIS
  const networkScore = analyzeNetwork(networkInfo, geoData, flags);
  score += networkScore * 0.2;

  const isBot = score > 70;
  const isSuspicious = score > 40;

  return {
    sessionId,
    score: Math.round(score),
    flags,
    isBot,
    isVpn: networkInfo?.isVpn || false,
    isSuspicious,
    details: {
      userAgentScore: Math.round(userAgentScore),
      clickPatternScore: Math.round(clickPatternScore),
      interactionScore: Math.round(interactionScore),
      geolocationScore: Math.round(geolocationScore),
      networkScore: Math.round(networkScore),
    },
  };
}

/**
 * Analyze user agent for bot patterns
 */
function analyzeUserAgent(ua: string, flags: string[]): number {
  let score = 0;

  // Check for bot signatures
  for (const botPattern of BOT_USER_AGENTS) {
    if (ua.includes(botPattern)) {
      flags.push(`Bot pattern detected: ${botPattern}`);
      score += 25;
    }
  }

  // Check for unusual/missing user agents
  if (!ua || ua.length < 10) {
    flags.push('Suspiciously short or missing user agent');
    score += 15;
  }

  // Check for headless browser indicators
  if (ua.includes('headless') || ua.includes('phantom')) {
    flags.push('Headless browser detected');
    score += 30;
  }

  return Math.min(score, 100);
}

/**
 * Analyze click patterns for abnormalities
 */
function analyzeClickPattern(behavior: SessionBehavior, flags: string[]): number {
  let score = 0;

  const { totalClicks, timeSpan, pagesVisited, avgClickInterval } = behavior;

  // Super fast clicks = bot behavior
  if (avgClickInterval < 100) {
    flags.push(`Unnaturally fast click pattern: ${avgClickInterval}ms between clicks`);
    score += 40;
  }

  // Too many clicks for the time span
  const expectedClicks = (timeSpan / 1000) * 0.5; // ~1 click per 2 seconds is normal
  if (totalClicks > expectedClicks * 5) {
    flags.push(
      `Excessive clicks: ${totalClicks} clicks in ${timeSpan / 1000}s`
    );
    score += 30;
  }

  // Unusual click-to-page ratio
  if (totalClicks > 0 && pagesVisited > 0) {
    const clicksPerPage = totalClicks / pagesVisited;
    if (clicksPerPage > 100) {
      flags.push(`Excessive clicks per page: ${clicksPerPage.toFixed(1)}`);
      score += 25;
    }
  }

  // No scrolling = suspicious
  if (totalClicks > 10 && behavior.scrollEvents === 0) {
    flags.push('Clicks without scrolling (unnatural behavior)');
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Analyze interaction patterns
 */
function analyzeInteractions(behavior: SessionBehavior, flags: string[]): number {
  let score = 0;

  const { scrollEvents, keyboardEvents, mouseMovements, totalClicks } =
    behavior;

  // No mouse movements = bot
  if (totalClicks > 5 && mouseMovements === 0) {
    flags.push('Clicks without mouse movements');
    score += 35;
  }

  // No keyboard = suspicious for forms
  if (keyboardEvents === 0 && totalClicks > 0) {
    flags.push('No keyboard events (suspicious for form interactions)');
    score += 15;
  }

  // Unnatural interaction ratio
  if (mouseMovements > 0 && keyboardEvents > 0) {
    const ratio = mouseMovements / keyboardEvents;
    if (ratio > 100 || ratio < 0.01) {
      flags.push(`Unnatural mouse/keyboard ratio: ${ratio.toFixed(2)}`);
      score += 20;
    }
  }

  return Math.min(score, 100);
}

/**
 * Analyze geolocation for anomalies
 */
function analyzeGeolocation(geoData: any, flags: string[]): number {
  let score = 0;

  // Check for data center IPs
  if (isDataCenterIP(geoData.isp)) {
    flags.push('Data center IP detected (possible VPN/Proxy)');
    score += 30;
  }

  // Check for impossible travel (would need multiple sessions for this)
  // For now, just flag non-Nigeria access if local platform
  if (
    geoData.country &&
    geoData.country !== 'NG' &&
    geoData.country !== 'US'
  ) {
    score += 5; // Slight suspicion for non-primary regions
  }

  return Math.min(score, 100);
}

/**
 * Analyze network for suspicious patterns
 */
function analyzeNetwork(networkInfo: any, geoData: any, flags: string[]): number {
  let score = 0;

  // VPN detection
  if (networkInfo?.isVpn) {
    flags.push('VPN/Proxy detected');
    score += 25;
  }

  // Check for unusual network types
  if (networkInfo?.networkType === 'mobile' && networkInfo?.isVpn) {
    flags.push('Mobile network with VPN (higher suspicion)');
    score += 10;
  }

  // Check IP reputation (this would call external service in production)
  // For now, maintain a local list of flagged IPs
  if (SUSPICIOUS_IPS.has(networkInfo?.ip)) {
    flags.push('IP on suspicious list');
    score += 40;
  }

  return Math.min(score, 100);
}

/**
 * Check if IP belongs to data center
 */
function isDataCenterIP(isp: string): boolean {
  const dataCenterISPs = [
    'amazon',
    'aws',
    'azure',
    'google cloud',
    'digitalocean',
    'linode',
    'vultr',
    'ovh',
    'hetzner',
    'scaleway',
  ];

  const ispLower = (isp || '').toLowerCase();
  return dataCenterISPs.some((dc) => ispLower.includes(dc));
}

/**
 * Flag an IP as suspicious
 */
export function flagSuspiciousIP(ip: string) {
  SUSPICIOUS_IPS.add(ip);
}

/**
 * Detect click fraud (multiple clicks on same element)
 */
export function detectClickFraud(
  clicks: Array<{ elementId: string; timestamp: number }>
): boolean {
  if (clicks.length < 5) return false;

  // Count clicks on same element in short time
  const elementClicks = new Map<string, number[]>();

  for (const click of clicks) {
    if (!elementClicks.has(click.elementId)) {
      elementClicks.set(click.elementId, []);
    }
    elementClicks.get(click.elementId)!.push(click.timestamp);
  }

  // Check for rapid clicks on same element
  const entries = Array.from(elementClicks.entries());
  for (let i = 0; i < entries.length; i++) {
    const [elementId, timestamps] = entries[i];
    for (let j = 0; j < timestamps.length - 4; j++) {
      const timeDiff = timestamps[j + 4] - timestamps[j];
      if (timeDiff < 2000) {
        // 5 clicks in 2 seconds = fraud
        return true;
      }
    }
  }

  return false;
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, behavior, deviceInfo, geoData, networkInfo } = body;

    const fraudScore = calculateFraudScore(
      sessionId,
      behavior,
      deviceInfo,
      geoData,
      networkInfo
    );

    // If highly suspicious, flag the IP
    if (fraudScore.isBot) {
      flagSuspiciousIP(networkInfo.ip);
    }

    return NextResponse.json({
      success: true,
      fraudScore,
      blocked: fraudScore.score > 85,
    });
  } catch (error) {
    console.error('Error analyzing fraud score:', error);
    return NextResponse.json(
      { error: 'Failed to analyze fraud score' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'suspicious-ips') {
    return NextResponse.json({
      count: SUSPICIOUS_IPS.size,
      ips: Array.from(SUSPICIOUS_IPS),
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
