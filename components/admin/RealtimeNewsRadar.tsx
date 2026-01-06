'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { NewsCategory, NewsItem } from '@/lib/newsManagementTypes';
import { 
  getTrendingNews, 
  getNewsByCategory,
  updateNewsAnalytics
} from '@/lib/newsManagementUtils';

/**
 * REAL-TIME NEWS RADAR
 * Monitors breaking news, trending topics, and engagement spikes
 * Optimized for high-traffic real-time updates
 */

interface RadarAlert {
  id: string;
  type: 'breaking' | 'trending' | 'engagement_spike' | 'viral_alert';
  title: string;
  category: NewsCategory;
  metric: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function RealtimeNewsRadar() {
  const [alerts, setAlerts] = useState<RadarAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('breaking');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  const categories: NewsCategory[] = ['breaking', 'trending', 'celebrity', 'entertainment', 'viral'];

  // Fetch and monitor news for real-time updates
  const monitorNews = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch trending news across all categories
      const trendingNews = await getTrendingNews(50);
      const newAlerts: RadarAlert[] = [];

      for (const news of trendingNews) {
        // Check for viral spikes
        if (news.analytics && news.analytics.viral_score > 70) {
          newAlerts.push({
            id: `viral_${news.id}`,
            type: 'viral_alert',
            title: news.title,
            category: news.category,
            metric: `🔥 Viral Score: ${news.analytics.viral_score}/100`,
            timestamp: news.analytics.timestamp,
            priority: news.analytics.viral_score > 85 ? 'critical' : 'high'
          });
        }

        // Check for engagement spikes
        if (news.analytics && news.analytics.engagement_rate > 15) {
          newAlerts.push({
            id: `engagement_${news.id}`,
            type: 'engagement_spike',
            title: news.title,
            category: news.category,
            metric: `📈 Engagement: ${(news.analytics.engagement_rate as unknown as number).toFixed(2)}%`,
            timestamp: news.analytics.timestamp,
            priority: 'high'
          });
        }
      }

      // Separate by category for breaking news
      const breakingNews = await getNewsByCategory('breaking', 20);
      breakingNews.slice(0, 5).forEach(news => {
        if (news.published_at && Date.now() - news.published_at < 300000) { // Last 5 minutes
          newAlerts.push({
            id: `breaking_${news.id}`,
            type: 'breaking',
            title: news.title,
            category: 'breaking',
            metric: '🚨 Breaking News',
            timestamp: news.published_at,
            priority: 'critical'
          });
        }
      });

      // Sort by priority and timestamp
      newAlerts.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          b.timestamp - a.timestamp
        );
      });

      setAlerts(newAlerts.slice(0, 20)); // Keep top 20 alerts
      setLoading(false);
    } catch (error) {
      console.error('❌ Radar monitoring error:', error);
      setLoading(false);
    }
  }, []);

  // Start real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    monitorNews();
    const interval = setInterval(monitorNews, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, monitorNews]);

  // Get alert color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      default:
        return '🔵';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📡 Real-Time News Radar
          {isMonitoring && <span className="animate-pulse inline-block w-2 h-2 bg-red-600 rounded-full"></span>}
        </h2>
        
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isMonitoring
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isMonitoring ? '⏹ Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Refresh Interval (ms)
          </label>
          <input
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Math.max(1000, parseInt(e.target.value)))}
            disabled={isMonitoring}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            min="1000"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Filter
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as NewsCategory)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={monitorNews}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? '🔄 Updating...' : '🔄 Refresh Now'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isMonitoring ? '📡 Monitoring for alerts...' : '👁️ Start monitoring to see real-time updates'}
          </div>
        ) : (
          alerts
            .filter(alert => !selectedCategory || alert.category === selectedCategory)
            .map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg transition hover:shadow-md ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getPriorityBadge(alert.priority)}</span>
                      <h3 className="font-bold text-gray-900 dark:text-white">{alert.title}</h3>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="bg-opacity-50 px-2 py-1 rounded bg-gray-300 dark:bg-gray-700">
                        {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{alert.metric}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.priority === 'critical').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.priority === 'high').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.priority === 'medium').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</div>
        </div>
      </div>
    </div>
  );
}
