'use client'

import { useEffect, useRef } from 'react'

interface MapComponentProps {
  latitude: number
  longitude: number
  accuracy: number
  height: string
}

export default function MapComponent({ latitude, longitude, accuracy, height }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const circleRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const LRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import leaflet only on client side
    const initMap = async () => {
      // Guard: only initialize once
      if (isInitializedRef.current) {
        return
      }

      // Guard: check if container exists
      if (!mapContainerRef.current) {
        return
      }

      // Guard: check if the container already has a map
      if ((mapContainerRef.current as any)._leaflet_id) {
        return
      }

      try {
        const L = await import('leaflet')
        LRef.current = L.default || L

        // Double-check guards after async import
        if (isInitializedRef.current || !mapContainerRef.current) {
          return
        }

        // Initialize map
        mapRef.current = LRef.current.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 16,
          scrollWheelZoom: true,
          attributionControl: true
        })

        // Add tile layer
        LRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(mapRef.current)

        // Add marker
        markerRef.current = LRef.current.marker([latitude, longitude], {
          title: 'Your Current Location'
        })
          .bindPopup(
            `<div class="text-sm"><p class="font-bold mb-1">Your Current Location</p>
              <p>Lat: ${latitude.toFixed(6)}</p>
              <p>Lng: ${longitude.toFixed(6)}</p>
              <p>Accuracy: ${accuracy.toFixed(1)}m</p></div>`
          )
          .addTo(mapRef.current)

        // Add accuracy circle
        circleRef.current = LRef.current.circle([latitude, longitude], {
          radius: accuracy,
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(mapRef.current)

        isInitializedRef.current = true
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // Cleanup on unmount
    return () => {
      if (mapRef.current && mapContainerRef.current) {
        try {
          mapRef.current.remove()
          mapRef.current = null
          markerRef.current = null
          circleRef.current = null
          isInitializedRef.current = false
        } catch (e) {
          console.error('Error cleaning up map:', e)
        }
      }
    }
  }, [])

  // Update marker and circle position when location changes
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current || !LRef.current) {
      return
    }

    try {
      // Update map center
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom())

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
        markerRef.current.setPopupContent(
          `<div class="text-sm"><p class="font-bold mb-1">Your Current Location</p>
            <p>Lat: ${latitude.toFixed(6)}</p>
            <p>Lng: ${longitude.toFixed(6)}</p>
            <p>Accuracy: ${accuracy.toFixed(1)}m</p></div>`
        )
      }

      // Update circle
      if (circleRef.current) {
        circleRef.current.setLatLng([latitude, longitude])
        circleRef.current.setRadius(accuracy)
      }
    } catch (error) {
      console.error('Error updating map:', error)
    }
  }, [latitude, longitude, accuracy])

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
}
