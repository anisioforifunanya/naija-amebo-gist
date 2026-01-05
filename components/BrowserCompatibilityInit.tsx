'use client'

import { useEffect } from 'react'
import { initializeCompatibility } from '@/lib/browserCompatibility'

/**
 * Browser Compatibility Initializer
 * Runs on client-side to apply polyfills and compatibility fixes
 */
export function BrowserCompatibilityInit() {
  useEffect(() => {
    // Initialize all compatibility features
    initializeCompatibility()
  }, [])

  return null // This component doesn't render anything
}
