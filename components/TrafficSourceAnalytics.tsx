'use client';

import { useState, useEffect } from 'react';

interface TrafficSourceMetric {
  source: string;
  icon: string;
  visitors: number;
  pageViews: number;
  avgTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  topReferrer: string;
}

export default function TrafficSourceAnalytics() {
  const [sources, setSources] = useState<TrafficSourceMetric[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    loadTrafficSources();
  }, []);

  const loadTrafficSources = () => {
    const mockSources: TrafficSourceMetric[] = [
      {
        source: 'Google',
        icon: '🔍',
        visitors: 2840,
        pageViews: 8520,
        avgTimeOnSite: 3.5,
        bounceRate: 35.2,
        conversionRate: 4.8,
        topReferrer: 'google.com/search',
      },
      {
        source: 'Instagram',
        icon: '📸',
        visitors: 1540,
        pageViews: 3870,
        avgTimeOnSite: 2.8,
        bounceRate: 42.1,
        conversionRate: 3.2,
        topReferrer: 'instagram.com',
      },
      {
        source: 'TikTok',
        icon: '🎵',
        visitors: 1240,
        pageViews: 2480,
        avgTimeOnSite: 2.1,
        bounceRate: 48.5,
        conversionRate: 2.1,
        topReferrer: 'tiktok.com/@profile',
      },
      {
        source: 'Facebook',
        icon: '👍',
        visitors: 890,
        pageViews: 1780,
        avgTimeOnSite: 3.2,
        bounceRate: 38.9,
        conversionRate: 3.8,
        topReferrer: 'facebook.com',
      },
      {
        source: 'Direct',
        icon: '🔗',
        visitors: 650,
        pageViews: 1950,
        avgTimeOnSite: 4.1,
        bounceRate: 28.3,
        conversionRate: 6.2,
        topReferrer: 'Direct entry',
      },
      {
        source: 'LinkedIn',
        icon: '💼',
        visitors: 420,
        pageViews: 840,
        avgTimeOnSite: 3.8,
        bounceRate: 32.1,
        conversionRate: 5.4,
        topReferrer: 'linkedin.com',
      },
      {
        source: 'Twitter/X',
        icon: '𝕏',
        visitors: 380,
        pageViews: 950,
        avgTimeOnSite: 2.9,
        bounceRate: 41.2,
        conversionRate: 3.5,
        topReferrer: 'x.com',
      },
      {
        source: 'Email',
        icon: '📧',
        visitors: 210,
        pageViews: 630,
        avgTimeOnSite: 4.5,
        bounceRate: 22.1,
        conversionRate: 7.8,
        topReferrer: 'Email campaigns',
      },
    ];

    setSources(mockSources);
    setTotalVisitors(mockSources.reduce((sum, s) => sum + s.visitors, 0));
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      Google: 'from-blue-500 to-red-500',
      Instagram: 'from-pink-500 to-purple-500',
      TikTok: 'from-black to-purple-500',
      Facebook: 'from-blue-600 to-blue-400',
      Direct: 'from-green-500 to-emerald-500',
      LinkedIn: 'from-blue-700 to-blue-500',
      'Twitter/X': 'from-gray-900 to-gray-700',
      Email: 'from-orange-500 to-yellow-500',
    };
    return colors[source] || 'from-gray-500 to-gray-700';
  };

  const getPercentage = (visitors: number) => {
    return ((visitors / totalVisitors) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🚀 Traffic Source Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Visitor acquisition by source with performance metrics
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((source) => (
          <div
            key={source.source}
            onClick={() =>
              setSelectedSource(
                selectedSource === source.source ? null : source.source
              )
            }
            className={`cursor-pointer rounded-lg shadow p-4 transition-all transform hover:scale-105 ${
              selectedSource === source.source
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            } bg-white dark:bg-gray-800`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{source.icon}</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {getPercentage(source.visitors)}%
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              {source.source}
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {source.visitors.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">visitors</p>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {selectedSource ? `${selectedSource} Performance` : 'All Traffic Sources'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Page Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Avg Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(selectedSource
                ? sources.filter((s) => s.source === selectedSource)
                : sources
              ).map((source) => (
                <tr
                  key={source.source}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{source.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {source.source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {source.visitors.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {getPercentage(source.visitors)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {source.pageViews.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${Math.min(source.avgTimeOnSite * 25, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {source.avgTimeOnSite}m
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            source.bounceRate > 40
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(source.bounceRate, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {source.bounceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(source.conversionRate * 15, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {source.conversionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitor Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Visitor Distribution by Source
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {sources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {source.icon} {source.source}
                  </span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {getPercentage(source.visitors)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getSourceColor(source.source)} rounded-full`}
                    style={{ width: `${getPercentage(source.visitors)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Top Referrers
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sources.map((source) => (
              <div key={source.source} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{source.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {source.source}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {source.topReferrer}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {source.visitors.toLocaleString()} visitors
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
        <p className="text-sm text-purple-800 dark:text-purple-200">
          💡 Click on a traffic source to see detailed performance metrics. Direct traffic represents visitors who typed your URL directly or came from bookmarks.
        </p>
      </div>
    </div>
  );
}
