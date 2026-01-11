/**
 * AI-powered anomaly detection for analytics
 * Identifies suspicious patterns, bots, traffic spikes, and unusual behavior
 */

interface AnomalyAlert {
  type: 'bot_activity' | 'traffic_spike' | 'unusual_pattern' | 'geo_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  data: any
  timestamp: Date
  recommendation: string
}

export class AnalyticsAnomalyDetector {
  
  /**
   * Detect bot activity based on behavior patterns
   */
  static detectBotActivity(events: any[]): AnomalyAlert | null {
    if (events.length === 0) return null

    const recentEvents = events.slice(-100) // Last 100 events
    const clicksPerMinute = recentEvents.filter(e => e.clicks > 0).reduce((sum, e) => sum + e.clicks, 0)
    
    // Bot indicators:
    // - >100 clicks per minute
    // - No scroll activity
    // - All events from same device/IP
    // - Repetitive behavior patterns

    if (clicksPerMinute > 100) {
      return {
        type: 'bot_activity',
        severity: 'critical',
        description: `Detected ${clicksPerMinute} clicks/minute - likely automated bot activity`,
        data: {
          clicksPerMinute,
          affectedDevices: new Set(recentEvents.map(e => e.deviceFingerprint)).size,
          timeframe: '5 minutes'
        },
        timestamp: new Date(),
        recommendation: 'Block IP addresses matching this pattern. Implement CAPTCHA verification. Review device fingerprints.'
      }
    }

    // Medium severity: Unusual click patterns
    const avgClicks = recentEvents.reduce((sum, e) => sum + e.clicks, 0) / recentEvents.length
    if (avgClicks > 50) {
      return {
        type: 'bot_activity',
        severity: 'high',
        description: `Average ${avgClicks.toFixed(1)} clicks per event - higher than typical user behavior`,
        data: { averageClicks: avgClicks },
        timestamp: new Date(),
        recommendation: 'Monitor this traffic source closely. Consider rate limiting.'
      }
    }

    return null
  }

  /**
   * Detect traffic spikes
   */
  static detectTrafficSpike(events: any[], baselineVisitors: number): AnomalyAlert | null {
    if (events.length === 0) return null

    const currentVisitors = new Set(events.map(e => e.sessionId)).size
    const spikeMultiplier = currentVisitors / (baselineVisitors || 1)

    // Alert on traffic spike > 300%
    if (spikeMultiplier > 3) {
      return {
        type: 'traffic_spike',
        severity: spikeMultiplier > 5 ? 'critical' : 'high',
        description: `Traffic spike detected: ${currentVisitors} visitors (${(spikeMultiplier * 100).toFixed(0)}% above baseline)`,
        data: {
          currentVisitors,
          baselineVisitors,
          spikeMultiplier: spikeMultiplier.toFixed(2)
        },
        timestamp: new Date(),
        recommendation: spikeMultiplier > 5 
          ? 'Consider scaling infrastructure. Monitor server performance.'
          : 'This may be legitimate traffic surge. Monitor CPU/memory usage.'
      }
    }

    return null
  }

  /**
   * Detect unusual geographic patterns
   */
  static detectGeoAnomaly(events: any[]): AnomalyAlert | null {
    if (events.length < 10) return null

    const geoMap: Record<string, number> = {}
    events.forEach(e => {
      if (e.country) {
        geoMap[e.country] = (geoMap[e.country] || 0) + 1
      }
    })

    const countries = Object.keys(geoMap)
    const totalEvents = events.length

    // Check for suspicious geographic concentration
    // If 80%+ traffic from single country outside Nigeria, flag it
    const maxCountryTraffic = Math.max(...Object.values(geoMap))
    const maxPercentage = (maxCountryTraffic / totalEvents) * 100

    if (maxPercentage > 80 && events[0].country !== 'Nigeria') {
      return {
        type: 'geo_anomaly',
        severity: 'medium',
        description: `${maxPercentage.toFixed(0)}% of traffic from ${Object.entries(geoMap).sort((a, b) => b[1] - a[1])[0][0]} - unusual pattern for Nigerian platform`,
        data: {
          topCountry: Object.entries(geoMap).sort((a, b) => b[1] - a[1])[0][0],
          percentage: maxPercentage.toFixed(1),
          countries: countries.length
        },
        timestamp: new Date(),
        recommendation: 'Verify this traffic source. May indicate VPN/proxy usage or genuine regional interest.'
      }
    }

    return null
  }

  /**
   * Detect unusual user patterns
   */
  static detectUnusualPattern(events: any[]): AnomalyAlert | null {
    if (events.length < 5) return null

    // Pattern 1: Constant high engagement from single device
    const deviceMap: Record<string, number> = {}
    const engagementMap: Record<string, number> = {}

    events.forEach(e => {
      const device = e.deviceFingerprint
      deviceMap[device] = (deviceMap[device] || 0) + 1
      engagementMap[device] = (engagementMap[device] || 0) + (e.engagementScore || 0)
    })

    // Find devices with perfect engagement scores (suspicious)
    for (const [device, count] of Object.entries(deviceMap)) {
      if (count > 5) {
        const avgEngagement = engagementMap[device] / count
        if (avgEngagement > 95) {
          return {
            type: 'unusual_pattern',
            severity: 'high',
            description: `Single device showing consistently high engagement (${avgEngagement.toFixed(0)}/100) across ${count} sessions`,
            data: {
              device: device.substring(0, 10) + '...',
              sessions: count,
              avgEngagement: avgEngagement.toFixed(1)
            },
            timestamp: new Date(),
            recommendation: 'This may indicate automated testing or a dedicated user. Review device fingerprint.'
          }
        }
      }
    }

    return null
  }

  /**
   * Analyze event patterns and return all detected anomalies
   */
  static analyzeEvents(events: any[], baselineVisitors: number = 100): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = []

    const botAlert = this.detectBotActivity(events)
    if (botAlert) alerts.push(botAlert)

    const spikeAlert = this.detectTrafficSpike(events, baselineVisitors)
    if (spikeAlert) alerts.push(spikeAlert)

    const geoAlert = this.detectGeoAnomaly(events)
    if (geoAlert) alerts.push(geoAlert)

    const patternAlert = this.detectUnusualPattern(events)
    if (patternAlert) alerts.push(patternAlert)

    return alerts
  }

  /**
   * Get AI recommendations for improving traffic quality
   */
  static getRecommendations(analytics: any): string[] {
    const recommendations: string[] = []

    if ((analytics.bounceRate || 0) > 50) {
      recommendations.push('⚠️ High bounce rate. Consider improving page load speed or content relevance.')
    }

    if ((analytics.averageEngagementScore || 0) < 40) {
      recommendations.push('📉 Low engagement. Add interactive elements, improve UX/UI, or optimize content.')
    }

    if ((analytics.botDetected || 0) > 0) {
      recommendations.push('🤖 Bot activity detected. Implement CAPTCHA, rate limiting, and IP blocking.')
    }

    const returningRatio = (analytics.returningUsers || 0) / (analytics.totalSessions || 1)
    if (returningRatio < 0.2) {
      recommendations.push('👥 Low returning user rate. Implement push notifications, email campaigns, or loyalty programs.')
    }

    const deviceDiversity = analytics.uniqueDevices / (analytics.totalSessions || 1)
    if (deviceDiversity < 0.3) {
      recommendations.push('📱 Low device diversity. Target mobile users with responsive design and mobile-first content.')
    }

    return recommendations
  }

  /**
   * Predict traffic trends
   */
  static predictTrends(events: any[], hoursBack: number = 24): { trend: 'increasing' | 'decreasing' | 'stable', prediction: string } {
    if (events.length < 2) {
      return { trend: 'stable', prediction: 'Insufficient data to predict trends.' }
    }

    // Split events into early and recent
    const midpoint = Math.floor(events.length / 2)
    const earlyEvents = events.slice(0, midpoint)
    const recentEvents = events.slice(midpoint)

    const earlyVisitors = new Set(earlyEvents.map(e => e.sessionId)).size
    const recentVisitors = new Set(recentEvents.map(e => e.sessionId)).size

    const growth = (recentVisitors - earlyVisitors) / (earlyVisitors || 1)

    if (growth > 0.2) {
      return {
        trend: 'increasing',
        prediction: `📈 Traffic is growing ${(growth * 100).toFixed(0)}% faster. Expected to reach ${Math.ceil(recentVisitors * 1.5)} visitors in next period.`
      }
    } else if (growth < -0.2) {
      return {
        trend: 'decreasing',
        prediction: `📉 Traffic declining ${Math.abs(growth * 100).toFixed(0)}%. Consider re-engagement campaigns.`
      }
    } else {
      return {
        trend: 'stable',
        prediction: `📊 Traffic is stable. Visitors: ${recentVisitors} (${growth > 0 ? '+' : ''}${(growth * 100).toFixed(1)}%)`
      }
    }
  }
}
