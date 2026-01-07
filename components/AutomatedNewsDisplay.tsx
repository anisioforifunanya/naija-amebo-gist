'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface NewsArticle {
  id?: string
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: string
  category: string
  country?: string
}

interface AutomatedNewsDisplayProps {
  limit?: number
  category?: string
  title?: string
}

export default function AutomatedNewsDisplay({
  limit = 10,
  category,
  title = '📰 Latest News',
}: AutomatedNewsDisplayProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          limit: limit.toString(),
          ...(category && { category }),
        })

        const response = await fetch(`/api/news/get?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        setArticles(data.articles || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError('Failed to load news. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()

    // Refresh news every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limit, category])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No news available at the moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, idx) => (
          <a
            key={article.id || idx}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
          >
            {/* Image */}
            {article.urlToImage && (
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {/* Category & Source */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {article.source}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>

              {/* Description */}
              {article.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {article.description}
                </p>
              )}

              {/* Date */}
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
