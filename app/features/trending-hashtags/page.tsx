'use client'
import Link from 'next/link'
import { useState } from 'react'

const TRENDING_HASHTAGS = [
  { tag: '#AmoebaTea', platform: 'X', volume: 2.3, trend: 'up' },
  { tag: '#CelebDrama', platform: 'Instagram', volume: 1.9, trend: 'up' },
  { tag: '#NaijaGossip', platform: 'TikTok', volume: 3.1, trend: 'up' },
  { tag: '#ShowbizNews', platform: 'X', volume: 1.5, trend: 'down' },
  { tag: '#EntertainmentGossip', platform: 'Instagram', volume: 2.8, trend: 'up' },
  { tag: '#WhoDidIt', platform: 'TikTok', volume: 2.1, trend: 'stable' },
]

export default function TrendingHashtags() {
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const platforms = ['All', 'X', 'Instagram', 'TikTok']

  const filtered = selectedPlatform === 'All' 
    ? TRENDING_HASHTAGS 
    : TRENDING_HASHTAGS.filter(h => h.platform === selectedPlatform)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/features" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-6 inline-flex items-center">
          ← Back to Features
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">#️⃣ Trending Hashtags Tracker</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Real-time trending hashtags across X, TikTok, and Instagram with volume metrics.
        </p>

        {/* Platform Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                selectedPlatform === platform
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-purple-600'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Hashtags Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">{item.tag}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.platform}</p>
                </div>
                <span className={`text-2xl ${item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}`}></span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Search Volume</label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.volume}M</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.volume / 3.1) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              'Real-time hashtag tracking',
              'Multi-platform coverage',
              'Search volume metrics',
              'Trend direction indicators',
              'Popular hashtag rankings',
              'Custom hashtag monitoring'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
