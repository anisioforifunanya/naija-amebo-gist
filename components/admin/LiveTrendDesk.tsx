'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { NewsItem, TrendingNews } from '@/lib/newsManagementTypes';
import { getTrendingNews, updateNews } from '@/lib/newsManagementUtils';

/**
 * LIVE TREND DESK
 * Real-time trending content management
 * Control what appears on trending pages and adjust ranking
 */

export default function LiveTrendDesk() {
  const [trendingList, setTrendingList] = useState<(NewsItem & { trend_score: number; momentum: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  // Fetch trending news
  const fetchTrendingNews = async () => {
    setLoading(true);
    try {
      const trending = await getTrendingNews(50);
      
      // Add trend metrics
      const withMetrics = trending.map((news, idx) => ({
        ...news,
        trend_score: Math.max(10, 100 - (idx * 2)) + (news.analytics?.viral_score ?? 0) / 2,
        momentum: Math.random() * 10
      }));

      setTrendingList(withMetrics);
    } catch (error) {
      console.error('❌ Error fetching trends:', error);
      toast.error('Failed to load trending news');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchTrendingNews();
    
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchTrendingNews, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Move trending item up
  const boostTrend = async (newsId: string) => {
    try {
      await updateNews(newsId, {
        'analytics.viral_score': 99
      } as any);
      
      toast.success('🚀 Trend boosted to top');
      fetchTrendingNews();
    } catch (error) {
      toast.error('Failed to boost trend');
    }
  };

  // Remove from trending
  const removeTrend = async (newsId: string) => {
    try {
      await updateNews(newsId, {
        'analytics.viral_score': 0
      } as any);
      
      toast.success('❌ Removed from trending');
      fetchTrendingNews();
    } catch (error) {
      toast.error('Failed to remove from trending');
    }
  };

  // Adjust momentum/viability
  const adjustMomentum = async (newsId: string, direction: 'up' | 'down') => {
    try {
      const news = trendingList.find(n => n.id === newsId);
      if (!news) return;

      const newScore = Math.max(0, Math.min(100, news.trend_score + (direction === 'up' ? 5 : -5)));
      
      await updateNews(newsId, {
        'analytics.viral_score': newScore
      } as any);

      toast.success(direction === 'up' ? '📈 Momentum increased' : '📉 Momentum decreased');
      fetchTrendingNews();
    } catch (error) {
      toast.error('Failed to adjust momentum');
    }
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum > 8) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (momentum > 5) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    if (momentum > 2) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
  };

  const getTrendIcon = (momentum: number) => {
    if (momentum > 8) return '🔥';
    if (momentum > 5) return '📈';
    if (momentum > 2) return '⭐';
    return '📌';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📊 Live Trend Desk
            {autoRefresh && <span className="animate-pulse inline-block w-2 h-2 bg-red-600 rounded-full"></span>}
          </h2>
          <button
            onClick={fetchTrendingNews}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Control Panel */}
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-refresh</span>
          </label>

          {autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interval (ms)
              </label>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Math.max(1000, parseInt(e.target.value)))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                min="1000"
                step="1000"
              />
            </div>
          )}
        </div>
      </div>

      {/* Trending Items */}
      <div className="space-y-3">
        {trendingList.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">📭 No trending news yet</p>
          </div>
        ) : (
          trendingList.map((news, idx) => (
            <div
              key={news.id}
              className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition hover:shadow-lg border-l-4 ${
                idx === 0 ? 'border-l-red-600 bg-red-50 dark:bg-red-900/10' :
                idx === 1 ? 'border-l-orange-600 bg-orange-50 dark:bg-orange-900/10' :
                idx === 2 ? 'border-l-yellow-600 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-l-blue-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank */}
                  <div className="text-center min-w-16">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">#{idx + 1}</div>
                    <div className={`text-lg font-bold mt-1 ${getMomentumColor(news.momentum)}`}>
                      {getTrendIcon(news.momentum)}
                    </div>
                  </div>

                  {/* News Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {news.description}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {news.category.toUpperCase()}
                      </span>
                      <span>📊 Score: {news.trend_score.toFixed(0)}</span>
                      <span>⬆️ Momentum: {news.momentum.toFixed(1)}/10</span>
                      <span>👁️ Views: {(news.analytics?.views ?? 0).toLocaleString()}</span>
                      <span>💬 Engagement: {((news.analytics?.shares ?? 0) + (news.analytics?.comments ?? 0)).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Image */}
                  {news.image_url && (
                    <img 
                      src={news.image_url} 
                      alt={news.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>

                {/* Metrics */}
                <div className="text-right ml-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    Viral Score
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {(news.analytics?.viral_score ?? 0).toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Views</label>
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${Math.min(100, ((news.analytics?.views ?? 0) / 50000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Engagement</label>
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full"
                      style={{ width: `${Math.min(100, (((news.analytics?.shares ?? 0) + (news.analytics?.comments ?? 0)) / 5000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => boostTrend(news.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
                  title="Boost to #1"
                >
                  🚀 Boost
                </button>
                <button
                  onClick={() => adjustMomentum(news.id, 'up')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
                  title="Increase momentum"
                >
                  📈 Up
                </button>
                <button
                  onClick={() => adjustMomentum(news.id, 'down')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded transition"
                  title="Decrease momentum"
                >
                  📉 Down
                </button>
                <button
                  onClick={() => removeTrend(news.id)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded transition ml-auto"
                  title="Remove from trending"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{trendingList.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Trending</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {trendingList.filter(n => (n.analytics?.viral_score ?? 0) > 80).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Viral (80+)</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {trendingList.reduce((sum, n) => sum + (n.analytics?.views ?? 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Combined Views</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {trendingList.reduce((sum, n) => sum + ((n.analytics?.shares ?? 0) + (n.analytics?.comments ?? 0)), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Engagement</div>
        </div>
      </div>
    </div>
  );
}
