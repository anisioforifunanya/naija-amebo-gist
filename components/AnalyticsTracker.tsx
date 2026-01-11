'use client'

import { useEffect } from 'react'

export function AnalyticsTracker() {
  useEffect(() => {
    // Import the hook dynamically to initialize tracking
    const initializeTracking = async () => {
      try {
        // Check for analytics consent
        const consent = localStorage.getItem('analyticsConsent')
        if (consent === 'false') {
          console.log('Analytics tracking disabled by user')
          return
        }

        // Initialize tracking
        const { useAnalyticsTracking } = await import('@/lib/useAnalyticsTracking')
        
        // Get user ID if available
        const userId = localStorage.getItem('userId') || undefined
        
        // Note: We can't use hooks directly here, so we'll track manually
        const trackEvent = async (data: any) => {
          try {
            await fetch('/api/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
          } catch (error) {
            console.error('Failed to track event:', error)
          }
        }

        // Track page view
        const { generateDeviceFingerprint } = await import('@/lib/deviceFingerprint')
        const fingerprint = await generateDeviceFingerprint()

        trackEvent({
          userId: userId,
          sessionId: `${userId}-${Date.now()}`,
          deviceFingerprint: fingerprint.fingerprint,
          pageUrl: window.location.href,
          pageTitle: document.title,
          timestamp: new Date().toISOString(),
          consentGiven: consent !== 'false'
        })

        // Setup periodic tracking
        let clickCount = 0
        let maxScrollDepth = 0
        let lastActivity = Date.now()

        // Click tracking
        document.addEventListener('click', () => {
          clickCount++
          lastActivity = Date.now()
        })

        // Scroll tracking
        window.addEventListener('scroll', () => {
          const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          maxScrollDepth = Math.max(maxScrollDepth, scrollDepth)
          lastActivity = Date.now()
        })

        // Send analytics every 30 seconds
        setInterval(async () => {
          if (clickCount > 0 || maxScrollDepth > 0) {
            const geolocation = await fetch('/api/analytics/geolocation').then(r => r.json()).catch(() => ({}))
            
            trackEvent({
              userId: userId,
              sessionId: `${userId}-${Date.now()}`,
              deviceFingerprint: fingerprint.fingerprint,
              pageUrl: window.location.href,
              pageTitle: document.title,
              clicks: clickCount,
              scrollDepth: maxScrollDepth,
              timeSpent: Date.now() - lastActivity,
              country: geolocation.country,
              city: geolocation.city,
              latitude: geolocation.latitude,
              longitude: geolocation.longitude,
              isp: geolocation.isp,
              timestamp: new Date().toISOString(),
              consentGiven: consent !== 'false'
            })

            // Reset counters
            clickCount = 0
            maxScrollDepth = 0
          }
        }, 30000)

        // Track on page unload
        window.addEventListener('beforeunload', async () => {
          const geolocation = await fetch('/api/analytics/geolocation').then(r => r.json()).catch(() => ({}))
          
          await trackEvent({
            userId: userId,
            sessionId: `${userId}-${Date.now()}`,
            deviceFingerprint: fingerprint.fingerprint,
            pageUrl: window.location.href,
            pageTitle: document.title,
            clicks: clickCount,
            scrollDepth: maxScrollDepth,
            timeSpent: Date.now() - lastActivity,
            country: geolocation.country,
            city: geolocation.city,
            latitude: geolocation.latitude,
            longitude: geolocation.longitude,
            isp: geolocation.isp,
            timestamp: new Date().toISOString(),
            consentGiven: consent !== 'false',
            isSessionEnd: true
          })
        })
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
      }
    }

    initializeTracking()
  }, [])

  return null
}
