'use client'

import { useEffect, useRef } from 'react'

export function AnalyticsTracker() {
  const sessionIdRef = useRef<string>('')
  const eventQueueRef = useRef<any[]>([])
  
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Check for analytics consent
        const consent = localStorage.getItem('analyticsConsent')
        if (consent === 'false') {
          console.log('Analytics tracking disabled by user')
          return
        }

        // Generate or get session ID
        const existingSessionId = sessionStorage.getItem('analyticsSessionId')
        const sessionId = existingSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        if (!existingSessionId) {
          sessionStorage.setItem('analyticsSessionId', sessionId)
        }
        sessionIdRef.current = sessionId

        // Get user ID if available
        const userId = localStorage.getItem('naijaAmeboCurrentUser') 
          ? JSON.parse(localStorage.getItem('naijaAmeboCurrentUser') || '{}').id 
          : localStorage.getItem('userId') 
          || `anonymous_${Date.now()}`

        // Generate device fingerprint
        let deviceFingerprint = ''
        try {
          const { getDeviceFingerprintBrowser } = await import('@/lib/device/DeviceFingerprint')
          const fp = await getDeviceFingerprintBrowser()
          deviceFingerprint = fp.fingerprint || 'unknown'
        } catch (e) {
          console.warn('Could not generate device fingerprint:', e)
          deviceFingerprint = `device_${Date.now()}`
        }

        // Get network info
        let networkInfo: any = {}
        try {
          const { getNetworkInfoBrowser } = await import('@/lib/network/NetworkDetector')
          networkInfo = await getNetworkInfoBrowser()
        } catch (e) {
          console.warn('Could not detect network:', e)
        }

        // Function to track events
        const trackEvent = async (eventType: string, eventData: any = {}) => {
          try {
            const payload = {
              sessionId,
              userId,
              deviceFingerprint,
              eventType,
              eventData,
              pageUrl: window.location.href,
              pageTitle: document.title,
              userAgent: navigator.userAgent,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              timestamp: new Date().toISOString(),
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight,
              networkInfo,
              consentGiven: consent !== 'false'
            }

            // Queue event
            eventQueueRef.current.push(payload)

            // Send immediately for important events, batch others
            if (['page_view', 'session_start', 'session_end'].includes(eventType)) {
              await flushEvents()
            }
          } catch (error) {
            console.error('Error tracking event:', error)
          }
        }

        // Function to flush queued events
        const flushEvents = async () => {
          if (eventQueueRef.current.length === 0) return

          const events = [...eventQueueRef.current]
          eventQueueRef.current = []

          try {
            const response = await fetch('/api/analytics/realtime-init', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'track_visitor',
                events,
                sessionId,
                userId,
                deviceFingerprint,
                timestamp: new Date().toISOString()
              })
            })

            if (!response.ok) {
              console.error('Analytics tracking failed:', response.statusText)
              // Re-queue failed events
              eventQueueRef.current.unshift(...events)
            } else {
              console.log('✅ Analytics event sent successfully')
            }
          } catch (error) {
            console.error('Failed to send analytics:', error)
            // Re-queue failed events
            eventQueueRef.current.unshift(...events)
          }
        }

        // Track initial page view
        await trackEvent('page_view', {
          referrer: document.referrer || 'direct',
          previousUrl: sessionStorage.getItem('previousUrl') || null
        })

        // Store current URL for next page view
        sessionStorage.setItem('previousUrl', window.location.href)

        // Setup periodic event flushing (every 10 seconds)
        const flushInterval = setInterval(() => {
          flushEvents()
        }, 10000)

        // Track clicks
        const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement
          trackEvent('click', {
            elementTag: target.tagName,
            elementId: target.id || null,
            elementClass: target.className || null,
            x: e.clientX,
            y: e.clientY
          })
        }

        // Track scroll
        let lastScrollTime = 0
        const handleScroll = () => {
          const now = Date.now()
          if (now - lastScrollTime > 1000) { // Throttle to every second
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            trackEvent('scroll', {
              scrollPercent: Math.round(scrollPercent),
              scrollY: window.scrollY
            })
            lastScrollTime = now
          }
        }

        // Track clicks
        document.addEventListener('click', (e: MouseEvent) => {
          handleClick(e)
        })

        // Track scroll
        window.addEventListener('scroll', () => {
          handleScroll()
        })

        // Track when user becomes inactive
        let inactivityTimer: NodeJS.Timeout
        const resetInactivityTimer = () => {
          clearTimeout(inactivityTimer)
          inactivityTimer = setTimeout(() => {
            trackEvent('user_inactive', {
              lastActivity: new Date().toISOString()
            })
          }, 5 * 60 * 1000) // 5 minutes
        }

        document.addEventListener('mousemove', resetInactivityTimer)
        document.addEventListener('keypress', resetInactivityTimer)
        document.addEventListener('click', resetInactivityTimer)

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
          trackEvent(document.hidden ? 'page_hidden' : 'page_visible')
        })

        // Cleanup on unmount
        return () => {
          clearInterval(flushInterval)
          clearTimeout(inactivityTimer)
          flushEvents()
          document.removeEventListener('click', handleClick)
          window.removeEventListener('scroll', handleScroll)
          document.removeEventListener('mousemove', resetInactivityTimer)
          document.removeEventListener('keypress', resetInactivityTimer)
          document.removeEventListener('click', resetInactivityTimer)
        }
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
      }
    }

    initializeTracking()
  }, [])

  return null
}
