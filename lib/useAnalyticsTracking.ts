import { useEffect, useRef, useState } from 'react'
import { generateDeviceFingerprint, getDeviceInfo } from './deviceFingerprint'

interface AnalyticsSession {
  sessionId: string
  userId: string
  startTime: number
  pageViewCount: number
  clickCount: number
  scrollDepth: number
  lastActivityTime: number
}

/**
 * Hook to track user analytics and behavior
 * Automatically sends data to backend
 */
export function useAnalyticsTracking(userId: string | null) {
  const sessionRef = useRef<AnalyticsSession | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const clickCountRef = useRef(0)
  const maxScrollRef = useRef(0)

  // Initialize session on mount
  useEffect(() => {
    if (!userId) return

    const initializeSession = async () => {
      // Generate session ID
      const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Get device info
      const fingerprint = await generateDeviceFingerprint()
      const deviceInfo = getDeviceInfo()

      sessionRef.current = {
        sessionId,
        userId,
        startTime: Date.now(),
        pageViewCount: 1,
        clickCount: 0,
        scrollDepth: 0,
        lastActivityTime: Date.now()
      }

      // Get geolocation
      try {
        const geoResponse = await fetch('/api/analytics/geolocation')
        const geoData = await geoResponse.json()

        // Send initial tracking event
        await trackEvent({
          sessionId,
          userId,
          deviceFingerprint: fingerprint.fingerprint,
          ...deviceInfo,
          pageUrl: window.location.href,
          pageTitle: document.title,
          referrer: document.referrer,
          timeSpent: 0,
          scrollDepth: 0,
          clicks: 0,
          consentGiven: localStorage.getItem('analyticsConsent') === 'true',
          geolocation: geoData
        })
      } catch (error) {
        console.log('Geolocation unavailable:', error)
      }

      setIsTracking(true)
    }

    initializeSession()
  }, [userId])

  // Track clicks
  useEffect(() => {
    if (!isTracking) return

    const handleClick = () => {
      if (sessionRef.current) {
        clickCountRef.current++
        sessionRef.current.clickCount = clickCountRef.current
        sessionRef.current.lastActivityTime = Date.now()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isTracking])

  // Track scroll depth
  useEffect(() => {
    if (!isTracking) return

    const handleScroll = () => {
      if (sessionRef.current) {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrollPercentage > maxScrollRef.current) {
          maxScrollRef.current = Math.round(scrollPercentage)
          sessionRef.current.scrollDepth = maxScrollRef.current
        }
        sessionRef.current.lastActivityTime = Date.now()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isTracking])

  // Send analytics periodically
  useEffect(() => {
    if (!isTracking || !sessionRef.current) return

    const interval = setInterval(async () => {
      const session = sessionRef.current
      if (!session) return

      const timeSpent = Date.now() - session.startTime

      try {
        await trackEvent({
          sessionId: session.sessionId,
          userId: session.userId,
          pageUrl: window.location.href,
          pageTitle: document.title,
          timeSpent,
          scrollDepth: maxScrollRef.current,
          clicks: clickCountRef.current,
          consentGiven: localStorage.getItem('analyticsConsent') === 'true'
        })
      } catch (error) {
        console.log('Analytics tracking error:', error)
      }
    }, 30000) // Send every 30 seconds

    return () => clearInterval(interval)
  }, [isTracking])

  // Send final analytics on unload
  useEffect(() => {
    if (!isTracking) return

    const handleBeforeUnload = async () => {
      if (sessionRef.current) {
        const timeSpent = Date.now() - sessionRef.current.startTime

        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionRef.current.sessionId,
              userId: sessionRef.current.userId,
              timeSpent,
              scrollDepth: maxScrollRef.current,
              clicks: clickCountRef.current,
              sessionEnded: true,
              consentGiven: localStorage.getItem('analyticsConsent') === 'true'
            })
          })
        } catch (error) {
          console.log('Final analytics send failed:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isTracking])

  return {
    isTracking,
    sessionId: sessionRef.current?.sessionId,
    clickCount: clickCountRef.current,
    scrollDepth: maxScrollRef.current
  }
}

/**
 * Send analytics event to backend
 */
async function trackEvent(data: any) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.log('Failed to send analytics:', error)
  }
}
