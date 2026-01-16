'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h')
  const [stats, setStats] = useState({
    totalSessions: 240,
    activeUsers: 5,
    totalPosts: 20,
    engagementRate: 78,
    newUsers: 6,
    returningUsers: 35,
    pageViews: 225,
    bounceRate: 24
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📊 Platform Analytics</h1>
              <p className="text-blue-100 mt-2">Monitor platform performance and user activity</p>
            </div>
            <Link
              href="/admin"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-semibold"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Range</h2>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalSessions}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.activeUsers}</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% from last week</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.totalPosts}</p>
                <p className="text-xs text-green-600 mt-1">↑ 24% from last week</p>
              </div>
              <div className="text-4xl">📰</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.engagementRate}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📈 User Growth</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Users (This Month)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats.newUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Returning Users (30 Days)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{stats.returningUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">🎯 Content Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Page Views</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{stats.pageViews}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-purple-600 h-3 rounded-full" style={{width: '82%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{stats.bounceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-red-600 h-3 rounded-full" style={{width: '24%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📰 Content by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Breaking News</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">25% of total</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">8</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Trending Stories</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">40% of total</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Entertainment</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">20% of total</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">3</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Gossip</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">15% of total</p>
            </div>
          </div>
        </div>

        {/* Device & Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📱 Top Devices</h3>
            <div className="space-y-4">
              {[
                { name: 'Mobile', percentage: 65, color: 'bg-blue-600' },
                { name: 'Desktop', percentage: 30, color: 'bg-green-600' },
                { name: 'Tablet', percentage: 5, color: 'bg-purple-600' }
              ].map((device) => (
                <div key={device.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{device.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`${device.color} h-3 rounded-full`} style={{width: `${device.percentage}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">🌐 Top Browsers</h3>
            <div className="space-y-4">
              {[
                { name: 'Chrome', percentage: 58, color: 'bg-blue-600' },
                { name: 'Safari', percentage: 25, color: 'bg-gray-600' },
                { name: 'Firefox', percentage: 12, color: 'bg-orange-600' },
                { name: 'Other', percentage: 5, color: 'bg-gray-400' }
              ].map((browser) => (
                <div key={browser.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{browser.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{browser.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`${browser.color} h-3 rounded-full`} style={{width: `${browser.percentage}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
