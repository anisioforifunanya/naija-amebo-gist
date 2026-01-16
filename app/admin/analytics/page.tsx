'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AnalyticsData {
  totalUsers: number
  totalAdmins: number
  totalNews: number
  totalMessages: number
  activeUsers: number
  bannedUsers: number
  verifiedUsers: number
  approvedNews: number
  pendingNews: number
  rejectedNews: number
  deletedMessages: number
  newUsers: number
  returningUsers: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h')
  const [stats, setStats] = useState<AnalyticsData>({
    totalUsers: 0,
    totalAdmins: 0,
    totalNews: 0,
    totalMessages: 0,
    activeUsers: 0,
    bannedUsers: 0,
    verifiedUsers: 0,
    approvedNews: 0,
    pendingNews: 0,
    rejectedNews: 0,
    deletedMessages: 0,
    newUsers: 0,
    returningUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealData = () => {
      try {
        // Load users data
        const usersData = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
        const totalUsers = usersData.length
        const activeUsers = usersData.filter((u: any) => !u.isBanned).length
        const bannedUsers = usersData.filter((u: any) => u.isBanned).length
        const verifiedUsers = usersData.filter((u: any) => u.isVerified).length

        // Load admins data
        const adminsData = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
        const totalAdmins = adminsData.length

        // Load news data
        const newsData = JSON.parse(localStorage.getItem('naijaAmeboNews') || '[]')
        const totalNews = newsData.length
        const approvedNews = newsData.filter((n: any) => n.status === 'approved').length
        const pendingNews = newsData.filter((n: any) => n.status === 'pending').length
        const rejectedNews = newsData.filter((n: any) => n.status === 'rejected').length

        // Load messages data
        const messagesData = JSON.parse(localStorage.getItem('naijaAmeboMessages') || '[]')
        const totalMessages = messagesData.length
        const deletedMessages = messagesData.filter((m: any) => m.isDeleted).length

        // Calculate derived metrics
        const newUsers = Math.ceil(totalUsers * 0.3)
        const returningUsers = totalUsers - newUsers

        setStats({
          totalUsers,
          totalAdmins,
          totalNews,
          totalMessages,
          activeUsers,
          bannedUsers,
          verifiedUsers,
          approvedNews,
          pendingNews,
          rejectedNews,
          deletedMessages,
          newUsers,
          returningUsers
        })
      } catch (error) {
        console.error('Failed to load analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRealData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const engagementRate = stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0
  const pageViews = stats.totalNews * 45
  const bounceRate = 24

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📊 Platform Analytics</h1>
              <p className="text-blue-100 mt-2">Real-time platform performance and user activity data</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">✓ {stats.activeUsers} active</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total News Posts</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.totalNews}</p>
                <p className="text-xs text-green-600 mt-1">✓ {stats.approvedNews} approved</p>
              </div>
              <div className="text-4xl">📰</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrators</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.totalAdmins}</p>
                <p className="text-xs text-gray-600 mt-1">Platform moderators</p>
              </div>
              <div className="text-4xl">👑</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{engagementRate}%</p>
                <p className="text-xs text-green-600 mt-1">Active user ratio</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">👥 User Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified Users</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{stats.verifiedUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{width: stats.totalUsers > 0 ? `${(stats.verifiedUsers / stats.totalUsers) * 100}%` : '0%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats.activeUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{width: stats.totalUsers > 0 ? `${(stats.activeUsers / stats.totalUsers) * 100}%` : '0%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Banned Users</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{stats.bannedUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-red-600 h-3 rounded-full" style={{width: stats.totalUsers > 0 ? `${(stats.bannedUsers / stats.totalUsers) * 100}%` : '0%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📰 News Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approved Posts</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{stats.approvedNews}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{width: stats.totalNews > 0 ? `${(stats.approvedNews / stats.totalNews) * 100}%` : '0%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Posts</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingNews}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-yellow-600 h-3 rounded-full" style={{width: stats.totalNews > 0 ? `${(stats.pendingNews / stats.totalNews) * 100}%` : '0%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rejected Posts</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{stats.rejectedNews}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-red-600 h-3 rounded-full" style={{width: stats.totalNews > 0 ? `${(stats.rejectedNews / stats.totalNews) * 100}%` : '0%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📊 Summary Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Total Users</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalNews}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">News Posts</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Administrators</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.totalMessages - stats.deletedMessages}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Active Messages</p>
            </div>
          </div>
        </div>

        {/* Device & Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📱 User Distribution</h3>
            <div className="space-y-4">
              {[
                { name: 'Verified', count: stats.verifiedUsers, color: 'bg-green-600' },
                { name: 'Active', count: stats.activeUsers, color: 'bg-blue-600' },
                { name: 'Banned', count: stats.bannedUsers, color: 'bg-red-600' }
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full`} style={{width: stats.totalUsers > 0 ? `${(item.count / stats.totalUsers) * 100}%` : '0%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📰 News Distribution</h3>
            <div className="space-y-4">
              {[
                { name: 'Approved', count: stats.approvedNews, color: 'bg-green-600' },
                { name: 'Pending', count: stats.pendingNews, color: 'bg-yellow-600' },
                { name: 'Rejected', count: stats.rejectedNews, color: 'bg-red-600' }
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full`} style={{width: stats.totalNews > 0 ? `${(item.count / stats.totalNews) * 100}%` : '0%'}}></div>
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
