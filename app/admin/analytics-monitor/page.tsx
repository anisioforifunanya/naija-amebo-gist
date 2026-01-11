'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnalyticsAnomalyDetector } from '@/lib/analyticsAnomalyDetector'

interface Analytics {
  totalSessions: number
  uniqueDevices: number
  uniqueBrowsers: number
  uniqueOS: number
  topDevices: [string, number][]
  topBrowsers: [string, number][]
  topOS: [string, number][]
  totalClicks: number
  totalTimeSpent: number
  totalPageViews: number
  averageEngagementScore: number
  returningUsers: number
  newUsers: number
  botDetected: number
  bounceRate: number
}

interface AnomalyAlert {
  type: 'bot_activity' | 'traffic_spike' | 'unusual_pattern' | 'geo_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  data: any
  timestamp: Date
  recommendation: string
}

export default function AnalyticsMonitor() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [trend, setTrend] = useState<any>(null)

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/track?timeRange=${timeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
        setEvents(data.events || [])

        // Run AI anomaly detection
        if (data.events && Array.isArray(data.events)) {
          const detectedAnomalies = AnalyticsAnomalyDetector.analyzeEvents(
            data.events,
            data.analytics.totalSessions
          )
          setAnomalies(detectedAnomalies)

          // Get AI recommendations
          const aiRecommendations = AnalyticsAnomalyDetector.getRecommendations(data.analytics)
          setRecommendations(aiRecommendations)

          // Get traffic trend prediction
          const trendPrediction = AnalyticsAnomalyDetector.predictTrends(data.events)
          setTrend(trendPrediction)
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadAnalytics()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

  if (loading) {
    return <div className="p-8">Loading analytics...</div>
  }

  const engagementColor = analytics?.averageEngagementScore! > 70 ? 'text-green-600' : 
                          analytics?.averageEngagementScore! > 40 ? 'text-yellow-600' : 
                          'text-red-600'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
          <span className="mr-2">← Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Main Content with Top Padding */}
      <div className="pt-12">
      <Link href="/admin/user-presence" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to User Presence
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📊 Advanced Analytics Dashboard</h1>
        <div className="flex gap-4">
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
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸ Manual'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Total Sessions</div>
          <div className="text-3xl font-bold text-blue-600">{analytics?.totalSessions || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Unique visitors</div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Unique Devices</div>
          <div className="text-3xl font-bold text-purple-600">{analytics?.uniqueDevices || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Different devices</div>
        </div>

        <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-lg`}>
          <div className="text-sm text-gray-600">Engagement Score</div>
          <div className={`text-3xl font-bold ${engagementColor}`}>
            {analytics?.averageEngagementScore || 0}/100
          </div>
          <div className="text-xs text-gray-500 mt-2">User interaction level</div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Bounce Rate</div>
          <div className="text-3xl font-bold text-orange-600">{analytics?.bounceRate || 0}%</div>
          <div className="text-xs text-gray-500 mt-2">Single page exits</div>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">🤖 AI Analytics Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">👥 User Behavior</h3>
            <ul className="text-sm space-y-1">
              <li>✓ {analytics?.returningUsers || 0} returning visitors (loyalty: {((analytics?.returningUsers! / analytics?.totalSessions!) * 100).toFixed(1)}%)</li>
              <li>✓ {analytics?.newUsers || 0} new visitors</li>
              <li>✓ Avg time per session: {Math.round(analytics?.totalTimeSpent! / analytics?.totalSessions! / 60) || 0}m {analytics?.totalTimeSpent! % 60}s</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">🎯 Traffic Quality</h3>
            <ul className="text-sm space-y-1">
              <li className={analytics?.botDetected! > 0 ? '⚠️' : '✓'} >Bot detected: {analytics?.botDetected || 'None'}</li>
              <li>✓ Avg page views per session: {(analytics?.totalPageViews! / analytics?.totalSessions!).toFixed(1)}</li>
              <li>✓ Total interactions: {analytics?.totalClicks || 0} clicks</li>
            </ul>
          </div>
        </div>

        {/* Trend Prediction */}
        {trend && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="text-sm">
              <strong>📈 Trend Analysis:</strong> {trend.prediction}
            </div>
          </div>
        )}
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-700 mb-4">🚨 AI-Detected Anomalies</h2>
          <div className="space-y-3">
            {anomalies.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-100 border-red-500'
                    : alert.severity === 'high'
                    ? 'bg-orange-100 border-orange-500'
                    : 'bg-yellow-100 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900">{alert.description}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Recommendation:</strong> {alert.recommendation}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      alert.severity === 'critical'
                        ? 'bg-red-600 text-white'
                        : alert.severity === 'high'
                        ? 'bg-orange-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">💡 AI Recommendations</h2>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="text-green-900">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device & Browser Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">📱 Top Devices</h3>
          <div className="space-y-3">
            {analytics?.topDevices?.slice(0, 5).map(([device, count], idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{device || 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-200 h-6 rounded" style={{ width: `${(count / analytics.totalSessions) * 100}px` }}></div>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">🌐 Top Browsers</h3>
          <div className="space-y-3">
            {analytics?.topBrowsers?.slice(0, 5).map(([browser, count], idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{browser || 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-200 h-6 rounded" style={{ width: `${(count / analytics.totalSessions) * 100}px` }}></div>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">🖥️ Top Operating Systems</h3>
          <div className="space-y-3">
            {analytics?.topOS?.slice(0, 5).map(([os, count], idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{os || 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-green-200 h-6 rounded" style={{ width: `${(count / analytics.totalSessions) * 100}px` }}></div>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Events Stream */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">📡 Live Events Stream (Real-Time)</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length > 0 ? (
            events.map((event, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded text-sm border-l-4 border-blue-400">
                <div className="flex justify-between">
                  <span className="font-bold">{event.browser || 'Unknown'} on {event.os || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {event.deviceModel || 'Device'} | {event.pageTitle?.substring(0, 40)} | Engagement: {event.engagementScore || 0}/100
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No events recorded yet</p>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mt-8 text-sm text-gray-700">
        <strong>🔒 Privacy & Compliance Notice:</strong> This analytics system uses device fingerprinting and IP-based geolocation only. 
        No personally identifiable information (PII) is collected. All data is anonymized and users can opt-out. 
        Compliant with NDPR, GDPR, and CCPA regulations.
      </div>
    </div>
  )
}
