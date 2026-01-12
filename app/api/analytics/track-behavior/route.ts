// Behavior Tracking Endpoint
// POST /api/analytics/track-behavior
// Tracks user interactions: clicks, scrolls, form submissions, time-on-page

import { NextRequest, NextResponse } from 'next/server';

interface BehaviorEvent {
  sessionId: string;
  timestamp: string;
  eventType:
    | 'click'
    | 'scroll'
    | 'form_submission'
    | 'form_abandonment'
    | 'page_view'
    | 'page_exit';
  url: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
  scrollDepth?: number;
  timeOnPage?: number;
  formId?: string;
  formData?: Record<string, any>;
  rageClick?: boolean; // Multiple clicks in short time
}

// In-memory storage
const behaviorEvents = new Map<string, BehaviorEvent[]>();
const sessionMetrics = new Map<
  string,
  {
    pageViews: number;
    clicks: number;
    rageClicks: number;
    scrollEvents: number;
    formSubmissions: number;
    formAbandonments: number;
    totalTimeOnSite: number;
    pagesVisited: string[];
    lastActivity: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      eventType,
      url,
      elementId,
      elementClass,
      elementText,
      scrollDepth,
      timeOnPage,
      formId,
      rageClick,
    } = body;

    const event: BehaviorEvent = {
      sessionId,
      timestamp: new Date().toISOString(),
      eventType,
      url,
      elementId,
      elementClass,
      elementText,
      scrollDepth,
      timeOnPage,
      formId,
      rageClick: rageClick || false,
    };

    // Store event
    if (!behaviorEvents.has(sessionId)) {
      behaviorEvents.set(sessionId, []);
      sessionMetrics.set(sessionId, {
        pageViews: 0,
        clicks: 0,
        rageClicks: 0,
        scrollEvents: 0,
        formSubmissions: 0,
        formAbandonments: 0,
        totalTimeOnSite: 0,
        pagesVisited: [],
        lastActivity: new Date().toISOString(),
      });
    }

    behaviorEvents.get(sessionId)?.push(event);

    // Update metrics
    const metrics = sessionMetrics.get(sessionId)!;
    metrics.lastActivity = new Date().toISOString();

    switch (eventType) {
      case 'page_view':
        metrics.pageViews++;
        if (!metrics.pagesVisited.includes(url)) {
          metrics.pagesVisited.push(url);
        }
        break;
      case 'click':
        metrics.clicks++;
        if (rageClick) metrics.rageClicks++;
        break;
      case 'scroll':
        metrics.scrollEvents++;
        break;
      case 'form_submission':
        metrics.formSubmissions++;
        break;
      case 'form_abandonment':
        metrics.formAbandonments++;
        break;
    }

    if (timeOnPage) {
      metrics.totalTimeOnSite += timeOnPage;
    }

    return NextResponse.json({
      success: true,
      eventType,
      message: 'Behavior tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve behavior data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const action = searchParams.get('action');

  if (action === 'metrics' && sessionId) {
    const metrics = sessionMetrics.get(sessionId);
    if (!metrics) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId,
      ...metrics,
      bounceRate:
        metrics.pageViews === 1 && metrics.totalTimeOnSite < 5 ? 100 : 0,
    });
  }

  if (action === 'events' && sessionId) {
    const events = behaviorEvents.get(sessionId) || [];
    return NextResponse.json({
      sessionId,
      eventCount: events.length,
      events,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
