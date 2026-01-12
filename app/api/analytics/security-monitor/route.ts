// API Route: Security & Anomaly Detection Monitoring
// POST /api/analytics/security-monitor

import { NextRequest, NextResponse } from 'next/server';
import { getAnomalyDetector, isBotActivity, isDDoSPattern } from '@/lib/ai/AnomalyDetector';
import { AnonymizationEngine, ConsentManager } from '@/lib/privacy/PrivacyEngine';

let recentEvents: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event, ipAddress } = body;

    const detector = getAnomalyDetector();

    switch (action) {
      case 'check_anomaly':
        // Check if event is anomalous
        const anomalyScore = detector.detectAnomaly(event);

        // Check for bot activity
        const botCheck = isBotActivity(event);

        // Check for DDoS patterns
        recentEvents.push(event);
        if (recentEvents.length > 10000) {
          recentEvents = recentEvents.slice(-10000);
        }
        const ddosCheck = isDDoSPattern(recentEvents);

        return NextResponse.json({
          status: 'ok',
          anomaly: anomalyScore,
          botCheck,
          ddosCheck,
          timestamp: Date.now(),
        });

      case 'get_baseline':
        // Return traffic baseline
        const baseline = detector.getBaseline();
        return NextResponse.json({
          status: 'ok',
          baseline,
          timestamp: Date.now(),
        });

      case 'set_threshold':
        // Adjust anomaly threshold
        const threshold = body.threshold || 0.6;
        detector.setThreshold(threshold);
        return NextResponse.json({
          status: 'ok',
          threshold,
          timestamp: Date.now(),
        });

      case 'anonymize_data':
        // Anonymize data according to privacy policy
        const consentManager = new ConsentManager();
        const hasConsent = consentManager.hasAnalyticsConsent();

        if (!hasConsent) {
          return NextResponse.json(
            { error: 'No consent given for analytics' },
            { status: 403 }
          );
        }

        const anonymized = AnonymizationEngine.anonymizeAnalyticsData(event);
        return NextResponse.json({
          status: 'ok',
          data: anonymized,
          timestamp: Date.now(),
        });

      case 'check_compliance':
        // Check if tracking is compliant with GDPR/NDPR
        const consentMgr = new ConsentManager();
        const consent = consentMgr.getConsent();
        const hasAnalyticsConsent = consent?.categories?.analytics ?? false;

        return NextResponse.json({
          status: 'ok',
          compliant: hasAnalyticsConsent,
          consentStatus: consent,
          timestamp: Date.now(),
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in security monitoring:', error);
    return NextResponse.json(
      { error: 'Security monitoring failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const detector = getAnomalyDetector();
    const stats = {
      eventCount: recentEvents.length,
      baseline: detector.getBaseline(),
      timestamp: Date.now(),
    };

    return NextResponse.json({
      status: 'ok',
      stats,
    });
  } catch (error) {
    console.error('Error getting security stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
