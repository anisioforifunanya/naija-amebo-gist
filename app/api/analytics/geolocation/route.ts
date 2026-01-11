import { NextRequest, NextResponse } from 'next/server'

/**
 * Geolocation API using IP-based lookup
 * Returns: Country, State, City, ISP, ASN
 * 
 * Note: This uses MaxMind GeoIP2 or similar service
 * Free tier available via ip-api.com or ipinfo.io
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0'

    // Validate IP
    if (clientIP === '0.0.0.0' || clientIP === '::1') {
      return NextResponse.json({
        ip: clientIP,
        country: 'Local',
        state: 'Development',
        city: 'Local Network',
        isp: 'Local',
        asn: 'N/A',
        timezone: 'Unknown',
        latitude: 0,
        longitude: 0,
        accuracy: 'Very Low'
      })
    }

    // Call IP geolocation service
    // Using ipinfo.io (free tier available, 50k requests/month)
    const geoResponse = await fetch(`https://ipinfo.io/${clientIP}?token=${process.env.IPINFO_TOKEN || ''}`)
    
    if (!geoResponse.ok) {
      throw new Error('Geolocation service unavailable')
    }

    const geoData = await geoResponse.json()

    // Parse coordinates
    const [latitude, longitude] = geoData.loc?.split(',').map(Number) || [0, 0]

    return NextResponse.json({
      ip: geoData.ip,
      country: geoData.country || 'Unknown',
      state: geoData.region || 'Unknown',
      city: geoData.city || 'Unknown',
      isp: geoData.org?.split(' ').slice(1).join(' ') || 'Unknown',
      asn: geoData.org?.split(' ')[0] || 'Unknown',
      timezone: geoData.timezone || 'Unknown',
      latitude: latitude || 0,
      longitude: longitude || 0,
      accuracy: 'City-level (~50km)',
      postal: geoData.postal,
      coordinates: { latitude, longitude }
    })
  } catch (error) {
    console.error('Geolocation error:', error)
    
    // Fallback response
    return NextResponse.json({
      ip: 'unknown',
      country: 'Unable to determine',
      state: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      error: error instanceof Error ? error.message : 'Geolocation service unavailable'
    }, { status: 503 })
  }
}
