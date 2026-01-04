'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
)

// Import Leaflet config
if (typeof window !== 'undefined') {
  require('@/lib/leaflet-config')
}

interface LocationTrackerProps {
  onLocationUpdate?: (location: GeolocationPosition) => void
  enableTracking?: boolean
  updateInterval?: number // in milliseconds
  showMap?: boolean
  height?: string
  onClose?: () => void
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export default function LocationTracker({
  onLocationUpdate,
  enableTracking = true,
  updateInterval = 1000, // Update every 1 second for real-time tracking
  showMap = true,
  height = '400px',
  onClose
}: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingHistory, setTrackingHistory] = useState<LocationData[]>([])
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const watchIdRef = useRef<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      // Clean up watch position on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [])

  // Check permission status
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied')
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied')
        })
      }).catch(() => {
        // Permissions API not supported, try direct access
        setPermissionStatus('prompt')
      })
    }
  }, [])

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached position
    }

    // Watch position for real-time updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        }

        setLocation(locationData)
        setTrackingHistory(prev => [...prev.slice(-50), locationData]) // Keep last 50 positions

        if (onLocationUpdate) {
          onLocationUpdate(position)
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions.')
            setPermissionStatus('denied')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Please check your GPS.')
            break
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.')
            break
          default:
            setError('An unknown error occurred while getting location.')
        }
        setIsTracking(false)
      },
      options
    )
  }

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  // Auto-start tracking if enabled
  useEffect(() => {
    if (enableTracking && permissionStatus !== 'denied') {
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [enableTracking])

  // Format speed (m/s to km/h)
  const formatSpeed = (speed: number | null) => {
    if (speed === null) return 'N/A'
    return `${(speed * 3.6).toFixed(1)} km/h`
  }

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Live Location Tracker
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isTracking ? (
            <button
              onClick={stopTracking}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
              Stop Tracking
            </button>
          ) : (
            <button
              onClick={startTracking}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
            >
              Start Tracking
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{location.latitude.toFixed(6)}°</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{location.longitude.toFixed(6)}°</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{location.accuracy.toFixed(1)}m</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speed</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatSpeed(location.speed)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last updated: {formatTime(location.timestamp)}</span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Tracking Active
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      {showMap && location && isMounted && (
        <div style={{ height }} className="relative">
          <MapComponent
            latitude={location.latitude}
            longitude={location.longitude}
            accuracy={location.accuracy}
            height={height}
          />
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 text-xs z-[1000]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">You are here</span>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no location */}
      {!location && !error && (
        <div className="p-8 text-center" style={{ height: showMap ? height : 'auto' }}>
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Start Tracking" to share your live location
          </p>
        </div>
      )}

      {/* Statistics */}
      {trackingHistory.length > 1 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tracking Statistics</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Points Tracked</p>
              <p className="text-lg font-bold text-blue-600">{trackingHistory.length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Avg Accuracy</p>
              <p className="text-lg font-bold text-green-600">
                {(trackingHistory.reduce((sum, l) => sum + l.accuracy, 0) / trackingHistory.length).toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.floor((Date.now() - trackingHistory[0].timestamp) / 1000)}s
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
