'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardButton from '@/components/DashboardButton'
import extendedNews from '@/data/extended-news.json'

interface NewsItem {
  id: string | number
  title: string
  description: string
  content?: string
  excerpt?: string
  date: string
  publishedAt?: string
  category: string
  status: 'approved' | 'pending' | 'rejected'
  image?: string
  video?: string
  author?: string
  submittedBy?: string
  hashtags?: string[]
  views?: number
  likes?: number
  comments?: number
  shares?: number
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<NewsItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const loadArticle = () => {
      // Try to load from localStorage first (user submissions)
      const savedNews = localStorage.getItem('naijaAmeboNews')
      if (savedNews) {
        try {
          const newsArray = JSON.parse(savedNews)
          const found = newsArray.find((item: any) => item.id?.toString() === params.id)
          if (found) {
            setArticle({
              id: found.id,
              title: found.title,
              description: found.description || '',
              content: found.description || '',
              date: found.date,
              publishedAt: found.serverAddedAt || found.date,
              category: found.category,
              status: found.status || 'approved',
              image: found.image,
              video: found.video,
              submittedBy: found.submittedBy,
              hashtags: found.hashtags || [],
              views: found.views || 0,
              likes: found.likes || 0,
              comments: found.comments || 0,
              shares: found.shares || 0,
            })
            setLikes(found.likes || 0)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing saved news:', error)
        }
      }

      // If not found in localStorage, check extended-news.json
      const found = (extendedNews as any[]).find((item: any) => item.id?.toString() === params.id || item.slug === params.id)
      if (found) {
        setArticle({
          id: found.id?.toString() || '',
          title: found.title,
          description: found.description || found.excerpt || '',
          content: found.description || found.excerpt || '',
          date: found.date,
          publishedAt: found.publishedAt,
          category: found.category,
          status: found.status,
          image: found.image,
          video: found.videoUrl,
          author: typeof found.author === 'object' ? found.author?.name : found.author,
          hashtags: found.hashtags || found.tags || [],
          views: found.views || 0,
          likes: found.likes || 0,
          comments: found.comments || 0,
          shares: found.shares || 0,
        })
        setLikes(found.likes || 0)
      } else {
        setNotFound(true)
      }
      setIsLoading(false)
    }

    loadArticle()
  }, [params.id])

  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1)
      setLiked(true)
    } else {
      setLikes(likes - 1)
      setLiked(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </main>
    )
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Article not found</p>
          <Link href="/breaking-news" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition">
            Back to Breaking News
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <DashboardButton />

        {/* Back Link */}
        <Link href={`/${article.category}`} className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold mb-6 inline-block">
          ← Back to {article.category.replace('-', ' ')}
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">
              {article.category.replace('-', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 text-sm">
            <span>📅 {new Date(article.publishedAt || article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {article.author && <span>✍️ By {article.author}</span>}
            {article.submittedBy && <span>✍️ By {article.submittedBy}</span>}
            {article.views && <span>👁️ {article.views.toLocaleString()} views</span>}
          </div>
        </header>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {article.content || article.description}
          </div>
        </article>

        {/* Video if available */}
        {article.video && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Watch Video</h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
              <iframe
                width="100%"
                height="100%"
                src={article.video.includes('youtube.com') ? article.video.replace('watch?v=', 'embed/') : article.video}
                title={article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Engagement Section */}
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-8">
          <div className="flex flex-wrap gap-4 sm:gap-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 font-semibold transition-colors ${
                liked
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              {liked ? '❤️' : '🤍'} {likes} Likes
            </button>
            <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-400">
              💬 {article.comments || 0} Comments
            </div>
            <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-400">
              📤 {article.shares || 0} Shares
            </div>
          </div>
        </div>

        {/* Hashtags */}
        {article.hashtags && article.hashtags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {article.hashtags.map((tag, idx) => (
                <a
                  key={idx}
                  href={`/?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Read More</h2>
          <Link
            href={`/${article.category}`}
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
          >
            More {article.category.replace('-', ' ')} →
          </Link>
        </div>
      </div>
    </main>
  )
}
