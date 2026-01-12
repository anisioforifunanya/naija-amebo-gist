// Real-Time Analytics Engine
// Tracks visitor sessions, events, and maintains live statistics

import { AnalyticsEvent, getAnalyticsWebSocketServer } from '@/lib/websocket/WebSocketServer';

export interface VisitorSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageCount: number;
  clickCount: number;
  scrollDepth: number;
  deviceInfo: Record<string, any>;
  geoLocation: {
    country?: string;
    state?: string;
    city?: string;
  };
  isActive: boolean;
}

export interface RealTimeStats {
  totalActiveSessions: number;
  totalPageViews: number;
  totalClicks: number;
  averageSessionDuration: number;
  deviceBreakdown: Record<string, number>;
  topPages: Array<{ page: string; views: number }>;
  geoDistribution: Record<string, number>;
  lastUpdate: number;
}

export class RealtimeAnalyticsEngine {
  private activeSessions: Map<string, VisitorSession> = new Map();
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private stats: RealTimeStats = {
    totalActiveSessions: 0,
    totalPageViews: 0,
    totalClicks: 0,
    averageSessionDuration: 0,
    deviceBreakdown: {},
    topPages: [],
    geoDistribution: {},
    lastUpdate: Date.now(),
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Start cleanup routine
    this.startSessionCleanup();
    console.log('[Analytics Engine] Initialized');
  }

  /**
   * Create or update a visitor session
   */
  public trackVisitor(
    sessionId: string,
    userId: string | undefined,
    deviceInfo: Record<string, any>,
    geoLocation: any
  ): VisitorSession {
    let session = this.activeSessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageCount: 0,
        clickCount: 0,
        scrollDepth: 0,
        deviceInfo,
        geoLocation,
        isActive: true,
      };

      this.activeSessions.set(sessionId, session);

      // Emit visitor event
      this.emitEvent('visitor', sessionId, userId, {
        action: 'session_start',
        device: deviceInfo,
        location: geoLocation,
      });

      console.log(`[Analytics Engine] New visitor session: ${sessionId}`);
    } else {
      // Update existing session
      session.lastActivity = Date.now();
      session.userId = userId;
      session.deviceInfo = deviceInfo;
      session.geoLocation = geoLocation;
    }

    return session;
  }

  /**
   * Track page view
   */
  public trackPageView(
    sessionId: string,
    page: string,
    userId?: string
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.pageCount++;
    session.lastActivity = Date.now();
    this.stats.totalPageViews++;

    this.emitEvent('page_view', sessionId, userId, {
      page,
      timestamp: Date.now(),
    });
  }

  /**
   * Track click event
   */
  public trackClick(
    sessionId: string,
    element: string,
    coordinates: { x: number; y: number },
    userId?: string
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.clickCount++;
    session.lastActivity = Date.now();
    this.stats.totalClicks++;

    this.emitEvent('click', sessionId, userId, {
      element,
      coordinates,
      timestamp: Date.now(),
    });
  }

  /**
   * Track scroll event
   */
  public trackScroll(
    sessionId: string,
    scrollDepth: number,
    userId?: string
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.scrollDepth = Math.max(session.scrollDepth, scrollDepth);
    session.lastActivity = Date.now();

    this.emitEvent('scroll', sessionId, userId, {
      depth: scrollDepth,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit event to WebSocket server
   */
  private emitEvent(
    type: AnalyticsEvent['type'],
    sessionId: string,
    userId: string | undefined,
    data: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId,
      userId,
      data,
    };

    const wsServer = getAnalyticsWebSocketServer();
    wsServer.emitEvent(event);
  }

  /**
   * Get current real-time statistics
   */
  public getStats(): RealTimeStats {
    this.updateStats();
    return this.stats;
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const now = Date.now();
    let totalDuration = 0;
    let sessionCount = 0;

    const deviceBreakdown: Record<string, number> = {};
    const geoDistribution: Record<string, number> = {};
    const pageViewMap: Record<string, number> = {};

    for (const session of this.activeSessions.values()) {
      if (session.isActive) {
        sessionCount++;
        const duration = now - session.startTime;
        totalDuration += duration;

        // Track device breakdown
        const deviceType = session.deviceInfo?.type || 'unknown';
        deviceBreakdown[deviceType] = (deviceBreakdown[deviceType] || 0) + 1;

        // Track geo distribution
        const country =
          session.geoLocation?.country || 'unknown';
        geoDistribution[country] = (geoDistribution[country] || 0) + 1;
      }
    }

    this.stats.totalActiveSessions = sessionCount;
    this.stats.averageSessionDuration =
      sessionCount > 0 ? totalDuration / sessionCount : 0;
    this.stats.deviceBreakdown = deviceBreakdown;
    this.stats.geoDistribution = geoDistribution;
    this.stats.lastUpdate = now;
  }

  /**
   * Get active session
   */
  public getSession(sessionId: string): VisitorSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  public getAllSessions(): VisitorSession[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.isActive);
  }

  /**
   * End a session
   */
  public endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      const duration = Date.now() - session.startTime;

      this.emitEvent('visitor', sessionId, session.userId, {
        action: 'session_end',
        duration,
        pageCount: session.pageCount,
        clickCount: session.clickCount,
      });

      console.log(
        `[Analytics Engine] Session ended: ${sessionId} (${duration}ms)`
      );
    }
  }

  /**
   * Start session cleanup routine
   */
  private startSessionCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [sessionId, session] of this.activeSessions.entries()) {
        // Remove inactive sessions older than timeout
        if (now - session.lastActivity > this.sessionTimeout) {
          this.endSession(sessionId);
          this.activeSessions.delete(sessionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(
          `[Analytics Engine] Cleaned up ${cleanedCount} expired sessions`
        );
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Get analytics summary
   */
  public getSummary() {
    return {
      activeSessions: this.activeSessions.size,
      stats: this.getStats(),
      timestamp: Date.now(),
    };
  }

  /**
   * Cleanup and stop
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    console.log('[Analytics Engine] Stopped');
  }
}

// Singleton instance
let engine: RealtimeAnalyticsEngine | null = null;

export function getRealtimeAnalyticsEngine(): RealtimeAnalyticsEngine {
  if (!engine) {
    engine = new RealtimeAnalyticsEngine();
  }
  return engine;
}
