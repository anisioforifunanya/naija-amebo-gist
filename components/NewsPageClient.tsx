'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardButton from './DashboardButton'

interface NewsItem {
  id: number | string
  title: string
  description: string
  category: string
  date: string
  publishedAt?: string
  status: 'approved' | 'pending' | 'rejected'
  image?: string
  submittedBy?: string
  hashtags?: string[]
}

interface NewsPageClientProps {
  articles: NewsItem[]
  category: string
  title: string
  description: string
}

export default function NewsPageClient({
  articles,
  category,
  title,
  description,
}: NewsPageClientProps) {
  const [displayArticles, setDisplayArticles] = useState<NewsItem[]>(articles)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDisplayArticles(articles)
  }, [articles])

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <DashboardButton />

        {/* Page Header */}
        <header className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </header>

        {/* Articles Grid */}
        <div className="space-y-6">
          {displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <article
                key={article.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-800"
              >
                <Link href={`/news/${article.id}`}>
                  <div className="flex flex-col sm:flex-row gap-4 p-6">
                    {/* Image */}
                    {article.image && (
                      <div className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : null}
                        {!article.image && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">📰</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      {/* Category Badge */}
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">
                          {article.category?.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-purple-600 dark:hover:text-purple-400 line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 line-clamp-3">
                        {article.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                        <span>📅 {new Date(article.publishedAt || article.date).toLocaleDateString()}</span>
                        {article.submittedBy && (
                          <span>✍️ By {article.submittedBy}</span>
                        )}
                      </div>

                      {/* Hashtags */}
                      {article.hashtags && article.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {article.hashtags.slice(0, 2).map((tag, idx) => (
                            <a
                              key={idx}
                              href={`/?search=${encodeURIComponent(tag)}`}
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-xs"
                            >
                              {tag}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No articles found in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
