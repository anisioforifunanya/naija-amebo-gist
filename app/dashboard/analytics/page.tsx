"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  devices: Array<{ type: string; percentage: number }>;
  browsers: Array<{ name: string; percentage: number }>;
}

export default function Analytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const userSession = localStorage.getItem('naijaAmeboCurrentUser');
    
    if (!userSession) {
      router.push('/login');
      return;
    }

    setIsLoggedIn(true);
    loadAnalytics();
  }, [router, timeRange]);

  const loadAnalytics = () => {
    // Simulate analytics data
    const mockData: AnalyticsData = {
      pageViews: Math.floor(Math.random() * 50000) + 10000,
      uniqueVisitors: Math.floor(Math.random() * 10000) + 2000,
      bounceRate: Math.floor(Math.random() * 40) + 20,
      avgSessionDuration: Math.floor(Math.random() * 10) + 2,
      topPages: [
        { page: '/community', views: Math.floor(Math.random() * 5000) + 1000 },
        { page: '/news', views: Math.floor(Math.random() * 4000) + 800 },
        { page: '/marketplace', views: Math.floor(Math.random() * 3500) + 600 },
        { page: '/channels', views: Math.floor(Math.random() * 3000) + 500 },
        { page: '/trending-stories', views: Math.floor(Math.random() * 2500) + 400 },
      ],
      devices: [
        { type: 'Mobile', percentage: Math.floor(Math.random() * 30) + 50 },
        { type: 'Desktop', percentage: Math.floor(Math.random() * 30) + 40 },
        { type: 'Tablet', percentage: Math.floor(Math.random() * 15) + 5 },
      ],
      browsers: [
        { name: 'Chrome', percentage: Math.floor(Math.random() * 20) + 60 },
        { name: 'Safari', percentage: Math.floor(Math.random() * 15) + 15 },
        { name: 'Firefox', percentage: Math.floor(Math.random() * 10) + 10 },
        { name: 'Others', percentage: Math.floor(Math.random() * 5) + 5 },
      ],
    };
    setAnalytics(mockData);
  };

  if (!isMounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mb-8">
          <span className="mr-2">←</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Analytics</h1>
              <p className="text-blue-100">Track your activity and engagement metrics</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-700'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Page Views</p>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {analytics.pageViews.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-5xl opacity-20">📄</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Unique Visitors</p>
                    <div className="text-3xl font-bold text-green-600 mt-2">
                      {analytics.uniqueVisitors.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-5xl opacity-20">👥</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Bounce Rate</p>
                    <div className="text-3xl font-bold text-orange-600 mt-2">{analytics.bounceRate}%</div>
                  </div>
                  <div className="text-5xl opacity-20">📉</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Session</p>
                    <div className="text-3xl font-bold text-purple-600 mt-2">{analytics.avgSessionDuration}m</div>
                  </div>
                  <div className="text-5xl opacity-20">⏱️</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Pages */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Pages</h2>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.topPages.map((page, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white font-semibold">{page.page}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${(page.views / analytics.topPages[0].views) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Devices</h2>
                </div>

                <div className="p-6 space-y-4">
                  {analytics.devices.map((device, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-700 dark:text-gray-300 font-semibold">{device.type}</p>
                        <span className="text-gray-600 dark:text-gray-400">{device.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Browser Stats */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Browsers</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                {analytics.browsers.map((browser, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">{browser.name}</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{browser.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
