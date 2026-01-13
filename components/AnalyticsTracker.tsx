'use client'

import { useEffect, useRef } from 'react'
import { auth } from '@/lib/firebase'
import { getUserPreferences, getUserSession } from '@/lib/firebase-persistence'

export function AnalyticsTracker() {
  const sessionIdRef = useRef<string>('')
  const eventQueueRef = useRef<any[]>([])
  
  useEffect(() => {
    // Wrap entire initialization in try-catch to prevent breaking the site
    try {
      const initializeTracking = async () => {
        try {
          // Check for analytics consent from Firebase
          let consentGiven = true
          const user = auth.currentUser
          
          if (user) {
            const prefs = await getUserPreferences(user.uid)
            if (prefs?.analyticsConsent === false) {
              console.log('[Analytics] Tracking disabled by user')
              return
            }
          }

          // Generate or get session ID
          const existingSessionId = sessionStorage.getItem('analyticsSessionId')
          const sessionId = existingSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          if (!existingSessionId) {
            sessionStorage.setItem('analyticsSessionId', sessionId)
          }
          sessionIdRef.current = sessionId
          console.log('[Analytics] Session ID:', sessionId)

          // Get user ID from Firebase Auth or Firebase session
          let userId = 'anonymous'
          try {
            if (user) {
              const session = await getUserSession(user.uid)
              userId = session?.userId || user.uid || 'user_from_auth'
            } else {
              userId = `anon_${Date.now()}`
            }
          } catch {
            userId = `anon_${Date.now()}`
          }

          // Generate device fingerprint - with fallback
          let deviceFingerprint = `device_${Date.now()}`
          try {
            const { getDeviceFingerprintBrowser } = await import('@/lib/device/DeviceFingerprint')
            if (typeof getDeviceFingerprintBrowser === 'function') {
              const fp = await getDeviceFingerprintBrowser()
              if (fp && fp.fingerprint) {
                deviceFingerprint = fp.fingerprint
              }
            }
          } catch (e) {
            console.warn('[Analytics] Device fingerprint failed, using fallback:', e)
          }

          // Get network info - optional, don't break if it fails
          let networkInfo: any = {}
          try {
            const { getNetworkInfoBrowser } = await import('@/lib/network/NetworkDetector')
            if (typeof getNetworkInfoBrowser === 'function') {
              networkInfo = await getNetworkInfoBrowser()
            }
          } catch (e) {
            console.warn('[Analytics] Network detection failed:', e)
          }

          console.log('[Analytics] Initialized:', { userId, deviceFingerprint })

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
                consentGiven: consentGiven
              }

              // Queue event
              eventQueueRef.current.push(payload)

              // Send immediately for important events
              if (['page_view', 'session_start', 'session_end'].includes(eventType)) {
                await flushEvents()
              }
            } catch (error) {
              console.error('[Analytics] Error tracking event:', error)
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
                console.warn('[Analytics] Failed to send events:', response.statusText)
                // Re-queue failed events
                eventQueueRef.current.unshift(...events)
              } else {
                console.log('[Analytics] ✅ Sent', events.length, 'events')
              }
            } catch (error) {
              console.error('[Analytics] Network error sending events:', error)
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
            flushEvents().catch(err => console.error('[Analytics] Flush error:', err))
          }, 10000)

          // Track clicks
          const handleClick = (e: MouseEvent) => {
            try {
              const target = e.target as HTMLElement
              trackEvent('click', {
                elementTag: target.tagName,
                elementId: target.id || null,
                elementClass: target.className || null,
                x: e.clientX,
                y: e.clientY
              }).catch(() => {})
            } catch (e) {
              // Silently fail - don't break the page
            }
          }

          // Track scroll
          let lastScrollTime = 0
          const handleScroll = () => {
            try {
              const now = Date.now()
              if (now - lastScrollTime > 1000) {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                trackEvent('scroll', {
                  scrollPercent: Math.round(scrollPercent),
                  scrollY: window.scrollY
                }).catch(() => {})
                lastScrollTime = now
              }
            } catch (e) {
              // Silently fail
            }
          }

          // Add event listeners
          document.addEventListener('click', handleClick, { passive: true })
          window.addEventListener('scroll', handleScroll, { passive: true })

          console.log('[Analytics] Event listeners attached')

          // Cleanup on unmount
          return () => {
            clearInterval(flushInterval)
            flushEvents().catch(() => {})
            document.removeEventListener('click', handleClick)
            window.removeEventListener('scroll', handleScroll)
          }
        } catch (error) {
          console.error('[Analytics] Initialization failed:', error)
          // Don't break the page even if analytics fails
        }
      }

      initializeTracking()
    } catch (outerError) {
      console.error('[Analytics] Outer initialization error:', outerError)
      // Silently fail - don't break the page
    }
  }, [])

  return null
}
