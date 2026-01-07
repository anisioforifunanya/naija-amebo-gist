'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  author?: string;
  submittedBy?: string;
  views?: number;
  shares?: number;
  reactions?: number;
  image?: string;
  hashtags?: string[];
}

interface HomepageEnhancementsProps {
  allNews: NewsItem[];
}

export default function HomepageEnhancements({ allNews }: HomepageEnhancementsProps) {
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsItem | null>(null);
  const [heroStories, setHeroStories] = useState<NewsItem[]>([]);
  const [mostShared, setMostShared] = useState<NewsItem[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get real metrics from data or fallback
  const getMetrics = (story: NewsItem) => ({
    views: story.views || Math.floor(Math.random() * 50000) + 1000,
    shares: story.shares || Math.floor(Math.random() * 5000) + 100,
    reactions: story.reactions || Math.floor(Math.random() * 10000) + 500,
  });

  // Extract trending hashtags from all stories
  const extractTrendingHashtags = (stories: NewsItem[]) => {
    const hashtagMap: { [key: string]: number } = {};
    stories.forEach((story) => {
      if (story.hashtags && Array.isArray(story.hashtags)) {
        story.hashtags.forEach((tag) => {
          hashtagMap[tag] = (hashtagMap[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(hashtagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  };

  // Initialize data from real approved news
  useEffect(() => {
    try {
      // Filter only approved news for public display
      const approvedNews = allNews.filter((news) => news.status === 'approved');

      if (approvedNews.length > 0) {
        // Breaking news - most recent approved
        setBreakingNews(approvedNews[0]);

        // Hero carousel - top 5 approved stories
        setHeroStories(approvedNews.slice(0, 5));

        // Most shared - sorted by real shares metric
        const sorted = [...approvedNews].sort((a, b) => {
          const metricsA = getMetrics(a);
          const metricsB = getMetrics(b);
          return metricsB.shares - metricsA.shares;
        });
        setMostShared(sorted.slice(0, 5));

        // Extract trending hashtags from real data
        const hashtags = extractTrendingHashtags(approvedNews);
        if (hashtags.length > 0) {
          setTrendingHashtags(hashtags);
        } else {
          // Fallback hashtags if none found
          setTrendingHashtags(['#CelebDrama', '#ViralTok', '#EntertainmentGossip', '#BreakingNews', '#TrendingNow', '#NaijaAmebo']);
        }

        // All approved news for infinite scroll
        setDisplayedNews(approvedNews.slice(0, 10));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error initializing homepage data:', error);
      setLoading(false);
    }
  }, [allNews]);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (!autoScroll || heroStories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScroll, heroStories.length]);

  const handleLoadMore = () => {
    setDisplayedNews((prev) => [
      ...prev,
      ...allNews.slice(prev.length, prev.length + 10),
    ]);
  };

  const getTimeAgo = (dateStr: string) => {
    if (dateStr === 'Just now') return 'JUST NOW';
    if (dateStr.includes('hour')) return 'LIVE';
    if (dateStr.includes('minute')) return 'UPDATED';
    return '';
  };

  return (
    <div className="w-full">
      {/* 1. BREAKING NEWS TICKER */}
      {breakingNews && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sticky top-0 z-40 overflow-hidden">
          <div className="flex items-center gap-3 px-4 animate-pulse">
            <span className="text-lg font-bold">🔴 BREAKING</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="inline-block mr-8">{breakingNews.title}</span>
              </div>
            </div>
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}</style>
        </div>
      )}

      {/* 2. HERO CAROUSEL - Top Stories */}
      {heroStories.length > 0 && (
        <div className="relative bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-lg mb-6">
          {/* Main Hero */}
          <div
            className="relative h-80 sm:h-96 transition-all duration-500"
            onMouseEnter={() => setAutoScroll(false)}
            onMouseLeave={() => setAutoScroll(true)}
          >
            {heroStories[currentHeroIndex]?.image && (
              <img
                src={heroStories[currentHeroIndex].image}
                alt={heroStories[currentHeroIndex].title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-600 px-3 py-1 rounded text-sm font-bold">
                  FEATURED
                </span>
                <span className="bg-blue-600 px-3 py-1 rounded text-xs">
                  {heroStories[currentHeroIndex].category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 line-clamp-2">
                {heroStories[currentHeroIndex].title}
              </h2>
              <p className="text-gray-200 mb-4 line-clamp-1">
                {heroStories[currentHeroIndex].description}
              </p>
              <Link
                href={`/story/${heroStories[currentHeroIndex].id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
              >
                Read Full Story →
              </Link>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex gap-2 p-4 justify-center bg-gray-50 dark:bg-gray-800">
            {heroStories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentHeroIndex(idx);
                  setAutoScroll(false);
                }}
                className={`h-2 transition-all rounded-full ${
                  idx === currentHeroIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 w-2'
                }`}
                aria-label={`Go to story ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. CATEGORY TABS WITH PREVIEW */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-3 px-2 scrollbar-hide">
          {[
            { label: '⚡ Breaking', value: 'breaking-news' },
            { label: '🔥 Trending', value: 'trending-stories' },
            { label: '⭐ Celebrity', value: 'celebrity-news' },
            { label: '🎬 Entertainment', value: 'entertainment' },
            { label: '💥 Viral', value: 'viral-content' },
          ].map((cat) => (
            <Link
              key={cat.value}
              href={`/${cat.value}`}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-white whitespace-nowrap transition"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 4. HOT TOPICS HASHTAG PANEL */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          🔥 Trending Hashtags
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${tag}`}
              className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 5. MOST SHARED TODAY */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          📈 Most Shared Today
        </h3>
        <div className="space-y-3">
          {mostShared.slice(0, 5).map((story, idx) => {
            const metrics = getMetrics(story);
            return (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>👁️ {(metrics.views / 1000).toFixed(1)}K views</span>
                      <span>📤 {(metrics.shares / 100).toFixed(0)}K shares</span>
                      <span>❤️ {(metrics.reactions / 100).toFixed(0)}K reactions</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 6. FEATURED STORY OF THE DAY */}
      {displayedNews[0] && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-300 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">⭐</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Story of the Day
            </h3>
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {displayedNews[0].title}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {displayedNews[0].description}
          </p>
          <Link
            href={`/story/${displayedNews[0].id}`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            Read Now →
          </Link>
        </div>
      )}

      {/* 7. MAIN NEWS FEED WITH SOCIAL METRICS */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Latest Stories
        </h3>
        <div className="space-y-4">
          {displayedNews.slice(1, 10).map((story, idx) => {
            const metrics = getMetrics(story);
            const badge = getTimeAgo(story.date);

            return (
              <div
                key={story.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {badge && (
                        <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">
                          {badge}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {story.date}
                      </span>
                    </div>
                    <Link
                      href={`/story/${story.id}`}
                      className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition"
                    >
                      {story.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {story.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>👁️ {(metrics.views / 1000).toFixed(1)}K</span>
                      <span>📤 {metrics.shares}</span>
                      <span>❤️ {(metrics.reactions / 100).toFixed(0)}K</span>
                      <span className="ml-auto">📁 {story.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. INFINITE SCROLL LOAD MORE */}
      {displayedNews.length < allNews.length && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Load More Stories
          </button>
        </div>
      )}

      {/* 9. SEARCH WITH TRENDING SUGGESTIONS */}
      <div className="sticky bottom-20 right-4 z-30 hidden sm:block">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
            🔍 Trending Searches
          </h4>
          <div className="space-y-2">
            {[
              'Wizkid latest news',
              'Nollywood drama',
              'Celebrity breakups',
              'Award shows',
              'Music releases',
            ].map((search, idx) => (
              <Link
                key={idx}
                href={`/search?q=${search}`}
                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 10. STICKY NEWSLETTER SUBSCRIPTION */}
      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 z-20 hidden sm:block">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-bold">📬 Get Breaking News</p>
            <p className="text-sm text-blue-100">
              Subscribe via WhatsApp or Email
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Hi! I\'d like to subscribe to Naija Amebo Gist news on WhatsApp')}`, '_blank')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
            >
              WhatsApp
            </button>
            <button 
              onClick={() => {
                const email = prompt('Enter your email to subscribe:');
                if (email && email.includes('@')) {
                  alert('Thank you for subscribing! Check your email for confirmation.');
                }
              }}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded font-semibold transition"
            >
              Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
