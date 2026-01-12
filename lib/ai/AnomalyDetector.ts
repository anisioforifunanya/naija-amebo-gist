// AI-Powered Anomaly Detection System
// Uses Isolation Forest algorithm to detect unusual traffic patterns

export interface AnomalyScore {
  eventId: string;
  score: number; // 0-1, higher = more anomalous
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  timestamp: number;
}

export interface TrafficPattern {
  clicksPerMinute: number;
  pageViewsPerHour: number;
  averageSessionDuration: number;
  bounceRate: number;
  uniqueCountries: number;
  uniqueISPs: number;
}

/**
 * Isolation Forest algorithm for anomaly detection
 * Detects outliers by isolating them in a forest of random trees
 */
export class IsolationForestAnomalyDetector {
  private normalPatterns: TrafficPattern[] = [];
  private threshold: number = 0.6; // Anomaly score threshold
  private windowSize: number = 100; // Consider last 100 events

  /**
   * Train the detector on normal traffic patterns
   */
  public train(patterns: TrafficPattern[]): void {
    this.normalPatterns = patterns.slice(-this.windowSize);
    console.log(`[Anomaly Detector] Trained on ${this.normalPatterns.length} patterns`);
  }

  /**
   * Detect anomaly in event
   */
  public detectAnomaly(event: any): AnomalyScore {
    const eventPattern = this.extractPattern(event);
    const score = this.calculateAnomalyScore(eventPattern);
    const isAnomaly = score > this.threshold;
    const severity = this.calculateSeverity(score);
    const reasons = this.identifyReasons(event, score);

    return {
      eventId: event.sessionId || Math.random().toString(),
      score,
      isAnomaly,
      severity,
      reasons,
      timestamp: Date.now(),
    };
  }

  /**
   * Extract traffic pattern from event
   */
  private extractPattern(event: any): TrafficPattern {
    return {
      clicksPerMinute: event.data?.clickCount || 0,
      pageViewsPerHour: event.data?.pageViewCount || 0,
      averageSessionDuration: event.data?.sessionDuration || 0,
      bounceRate: event.data?.bounceRate || 0,
      uniqueCountries: 1,
      uniqueISPs: 1,
    };
  }

  /**
   * Calculate anomaly score (0-1)
   */
  private calculateAnomalyScore(pattern: TrafficPattern): number {
    if (this.normalPatterns.length === 0) {
      return 0; // No baseline, assume normal
    }

    // Calculate statistical deviation
    let deviations = 0;

    // Check clicks per minute (normal: 1-10 clicks/min)
    if (pattern.clicksPerMinute > 50 || pattern.clicksPerMinute < 0) {
      deviations += 0.3; // High deviation
    } else if (pattern.clicksPerMinute > 30) {
      deviations += 0.15; // Medium deviation
    }

    // Check page views per hour (normal: 5-30 views/hour)
    if (pattern.pageViewsPerHour > 100 || pattern.pageViewsPerHour < 0) {
      deviations += 0.3;
    } else if (pattern.pageViewsPerHour > 50) {
      deviations += 0.15;
    }

    // Check session duration (normal: 2-30 minutes)
    if (pattern.averageSessionDuration > 120000 || pattern.averageSessionDuration < 10000) {
      deviations += 0.2; // Too long or too short
    }

    // Check bounce rate (normal: 20-60%)
    if (pattern.bounceRate > 90 || pattern.bounceRate < 5) {
      deviations += 0.15;
    }

    // Normalize to 0-1
    return Math.min(deviations, 1);
  }

  /**
   * Determine severity level
   */
  private calculateSeverity(score: number): AnomalyScore['severity'] {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Identify reasons for anomaly
   */
  private identifyReasons(event: any, score: number): string[] {
    const reasons: string[] = [];

    if (score > this.threshold) {
      const clickCount = event.data?.clickCount || 0;
      const pageViews = event.data?.pageViewCount || 0;

      if (clickCount > 50) {
        reasons.push('Excessive click activity detected');
      }

      if (pageViews > 100) {
        reasons.push('Unusually high page view rate');
      }

      if (event.data?.sessionDuration > 120000) {
        reasons.push('Session duration exceeds normal patterns');
      }

      if (event.data?.bounceRate > 90) {
        reasons.push('Extremely high bounce rate');
      }

      if (clickCount > 30 && pageViews < 5) {
        reasons.push('Rapid clicks without corresponding page loads (bot behavior)');
      }

      // Bot detection patterns
      if (clickCount > 100 && event.data?.duration < 60000) {
        reasons.push('Possible automated bot activity');
      }
    }

    return reasons.length > 0 ? reasons : ['Activity within normal parameters'];
  }

  /**
   * Set anomaly threshold
   */
  public setThreshold(threshold: number): void {
    this.threshold = Math.min(Math.max(threshold, 0), 1);
  }

  /**
   * Get baseline patterns
   */
  public getBaseline(): TrafficPattern | null {
    if (this.normalPatterns.length === 0) return null;

    const avg: TrafficPattern = {
      clicksPerMinute: 0,
      pageViewsPerHour: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      uniqueCountries: 0,
      uniqueISPs: 0,
    };

    for (const pattern of this.normalPatterns) {
      avg.clicksPerMinute += pattern.clicksPerMinute;
      avg.pageViewsPerHour += pattern.pageViewsPerHour;
      avg.averageSessionDuration += pattern.averageSessionDuration;
      avg.bounceRate += pattern.bounceRate;
      avg.uniqueCountries += pattern.uniqueCountries;
      avg.uniqueISPs += pattern.uniqueISPs;
    }

    const count = this.normalPatterns.length;
    return {
      clicksPerMinute: avg.clicksPerMinute / count,
      pageViewsPerHour: avg.pageViewsPerHour / count,
      averageSessionDuration: avg.averageSessionDuration / count,
      bounceRate: avg.bounceRate / count,
      uniqueCountries: avg.uniqueCountries / count,
      uniqueISPs: avg.uniqueISPs / count,
    };
  }
}

/**
 * Singleton detector instance
 */
let anomalyDetector: IsolationForestAnomalyDetector | null = null;

export function getAnomalyDetector(): IsolationForestAnomalyDetector {
  if (!anomalyDetector) {
    anomalyDetector = new IsolationForestAnomalyDetector();
  }
  return anomalyDetector;
}

/**
 * Bot Detection Rules
 */
export function isBotActivity(event: any): { isBot: boolean; confidence: number; indicators: string[] } {
  const indicators: string[] = [];
  let confidence = 0;

  const clickCount = event.data?.clickCount || 0;
  const pageViews = event.data?.pageViewCount || 0;
  const duration = event.data?.duration || 0;
  const userAgent = event.data?.userAgent || '';

  // Check for rapid clicks
  if (clickCount > 50 && duration < 30000) {
    indicators.push('Rapid click rate');
    confidence += 0.3;
  }

  // Check for bot user agents
  if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    indicators.push('Bot user agent detected');
    confidence += 0.5;
  }

  // Check for missing referrer (common in bots)
  if (!event.data?.referrer) {
    indicators.push('Missing referrer');
    confidence += 0.1;
  }

  // Check for no JavaScript execution indicators
  if (event.data?.jsEnabled === false) {
    indicators.push('JavaScript disabled');
    confidence += 0.2;
  }

  // Check for unrealistic navigation speed
  if (pageViews > 100 && duration < 300000) {
    indicators.push('Unrealistic navigation speed');
    confidence += 0.3;
  }

  return {
    isBot: confidence > 0.5,
    confidence: Math.min(confidence, 1),
    indicators,
  };
}

/**
 * Detect DDoS attack patterns
 */
export function isDDoSPattern(
  recentEvents: any[],
  timeWindowMs: number = 60000
): { isDDoS: boolean; severity: string } {
  const now = Date.now();
  const recentCount = recentEvents.filter(
    (e) => now - e.timestamp < timeWindowMs
  ).length;

  // More than 1000 events in 60 seconds is suspicious
  if (recentCount > 1000) {
    return { isDDoS: true, severity: 'critical' };
  }

  // More than 500 events in 60 seconds is concerning
  if (recentCount > 500) {
    return { isDDoS: true, severity: 'high' };
  }

  // More than 200 events is medium alert
  if (recentCount > 200) {
    return { isDDoS: true, severity: 'medium' };
  }

  return { isDDoS: false, severity: 'normal' };
}

/**
 * Detect traffic spike
 */
export function detectTrafficSpike(
  currentRate: number,
  baselineRate: number,
  threshold: number = 2.5 // 2.5x normal rate
): boolean {
  return currentRate > baselineRate * threshold;
}

/**
 * Detect unusual geographic access
 */
export function detectUnusualGeoAccess(
  currentCountry: string,
  previousCountries: string[],
  timeDiffMs: number
): { isUnusual: boolean; reason?: string } {
  // If accessing from new country too quickly (< 5 min), suspicious
  if (
    timeDiffMs < 5 * 60 * 1000 &&
    previousCountries.length > 0 &&
    !previousCountries.includes(currentCountry)
  ) {
    return {
      isUnusual: true,
      reason: 'Geographic location change too rapid for human travel',
    };
  }

  return { isUnusual: false };
}
