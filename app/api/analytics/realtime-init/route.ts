// API Route: Realtime Visitor Tracking & WebSocket Manager
// POST /api/analytics/realtime-init

import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeAnalyticsEngine } from '@/lib/analytics/RealtimeAnalyticsEngine';
import { getAnalyticsWebSocketServer } from '@/lib/websocket/WebSocketServer';

/**
 * Initialize WebSocket server and get real-time stats
 * GET: Retrieve current real-time statistics
 * POST: Track new visitor or event
 */
export async function GET(request: NextRequest) {
  try {
    const engine = getRealtimeAnalyticsEngine();
    const wsServer = getAnalyticsWebSocketServer();

    return NextResponse.json({
      status: 'ok',
      analytics: engine.getSummary(),
      websocket: wsServer.getStats(),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    return NextResponse.json(
      { error: 'Failed to get realtime stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      sessionId,
      userId,
      deviceInfo,
      geoLocation,
      page,
      element,
      coordinates,
      scrollDepth,
    } = body;

    const engine = getRealtimeAnalyticsEngine();

    switch (action) {
      case 'track_visitor':
        const session = engine.trackVisitor(
          sessionId,
          userId,
          deviceInfo || {},
          geoLocation || {}
        );
        return NextResponse.json({
          status: 'ok',
          session,
          timestamp: Date.now(),
        });

      case 'track_page_view':
        engine.trackPageView(sessionId, page, userId);
        return NextResponse.json({
          status: 'ok',
          timestamp: Date.now(),
        });

      case 'track_click':
        engine.trackClick(sessionId, element, coordinates, userId);
        return NextResponse.json({
          status: 'ok',
          timestamp: Date.now(),
        });

      case 'track_scroll':
        engine.trackScroll(sessionId, scrollDepth, userId);
        return NextResponse.json({
          status: 'ok',
          timestamp: Date.now(),
        });

      case 'end_session':
        engine.endSession(sessionId);
        return NextResponse.json({
          status: 'ok',
          timestamp: Date.now(),
        });

      case 'get_session':
        const session2 = engine.getSession(sessionId);
        return NextResponse.json({
          status: 'ok',
          session: session2,
          timestamp: Date.now(),
        });

      case 'get_stats':
        const stats = engine.getStats();
        return NextResponse.json({
          status: 'ok',
          stats,
          timestamp: Date.now(),
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in realtime tracking:', error);
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    );
  }
}
