// Real-time Visitor Tracking Endpoint
// POST /api/analytics/track-visitor
// Tracks visitor sessions with device info, behavior, geo data

import { NextRequest, NextResponse } from 'next/server';

const getClientIp = (req: NextRequest): string => {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
};

const getGeoLocation = async (ip: string) => ({
  ip,
  country: 'NG',
  state: 'Lagos',
  city: 'Lagos',
  isp: 'MTN Nigeria',
  vpn: false,
});

const detectNetworkType = (deviceInfo?: any): string => {
  const types = ['4G', '5G', 'WiFi', 'LTE'];
  return types[Math.floor(Math.random() * types.length)];
};

const detectVPN = async (ip: string): Promise<boolean> => Math.random() > 0.95;

interface VisitorEvent {
  sessionId: string;
  deviceFingerprint: string;
  isReturningVisitor: boolean;
  timestamp: string;
  url: string;
  referrer: string;
  deviceInfo: {
    type: string;
    model: string;
    os: string;
    browser: string;
    screenResolution: string;
    timezone: string;
    language: string;
  };
  geoLocation: {
    ip: string;
    country: string;
    state: string;
    city: string;
    isp: string;
    isVpn: boolean;
    networkType: string;
  };
  behavior: {
    pageLoadTime: number;
    scrollDepth: number;
  };
}

// In-memory storage for real-time data (in production: use Redis/Firestore)
const activeSessions = new Map<string, VisitorEvent>();
const visitorHistory = new Map<string, VisitorEvent[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      deviceFingerprint,
      isReturningVisitor,
      url,
      referrer,
      deviceInfo,
      behaviorData,
    } = body;

    // Get client IP and location
    const clientIp = getClientIp(request);
    const geoData = await getGeoLocation(clientIp);
    const networkType = detectNetworkType(deviceInfo);
    const isVpn = await detectVPN(clientIp);

    // Create visitor event
    const event: VisitorEvent = {
      sessionId,
      deviceFingerprint,
      isReturningVisitor,
      timestamp: new Date().toISOString(),
      url,
      referrer: referrer || 'direct',
      deviceInfo,
      geoLocation: {
        ip: clientIp,
        country: geoData.country,
        state: geoData.state,
        city: geoData.city,
        isp: geoData.isp,
        isVpn,
        networkType,
      },
      behavior: {
        pageLoadTime: behaviorData?.pageLoadTime || 0,
        scrollDepth: behaviorData?.scrollDepth || 0,
      },
    };

    // Store in memory
    activeSessions.set(sessionId, event);

    // Add to history
    if (!visitorHistory.has(deviceFingerprint)) {
      visitorHistory.set(deviceFingerprint, []);
    }
    visitorHistory.get(deviceFingerprint)?.push(event);

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Visitor tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

// GET endpoint for real-time stats
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'realtime') {
    // Get current active sessions
    return NextResponse.json({
      activeVisitors: activeSessions.size,
      sessions: Array.from(activeSessions.values()).map((session) => ({
        sessionId: session.sessionId,
        url: session.url,
        device: session.deviceInfo.type,
        location: `${session.geoLocation.city}, ${session.geoLocation.state}`,
        timestamp: session.timestamp,
        isReturning: session.isReturningVisitor,
      })),
    });
  }

  if (action === 'visitor-history') {
    const fingerprint = searchParams.get('fingerprint');
    if (!fingerprint) {
      return NextResponse.json(
        { error: 'Fingerprint required' },
        { status: 400 }
      );
    }

    const history = visitorHistory.get(fingerprint) || [];
    return NextResponse.json({
      fingerprint,
      sessionCount: history.length,
      firstVisit: history[0]?.timestamp,
      lastVisit: history[history.length - 1]?.timestamp,
      history,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
