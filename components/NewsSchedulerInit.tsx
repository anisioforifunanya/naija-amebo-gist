'use client'

import { useEffect } from 'react'

export function NewsSchedulerInit() {
  useEffect(() => {
    // Initialize news scheduler when app loads
    const initScheduler = async () => {
      try {
        const response = await fetch('/api/news/update', {
          method: 'POST',
        })
        if (response.ok) {
          console.log('News scheduler initialized')
        }
      } catch (error) {
        console.error('Failed to initialize news scheduler:', error)
      }
    }

    initScheduler()

    // Set up periodic updates
    const interval = setInterval(initScheduler, 15 * 60 * 1000) // Every 15 minutes

    return () => clearInterval(interval)
  }, [])

  return null
}
