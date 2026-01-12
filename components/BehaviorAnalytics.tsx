'use client';

import { useState, useEffect } from 'react';

interface BehaviorEvent {
  type: 'click' | 'scroll' | 'form_submission' | 'form_abandonment' | 'page_view' | 'page_exit';
  label: string;
  count: number;
  icon: string;
  color: string;
}

interface BehaviorMetrics {
  totalClicks: number;
  rageClicks: number;
  scrollEvents: number;
  avgScrollDepth: number;
  formSubmissions: number;
  formAbandonments: number;
  formCompletionRate: number;
  totalPageViews: number;
  avgTimeOnPage: number;
}

export default function BehaviorAnalytics() {
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    totalClicks: 0,
    rageClicks: 0,
    scrollEvents: 0,
    avgScrollDepth: 0,
    formSubmissions: 0,
    formAbandonments: 0,
    formCompletionRate: 0,
    totalPageViews: 0,
    avgTimeOnPage: 0,
  });

  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [mostClickedElements, setMostClickedElements] = useState<
    Array<{ element: string; count: number }>
  >([]);
  const [scrollDepthChart, setScrollDepthChart] = useState<
    Array<{ percentage: number; count: number }>
  >([]);

  useEffect(() => {
    loadBehaviorData();
  }, []);

  const loadBehaviorData = () => {
    // Load metrics
    const mockMetrics: BehaviorMetrics = {
      totalClicks: 8940,
      rageClicks: 127,
      scrollEvents: 12340,
      avgScrollDepth: 62.5,
      formSubmissions: 245,
      formAbandonments: 89,
      formCompletionRate: 73.4,
      totalPageViews: 5230,
      avgTimeOnPage: 2.8,
    };
    setMetrics(mockMetrics);

    // Load behavior events
    const mockEvents: BehaviorEvent[] = [
      {
        type: 'click',
        label: 'Button Clicks',
        count: 8940,
        icon: '🖱️',
        color: 'bg-blue-500',
      },
      {
        type: 'scroll',
        label: 'Scroll Events',
        count: 12340,
        icon: '📜',
        color: 'bg-green-500',
      },
      {
        type: 'form_submission',
        label: 'Form Submissions',
        count: 245,
        icon: '✅',
        color: 'bg-emerald-500',
      },
      {
        type: 'form_abandonment',
        label: 'Form Abandonments',
        count: 89,
        icon: '⚠️',
        color: 'bg-red-500',
      },
      {
        type: 'page_view',
        label: 'Page Views',
        count: 5230,
        icon: '📄',
        color: 'bg-purple-500',
      },
      {
        type: 'page_exit',
        label: 'Page Exits',
        count: 4850,
        icon: '👋',
        color: 'bg-gray-500',
      },
    ];
    setEvents(mockEvents);

    // Load most clicked elements
    const mockClickedElements = [
      { element: 'CTA Button (Primary)', count: 2340 },
      { element: 'Navigation Menu', count: 1890 },
      { element: 'Search Bar', count: 1650 },
      { element: 'Social Share Button', count: 1240 },
      { element: 'Subscribe Button', count: 980 },
      { element: 'Product Card', count: 870 },
      { element: 'Footer Link', count: 520 },
    ];
    setMostClickedElements(mockClickedElements);

    // Load scroll depth
    const mockScrollDepth = [
      { percentage: 25, count: 1850 },
      { percentage: 50, count: 3420 },
      { percentage: 75, count: 5680 },
      { percentage: 100, count: 2340 },
    ];
    setScrollDepthChart(mockScrollDepth);
  };

  const getMaxClickCount = () => {
    return Math.max(...mostClickedElements.map((e) => e.count));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🎯 Behavior Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          User interactions and engagement metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {metrics.totalClicks.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {metrics.rageClicks > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                🔴 {metrics.rageClicks} rage clicks
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Scroll Depth</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
            {metrics.avgScrollDepth}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
            {metrics.scrollEvents.toLocaleString()} scroll events
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Form Completion
          </p>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.formCompletionRate}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
            {metrics.formSubmissions} of {metrics.formSubmissions + metrics.formAbandonments} forms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg Time on Page
          </p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {metrics.avgTimeOnPage}m
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
            {metrics.totalPageViews.toLocaleString()} page views
          </p>
        </div>
      </div>

      {/* Behavior Events */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Behavior Event Summary
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {events.map((event) => (
            <div key={event.type}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{event.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {event.count.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${event.color} rounded-full`}
                  style={{
                    width: `${(event.count / Math.max(...events.map((e) => e.count))) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Clicked Elements & Scroll Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Clicked Elements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Most Clicked Elements
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mostClickedElements.map((element, idx) => (
              <div key={element.element} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {element.element}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {element.count.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(element.count / getMaxClickCount()) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Depth Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Scroll Depth Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {scrollDepthChart.map((depth) => (
                <div key={depth.percentage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {depth.percentage}% scrolled
                    </span>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {depth.count.toLocaleString()} users
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        depth.percentage === 100
                          ? 'bg-green-500'
                          : depth.percentage >= 75
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${(depth.count / Math.max(...scrollDepthChart.map((d) => d.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Depth Insights */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3">
                INSIGHTS
              </p>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {((scrollDepthChart[3].count / (scrollDepthChart[0].count + scrollDepthChart[1].count + scrollDepthChart[2].count + scrollDepthChart[3].count)) * 100).toFixed(1)}% of users scroll to bottom
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  {((scrollDepthChart[2].count / (scrollDepthChart[0].count + scrollDepthChart[1].count + scrollDepthChart[2].count + scrollDepthChart[3].count)) * 100).toFixed(1)}% reach 75% of content
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-2">
            SUBMISSIONS
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.formSubmissions}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-2">
            ABANDONMENTS
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.formAbandonments}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-2">
            COMPLETION RATE
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.formCompletionRate}%
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          💡 Rage clicks (rapid clicks on same element) indicate frustration. Scroll depth shows content engagement. Form abandonment rate helps identify UX issues.
        </p>
      </div>
    </div>
  );
}
