'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RealtimeNewsRadar from '@/components/admin/RealtimeNewsRadar';
import BreakingNewsMonitor from '@/components/admin/BreakingNewsMonitor';
import IntelligenceHub from '@/components/admin/IntelligenceHub';
import LiveTrendDesk from '@/components/admin/LiveTrendDesk';
import NewsAggregationEngine from '@/components/admin/NewsAggregationEngine';

/**
 * SUPER ADMIN NEWS MANAGEMENT SYSTEM
 * Phase 1 - Complete News Control Suite
 * 
 * Features:
 * ✅ Real-time News Radar - Monitor breaking news and trending topics
 * ✅ Breaking News Monitor - Quick publish system with instant social posting
 * ✅ Social & News Intelligence Hub - Analytics and sentiment analysis
 * ✅ Live Trend Desk - Control trending content and ranking
 * ✅ Nigeria News Aggregation Engine - Pull from multiple sources
 * 
 * All tools feature:
 * ✅ Real-time updates
 * ✅ Bulk operations
 * ✅ Category selection
 * ✅ Scheduling capability
 * ✅ Analytics tracking
 * ✅ Social auto-posting
 */

type TabType = 'radar' | 'breaking' | 'intelligence' | 'trends' | 'aggregation';

export default function NewsManagementDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('radar')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is super admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
      
      if (!adminSession) {
        // Not logged in, redirect to login
        router.push('/login')
        return
      }

      try {
        const admin = JSON.parse(adminSession)
        const isSuper = admin.isSuperAdmin === true || admin.role === 'super-admin'
        
        if (!isSuper) {
          // Not a super admin, redirect to home
          router.push('/')
          return
        }
        
        setIsSuperAdmin(true)
        setIsLoading(false)
      } catch (error) {
        // Invalid session, redirect to login
        router.push('/login')
      }
    }
  }, [router])

  // Show loading or unauthorized message
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">❌ Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You must be a Super Admin to access this page</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const tabs: { id: TabType; name: string; icon: string; color: string }[] = [
    { id: 'radar', name: 'News Radar', icon: '📡', color: 'from-red-500 to-orange-500' },
    { id: 'breaking', name: 'Breaking News', icon: '🚨', color: 'from-red-600 to-red-700' },
    { id: 'intelligence', name: 'Intelligence', icon: '🧠', color: 'from-purple-500 to-pink-500' },
    { id: 'trends', name: 'Trend Desk', icon: '📊', color: 'from-blue-500 to-cyan-500' },
    { id: 'aggregation', name: 'Aggregation', icon: '🌐', color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold transition-colors">
            <span className="mr-2">←</span>
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-12 rounded-2xl shadow-xl">
            <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
              📰 News Management System
            </h2>
            <p className="text-indigo-100 text-lg mb-6">
              Complete control over all news content with real-time monitoring and analytics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-sm font-medium">✅ Real-time Updates</div>
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-sm font-medium">✅ Bulk Operations</div>
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-sm font-medium">✅ Auto-Posting</div>
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-sm font-medium">✅ Analytics</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Horizontal Scroll on Mobile */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-min">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Spacious and Clean */}
        <div className="space-y-8">
          {activeTab === 'radar' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📡 Real-time News Radar</h3>
              <RealtimeNewsRadar />
            </div>
          )}

          {activeTab === 'breaking' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🚨 Breaking News Monitor</h3>
              <BreakingNewsMonitor />
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🧠 Intelligence Hub</h3>
              <IntelligenceHub />
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Live Trend Desk</h3>
              <LiveTrendDesk />
            </div>
          )}

          {activeTab === 'aggregation' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🌐 News Aggregation</h3>
              <NewsAggregationEngine />
            </div>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/super-admin/user-presence" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all border-l-4 border-green-500 group">
            <div className="text-4xl mb-3">🟢</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">User Presence</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor active users now</p>
          </Link>

          <Link href="/super-admin/analytics" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all border-l-4 border-blue-500 group">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View system metrics</p>
          </Link>

          <Link href="/super-admin/geo-map" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all border-l-4 border-purple-500 group">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Geo Map</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View geographic distribution</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
