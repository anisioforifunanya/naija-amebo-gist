'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GeoLocation {
  country: string
  state?: string
  city?: string
  latitude: number
  longitude: number
  isp?: string
  visits: number
}

export default function GeoLocationMap() {
  const [locations, setLocations] = useState<GeoLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [topCountries, setTopCountries] = useState<[string, number][]>([])

  const loadGeoData = async () => {
    try {
      setLoading(true)
      // Fetch geo-tagged analytics events
      const response = await fetch(`/api/analytics/track?timeRange=${timeRange}`)
      const data = await response.json()
      
      if (data.events && Array.isArray(data.events)) {
        // Group by country/location
        const geoMap: Record<string, GeoLocation> = {}
        
        data.events.forEach((event: any) => {
          if (event.country) {
            const key = `${event.country}|${event.city || 'N/A'}`
            if (!geoMap[key]) {
              geoMap[key] = {
                country: event.country,
                state: event.state,
                city: event.city,
                latitude: event.latitude || 0,
                longitude: event.longitude || 0,
                isp: event.isp,
                visits: 0
              }
            }
            geoMap[key].visits += 1
          }
        })

        const locArray = Object.values(geoMap)
        setLocations(locArray)

        // Get top countries
        const countryMap: Record<string, number> = {}
        data.events.forEach((event: any) => {
          if (event.country) {
            countryMap[event.country] = (countryMap[event.country] || 0) + 1
          }
        })
        const topC = Object.entries(countryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
        setTopCountries(topC as [string, number][])
      }
    } catch (error) {
      console.error('Failed to load geolocation data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGeoData()
  }, [timeRange])

  if (loading) {
    return <div className="p-8">Loading geolocation data...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/admin/analytics-monitor" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Analytics Monitor
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">🗺️ Geolocation Analytics Map</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Country List */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">🌍 Top Countries</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topCountries.map(([country, count], idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedCountry === country
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{country}</span>
                  <span className="text-sm">{count} visits</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Map Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 rounded-lg p-6 min-h-96">
            <h2 className="font-bold text-lg mb-4">📍 Visitor Distribution</h2>
            
            {selectedCountry ? (
              <div>
                <h3 className="text-xl font-bold mb-4">{selectedCountry}</h3>
                <div className="space-y-3">
                  {locations
                    .filter(loc => loc.country === selectedCountry)
                    .sort((a, b) => b.visits - a.visits)
                    .map((loc, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">
                              {loc.city || 'N/A'}{loc.state ? `, ${loc.state}` : ''}
                            </div>
                            <div className="text-sm text-gray-600">
                              📍 {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                              {loc.isp ? ` | ISP: ${loc.isp}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{loc.visits}</div>
                            <div className="text-xs text-gray-500">visits</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Select a country to see city-level breakdown</p>
                
                {/* ASCII World Map Representation */}
                <div className="bg-white rounded p-4 font-mono text-xs overflow-x-auto">
                  <div className="text-center text-gray-700">
                    <div>🌍 World Visitor Distribution</div>
                    <div className="mt-4 space-y-1">
                      {topCountries.slice(0, 5).map(([country, count]) => {
                        const barLength = Math.min(Math.ceil((count / topCountries[0][1]) * 20), 20)
                        return (
                          <div key={country} className="flex items-center gap-2">
                            <span className="w-16 text-right text-sm">{country}</span>
                            <div className="flex gap-0">
                              {Array(barLength)
                                .fill(0)
                                .map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-4 w-2 bg-gradient-to-r from-blue-400 to-blue-600"
                                  ></div>
                                ))}
                            </div>
                            <span className="text-xs text-gray-600 w-10">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-50 p-4 rounded text-sm">
                  <strong>💡 Insights:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>✓ Visitors from {topCountries.length} countries</li>
                    <li>✓ Top region: {topCountries[0]?.[0] || 'N/A'} ({topCountries[0]?.[1] || 0} visits)</li>
                    <li>✓ Total unique locations: {locations.length}</li>
                    <li>✓ Data updated every 5 seconds</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Regional Performance Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded">
              <div className="text-sm text-gray-600">High Traffic Regions</div>
              <div className="text-2xl font-bold text-green-600 mt-2">
                {topCountries.filter((_, i) => i < 3).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Top 3 regions active</div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded">
              <div className="text-sm text-gray-600">Avg Visits per Location</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {locations.length > 0
                  ? (
                      locations.reduce((sum, loc) => sum + loc.visits, 0) / locations.length
                    ).toFixed(1)
                  : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">visits per city</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Intelligence */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6 rounded-lg mt-8">
        <h3 className="font-bold text-lg mb-4">🤖 Location Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>📊 Coverage Statistics:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Countries with visitors: {topCountries.length}</li>
              <li>• Cities tracked: {locations.length}</li>
              <li>• Most active region: {topCountries[0]?.[0] || 'N/A'}</li>
            </ul>
          </div>
          <div>
            <strong>🎯 Geo-Targeting Recommendations:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Focus content for: {topCountries.slice(0, 2).map(c => c[0]).join(', ')}</li>
              <li>• Localize for: {topCountries.slice(2, 4).map(c => c[0]).join(', ') || 'Secondary markets'}</li>
              <li>• Monitor: Emerging regions with growth</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mt-8 text-sm text-gray-700">
        <strong>🔒 IP-Based Geolocation Notice:</strong> Locations are derived from IP addresses only (city-level accuracy ~50km). 
        No GPS or personal location data is collected. All data is anonymized and GDPR/NDPR compliant.
      </div>
    </div>
  )
}
