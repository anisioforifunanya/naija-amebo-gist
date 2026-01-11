'use client'

import { useState, useEffect } from 'react'
import NewsPageClient from '@/components/NewsPageClient'
import extendedNews from '@/data/extended-news.json'

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  publishedAt?: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  author?: string;
  submittedBy?: string;
  hashtags?: string[];
  image?: string;
  video?: string;
  liveVideo?: string;
  liveAudio?: string;
}

export default function BreakingNews() {
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // Load from Firebase
        const response = await fetch('/api/articles/get?category=breaking-news&status=approved')
        const firebaseData = await response.json()
        const firebaseNews = (firebaseData.articles || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.excerpt || item.description,
          date: item.date,
          publishedAt: item.createdAt || item.date,
          category: item.category,
          status: item.status as 'approved' | 'pending' | 'rejected',
          submittedBy: item.submittedBy,
          hashtags: item.hashtags || [],
          image: item.image,
          video: item.videoUrl,
        }))

        // Load static news from extended-news.json
        const staticNews = (extendedNews as any[])
          .filter((item: any) => item.category === 'breaking-news' && item.status === 'approved')
          .map((item: any) => ({
            id: item.id?.toString() || '',
            title: item.title,
            description: item.excerpt || item.description,
            date: item.date,
            publishedAt: item.publishedAt || item.date,
            category: item.category,
            status: item.status as 'approved' | 'pending' | 'rejected',
            author: typeof item.author === 'object' ? item.author?.name : item.author,
            hashtags: item.hashtags || [],
            image: item.image,
            video: item.videoUrl,
          }))

        // Merge both sources and remove duplicates by title
        const allArticles = [...firebaseNews, ...staticNews]
        const uniqueArticles = Array.from(
          new Map(allArticles.map((item) => [item.title, item])).values()
        )

        // Sort by date (newest first)
        const sorted = uniqueArticles.sort((a: any, b: any) => {
          const dateA = new Date(a.publishedAt || a.date).getTime()
          const dateB = new Date(b.publishedAt || b.date).getTime()
          return dateB - dateA
        })

        setArticles(sorted)
      } catch (error) {
        console.error('Error loading articles:', error)
        // Fallback to static news only
        const staticNews = (extendedNews as any[])
          .filter((item: any) => item.category === 'breaking-news' && item.status === 'approved')
          .map((item: any) => ({
            id: item.id?.toString() || '',
            title: item.title,
            description: item.excerpt || item.description,
            date: item.date,
            publishedAt: item.publishedAt || item.date,
            category: item.category,
            status: item.status as 'approved' | 'pending' | 'rejected',
            author: typeof item.author === 'object' ? item.author?.name : item.author,
            hashtags: item.hashtags || [],
            image: item.image,
            video: item.videoUrl,
          }))
        setArticles(staticNews)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading breaking news...</p>
        </div>
      </main>
    )
  }

  return (
    <NewsPageClient 
      articles={articles}
      category="breaking-news"
      title="🚨 Breaking News"
      description="Get the latest breaking news from Nigeria and around the world"
    />
  )
}