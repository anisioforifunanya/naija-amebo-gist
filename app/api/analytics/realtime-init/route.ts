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
      deviceFingerprint,
      events,
      pageUrl,
      userAgent,
      timestamp
    } = body;

    const engine = getRealtimeAnalyticsEngine();
    const wsServer = getAnalyticsWebSocketServer();

    // If events array is provided (from AnalyticsTracker)
    if (action === 'track_visitor' && events && Array.isArray(events)) {
      console.log(`📊 Processing ${events.length} analytics events from session ${sessionId}`);
      
      const processedEvents = [];
      for (const event of events) {
        // Track the main event
        if (event.eventType === 'page_view') {
          engine.trackPageView(sessionId, event.pageUrl, userId);
        } else if (event.eventType === 'click') {
          engine.trackClick(sessionId, event.eventData.elementTag, event.eventData, userId);
        } else if (event.eventType === 'scroll') {
          engine.trackScroll(sessionId, event.eventData.scrollPercent, userId);
        }

        // Emit via WebSocket for real-time dashboard
        wsServer.emitEvent({
          type: (event.eventType === 'page_view' ? 'page_view' : 
                 event.eventType === 'click' ? 'click' : 
                 event.eventType === 'scroll' ? 'scroll' : 'engagement') as any,
          timestamp: Date.now(),
          sessionId,
          userId,
          data: {
            deviceFingerprint,
            eventType: event.eventType,
            eventData: event.eventData,
            pageUrl: event.pageUrl,
            userAgent: event.userAgent,
            timezone: event.timezone,
            language: event.language
          }
        });

        processedEvents.push(event.eventType);
      }

      console.log(`✅ Processed events: ${processedEvents.join(', ')}`);
      
      return NextResponse.json({
        status: 'ok',
        message: `Processed ${events.length} events`,
        events: processedEvents,
        stats: engine.getSummary(),
        timestamp: Date.now(),
      });
    }

    // Legacy handling
    const {
      deviceInfo,
      geoLocation,
      page,
      element,
      coordinates,
      scrollDepth,
    } = body;

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
