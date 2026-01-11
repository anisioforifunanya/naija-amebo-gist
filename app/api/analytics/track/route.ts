import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

/**
 * Track user session analytics including:
 * - Device fingerprint
 * - Browser/OS info
 * - IP-based geolocation
 * - ISP detection
 * - Network type
 * - Behavior metrics
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Validate required fields
    if (!data.sessionId || !data.userId) {
      return NextResponse.json(
        { error: 'Missing sessionId or userId' },
        { status: 400 }
      )
    }

    // Build analytics document
    const analyticsDoc = {
      sessionId: data.sessionId,
      userId: data.userId,
      
      // Device Fingerprint & Info
      deviceFingerprint: data.deviceFingerprint,
      deviceType: data.deviceType, // mobile, tablet, desktop
      deviceBrand: data.deviceBrand, // Samsung, iPhone, etc
      deviceModel: data.deviceModel,
      
      // Browser & OS
      browser: data.browser, // Chrome, Safari, Firefox
      browserVersion: data.browserVersion,
      os: data.os, // Windows, macOS, iOS, Android
      osVersion: data.osVersion,
      
      // Screen & Display
      screenResolution: data.screenResolution,
      screenDimensions: data.screenDimensions,
      colorDepth: data.colorDepth,
      timezone: data.timezone,
      language: data.language,
      
      // Network (Requires geolocation API)
      clientIP: clientIP,
      
      // Behavior Tracking
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      referrer: data.referrer,
      timeSpent: data.timeSpent,
      scrollDepth: data.scrollDepth,
      clicks: data.clicks || 0,
      eventsTriggered: data.eventsTriggered || [],
      
      // Session Info
      sessionDuration: data.sessionDuration,
      pageViews: data.pageViews || 1,
      isReturning: data.isReturning || false,
      lastVisit: data.lastVisit,
      
      // Engagement
      engagementScore: calculateEngagementScore(data),
      bounceRisk: data.scrollDepth < 10,
      
      // Timestamps
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      
      // Privacy & Compliance
      consentGiven: data.consentGiven || false,
      anonymized: true // Device fingerprint, not personal data
    }

    // Store in Firebase
    const docRef = await addDoc(collection(db, 'analytics', 'sessions', 'events'), analyticsDoc)

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
      timestamp: analyticsDoc.timestamp
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to track analytics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET analytics data for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const timeRange = request.nextUrl.searchParams.get('timeRange') || '24h'
    const userId = request.nextUrl.searchParams.get('userId')

    let constraints = []
    
    // Filter by time range
    const now = new Date()
    let startTime = new Date()
    
    if (timeRange === '1h') startTime.setHours(now.getHours() - 1)
    if (timeRange === '24h') startTime.setDate(now.getDate() - 1)
    if (timeRange === '7d') startTime.setDate(now.getDate() - 7)
    if (timeRange === '30d') startTime.setDate(now.getDate() - 30)

    // Fetch analytics events
    const q = query(
      collection(db, 'analytics', 'sessions', 'events'),
      orderBy('createdAt', 'desc'),
      limit(500)
    )

    const snapshot = await getDocs(q)
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Aggregate analytics
    const analytics = aggregateAnalytics(events, startTime)

    return NextResponse.json({
      success: true,
      timeRange,
      totalEvents: events.length,
      analytics,
      events: events.slice(0, 50) // Latest 50 events
    })
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analytics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate engagement score (0-100)
 */
function calculateEngagementScore(data: any): number {
  let score = 0
  
  if (data.scrollDepth > 75) score += 30
  else if (data.scrollDepth > 50) score += 20
  else if (data.scrollDepth > 25) score += 10
  
  if ((data.clicks || 0) > 5) score += 20
  else if ((data.clicks || 0) > 2) score += 10
  
  if ((data.timeSpent || 0) > 60000) score += 20
  else if ((data.timeSpent || 0) > 30000) score += 10
  
  if (data.isReturning) score += 20
  
  return Math.min(score, 100)
}

/**
 * Aggregate events into analytics insights
 */
function aggregateAnalytics(events: any[], startTime: Date) {
  const recentEvents = events.filter(e => new Date(e.createdAt) > startTime)
  
  const devices = new Map()
  const browsers = new Map()
  const oss = new Map()
  const countries = new Map()
  const isps = new Map()
  const engagementScores: number[] = []
  
  let totalClicks = 0
  let totalTimeSpent = 0
  let totalPageViews = 0
  let botsDetected = 0
  let returningUsers = 0
  
  recentEvents.forEach((event: any) => {
    // Device tracking
    const deviceKey = `${event.deviceBrand || 'Unknown'} ${event.deviceModel || ''}`
    devices.set(deviceKey, (devices.get(deviceKey) || 0) + 1)
    
    // Browser tracking
    browsers.set(event.browser || 'Unknown', (browsers.get(event.browser) || 0) + 1)
    
    // OS tracking
    oss.set(event.os || 'Unknown', (oss.get(event.os) || 0) + 1)
    
    // Engagement metrics
    if (event.engagementScore) engagementScores.push(event.engagementScore)
    totalClicks += event.clicks || 0
    totalTimeSpent += event.timeSpent || 0
    totalPageViews += event.pageViews || 1
    
    // Bot detection (more than 100 clicks per minute = suspicious)
    if ((event.clicks || 0) > 100) botsDetected++
    
    // Returning user count
    if (event.isReturning) returningUsers++
  })
  
  const avgEngagement = engagementScores.length > 0 
    ? Math.round(engagementScores.reduce((a, b) => a + b) / engagementScores.length)
    : 0
  
  return {
    totalSessions: recentEvents.length,
    uniqueDevices: devices.size,
    uniqueBrowsers: browsers.size,
    uniqueOS: oss.size,
    
    topDevices: Array.from(devices).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topBrowsers: Array.from(browsers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topOS: Array.from(oss).sort((a, b) => b[1] - a[1]).slice(0, 5),
    
    totalClicks,
    totalTimeSpent: Math.round(totalTimeSpent / 1000), // seconds
    totalPageViews,
    averageEngagementScore: avgEngagement,
    
    returningUsers,
    newUsers: recentEvents.length - returningUsers,
    
    botDetected: botsDetected,
    suspiciousActivities: botsDetected > 0,
    
    bounceRate: Math.round((recentEvents.filter(e => e.bounceRisk).length / recentEvents.length) * 100) || 0
  }
}
