'use client'

import { useEffect, useState } from 'react'
import HeadlineBanner from '@/components/HeadlineBanner'
import NewsCard from '@/components/NewsCard'
import DashboardButton from '@/components/DashboardButton'
import { StorageSync } from '@/lib/storageSync'
import extendedNews from '@/data/extended-news.json'

export default function GossipPage() {
  const [gossipStories, setGossipStories] = useState<any[]>([])

  useEffect(() => {
    // Force refresh by checking all storage sources
    const loadGossipStories = async () => {
      // Use StorageSync to load from all available sources
      const allNews = await StorageSync.loadNews(extendedNews)
      
      // Filter for gossip category and approved status
      const localGossip = allNews.filter((item: any) => 
        item.category?.toLowerCase() === 'gossip' && item.status?.toLowerCase() === 'approved'
      )
      
      // Remove duplicates and sort by date
      const uniqueGossip = Array.from(
        new Map(localGossip.map((item: any) => [item.title, item])).values()
      ).sort((a: any, b: any) => {
        const dateA = new Date(a.publishedAt || a.date || 0).getTime()
        const dateB = new Date(b.publishedAt || b.date || 0).getTime()
        return dateB - dateA
      })
      
      setGossipStories(uniqueGossip)
    }

    loadGossipStories()
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', loadGossipStories)
    
    // Refresh on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        loadGossipStories()
      }
    })
    
    return () => {
      window.removeEventListener('storage', loadGossipStories)
      document.removeEventListener('visibilitychange', loadGossipStories)
    }
  }, [])

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <DashboardButton />
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            📢 Gossip & Rumors
          </h1>
          <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-bold text-yellow-800 dark:text-yellow-200">⚠️ Important Notice</p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              The stories in this section contain unconfirmed rumors and gossip. Please verify any information
              from official sources before sharing or believing. We do not guarantee the accuracy of these reports.
            </p>
          </div>
        </div>

        {/* Featured Headlines */}
        {gossipStories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Trending Gossip</h2>
            <HeadlineBanner headlines={gossipStories.slice(0, 5)} />
          </div>
        )}

        {/* All Gossip Stories */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Latest Rumors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gossipStories.map((story: any) => (
              <div key={story.id} className="relative">
                {/* Gossip Warning Label */}
                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  GOSSIP
                </div>
                {story.isRumor && (
                  <div className="absolute top-12 right-3 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    UNCONFIRMED
                  </div>
                )}
                <NewsCard item={{ title: story.title, description: story.excerpt, date: story.publishedAt, image: story.image, video: story.videoUrl }} index={story.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
