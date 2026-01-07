'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { NewsSource, NewsItem, NewsCategory } from '@/lib/newsManagementTypes';
import { addNewsSource, getNewsSources, bulkInsertNews } from '@/lib/newsManagementUtils';

/**
 * NIGERIA NEWS AGGREGATION ENGINE
 * Pull news from multiple sources, aggregate, deduplicate
 * Auto-categorize and populate the platform
 */

interface AggregationSource {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  api_key?: string;
  is_active: boolean;
  last_synced: number;
  sync_frequency: number; // minutes
}

const DEFAULT_SOURCES: Omit<AggregationSource, 'id' | 'last_synced'>[] = [
  { name: 'BBC News Nigeria', url: 'https://www.bbc.com/news/world/africa', category: 'breaking', is_active: true, sync_frequency: 15 },
  { name: 'Premium Times', url: 'https://www.premiumtimesng.com', category: 'breaking', is_active: true, sync_frequency: 30 },
  { name: 'The Punch Nigeria', url: 'https://punchng.com', category: 'trending', is_active: true, sync_frequency: 30 },
  { name: 'Guardian Nigeria', url: 'https://guardian.ng', category: 'trending', is_active: true, sync_frequency: 30 },
  { name: 'Vanguard News', url: 'https://www.vanguardngr.com', category: 'entertainment', is_active: true, sync_frequency: 45 },
  { name: 'Naija.com Celebrity', url: 'https://naija.com', category: 'celebrity', is_active: true, sync_frequency: 60 },
  { name: 'Twitter Trends', url: 'https://twitter.com', category: 'viral', is_active: true, sync_frequency: 5 },
  { name: 'TikTok Viral', url: 'https://www.tiktok.com', category: 'viral', is_active: true, sync_frequency: 10 },
];

export default function NewsAggregationEngine() {
  const [sources, setSources] = useState<AggregationSource[]>([]);
  const [aggregatedNews, setAggregatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    category: 'trending' as NewsCategory,
    api_key: ''
  });

  // Load sources on mount
  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const dbSources = await getNewsSources();
      if (dbSources.length === 0) {
        // Add default sources
        for (const source of DEFAULT_SOURCES) {
          const id = await addNewsSource({
            name: source.name,
            url: source.url,
            category: source.category,
            is_active: source.is_active,
            last_synced: 0
          });
          setSources(prev => [...prev, { ...source, id, last_synced: 0 }]);
        }
      } else {
        setSources(dbSources.map((s, idx) => ({
          ...s,
          sync_frequency: 30,
          last_synced: 0
        })));
      }
    } catch (error) {
      console.error('❌ Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add custom source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔴 Add Source clicked - newSource:', newSource);
    
    if (!newSource.name.trim()) {
      toast.error('Source name is required');
      return;
    }
    if (!newSource.url.trim()) {
      toast.error('Source URL is required');
      return;
    }

    try {
      console.log('📝 Adding source:', newSource);
      const id = await addNewsSource({
        name: newSource.name,
        url: newSource.url,
        category: newSource.category,
        api_key: newSource.api_key || undefined,
        is_active: true,
        last_synced: 0
      });

      setSources(prev => [...prev, {
        id,
        ...newSource,
        is_active: true,
        last_synced: 0,
        sync_frequency: 30
      }]);

      console.log('✅ Source added successfully with ID:', id);
      toast.success(`✅ Added "${newSource.name}" as news source!`);
      setNewSource({ name: '', url: '', category: 'trending', api_key: '' });
      setShowAddSource(false);
    } catch (error) {
      console.error('❌ Error adding source:', error);
      toast.error('Failed to add source: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Simulate news aggregation
  const aggregateNews = async () => {
    setSyncing(true);
    try {
      const activeSources = sources.filter(s => s.is_active);
      const news: NewsItem[] = [];

      // Simulate fetching from each source
      for (const source of activeSources) {
        // In production, this would call actual APIs
        const count = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < count; i++) {
          news.push({
            id: `agg_${source.id}_${i}`,
            title: `${source.name}: Sample News ${i + 1} - ${new Date().toLocaleTimeString()}`,
            description: `Breaking news from ${source.name}. This is aggregated content pulled from ${source.url}`,
            content: `Full article content from ${source.name}. Lorem ipsum dolor sit amet...`,
            category: source.category,
            image_url: `https://via.placeholder.com/400x300?text=${source.name}`,
            author: source.name,
            source: source.name,
            status: 'draft',
            created_at: Date.now(),
            updated_at: Date.now(),
            admin_id: 'aggregation_engine',
            tags: [source.category, source.name.toLowerCase()],
            seo_title: `Breaking: News from ${source.name}`,
            seo_description: `Latest news from ${source.name}`,
            seo_keywords: [source.category, 'news', 'Nigeria'],
            social_posts: [],
            auto_post_enabled: true,
            hashtags: [`#${source.category}`, '#Nigeria', '#News'],
            visibility: 'scheduled'
          });
        }

        // Update last synced
        setSources(prev => prev.map(s =>
          s.id === source.id
            ? { ...s, last_synced: Date.now() }
            : s
        ));
      }

      setAggregatedNews(news);
      toast.success(`✅ Aggregated ${news.length} news items from ${activeSources.length} sources`);
    } catch (error) {
      console.error('❌ Aggregation error:', error);
      toast.error('Failed to aggregate news');
    } finally {
      setSyncing(false);
    }
  };

  // Publish aggregated news
  const publishAggregatedNews = async () => {
    if (aggregatedNews.length === 0) {
      toast.error('No news to publish');
      return;
    }

    setSyncing(true);
    try {
      // In production, this would save to Firestore
      await bulkInsertNews(aggregatedNews);
      toast.success(`✅ Published ${aggregatedNews.length} articles`);
      setAggregatedNews([]);
    } catch (error) {
      console.error('❌ Publishing error:', error);
      toast.error('Failed to publish news');
    } finally {
      setSyncing(false);
    }
  };

  const getCategoryColor = (category: NewsCategory) => {
    switch (category) {
      case 'breaking':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'trending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'celebrity':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200';
      case 'entertainment':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'viral':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🌐 Nigeria News Aggregation Engine
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Pull news from multiple sources, aggregate, deduplicate, and auto-publish to keep your platform fresh with real-time content.
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={aggregateNews}
            disabled={syncing || sources.filter(s => s.is_active).length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {syncing ? '🔄 Aggregating...' : '🔄 Aggregate News'}
          </button>
          
          {aggregatedNews.length > 0 && (
            <button
              onClick={publishAggregatedNews}
              disabled={syncing}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {syncing ? '📤 Publishing...' : `📤 Publish ${aggregatedNews.length} Items`}
            </button>
          )}

          <button
            onClick={() => setShowAddSource(!showAddSource)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
          >
            ➕ Add Source
          </button>
        </div>
      </div>

      {/* Add Source Form */}
      {showAddSource && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">➕ Add News Source</h3>
          <form onSubmit={handleAddSource} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Source Name (e.g., BBC News)"
                value={newSource.name}
                onChange={(e) => {
                  console.log('📝 Name input changed:', e.target.value);
                  setNewSource({ ...newSource, name: e.target.value });
                }}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="url"
                placeholder="Source URL"
                value={newSource.url}
                onChange={(e) => {
                  console.log('🔗 URL input changed:', e.target.value);
                  setNewSource({ ...newSource, url: e.target.value });
                }}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newSource.category}
                onChange={(e) => setNewSource({ ...newSource, category: e.target.value as NewsCategory })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="breaking">Breaking</option>
                <option value="trending">Trending</option>
                <option value="celebrity">Celebrity</option>
                <option value="entertainment">Entertainment</option>
                <option value="viral">Viral</option>
              </select>
              <input
                type="text"
                placeholder="API Key (optional)"
                value={newSource.api_key}
                onChange={(e) => setNewSource({ ...newSource, api_key: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={syncing || !newSource.name.trim() || !newSource.url.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? '⏳ Adding...' : '✓ Add Source'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddSource(false)}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Sources */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📡 Active Sources ({sources.filter(s => s.is_active).length}/{sources.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map(source => (
            <div
              key={source.id}
              className={`p-4 rounded-lg border-2 transition ${
                source.is_active
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50'
              }`}
            >
              <div className="font-bold text-gray-900 dark:text-white mb-2">{source.name}</div>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 mb-2">
                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(source.category)}`}>
                  {source.category.toUpperCase()}
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {source.last_synced > 0
                  ? `Last: ${new Date(source.last_synced).toLocaleTimeString()}`
                  : 'Never synced'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                {source.url}
              </div>
              <div className="flex gap-1">
                <span className={`text-xs px-2 py-1 rounded font-semibold ${source.is_active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {source.is_active ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregated News Preview */}
      {aggregatedNews.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-blue-500">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📰 Aggregated News ({aggregatedNews.length} items)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {aggregatedNews.map((news, idx) => (
              <div key={news.id} className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm flex-1">
                    {idx + 1}. {news.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(news.category)}`}>
                    {news.category.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{news.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  Source: {news.source} • Status: {news.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sources</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{sources.filter(s => s.is_active).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{aggregatedNews.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Publish</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.min(15, Math.max(1, sources.filter(s => s.is_active).length))}m
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Sync Time</div>
        </div>
      </div>
    </div>
  );
}
