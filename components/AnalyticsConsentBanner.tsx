'use client'

import { useState, useEffect } from 'react'

export function AnalyticsConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [accepted, setAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem('analyticsConsent')
    
    if (consent === null) {
      // First time - show banner after 2 seconds
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    } else {
      setAccepted(consent === 'true')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analyticsConsent', 'true')
    setAccepted(true)
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('analyticsConsent', 'false')
    setAccepted(false)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-lg shadow-2xl max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">🔒 Analytics & Privacy Notice</h3>
            <p className="text-sm text-blue-100">
              We use non-invasive analytics to understand user behavior and improve your experience. 
              We collect anonymized device information, IP-based location, and browsing patterns — 
              <strong>no personal data</strong> is stored. You can opt-out anytime in settings.
            </p>
            <p className="text-xs text-blue-200 mt-2">
              Compliant with NDPR, GDPR, and CCPA. See our <a href="/privacy" className="underline hover:text-blue-300">privacy policy</a> for details.
            </p>
          </div>
          
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-lg font-bold transition text-sm whitespace-nowrap"
            >
              Accept Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
