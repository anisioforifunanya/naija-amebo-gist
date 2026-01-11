import { useState, useEffect } from 'react'

export interface Article {
  id: string
  title: string
  description: string
  category: string
  date: string
  status: string
  submittedBy: string
  submitterEmail?: string
  image?: string
  video?: string
  hashtags: string[]
  socialCaption?: string
  views: number
  likes: number
  comments: number
  shares: number
  createdAt: string
  updatedAt: string
  excerpt: string
}

export function useArticles(category?: string, status: string = 'approved') {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (category) params.append('category', category)
        params.append('status', status)

        const response = await fetch(`/api/articles/get?${params}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch articles: ${response.statusText}`)
        }

        const data = await response.json()
        setArticles(data.articles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles')
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [category, status])

  return { articles, loading, error }
}

export function useArticle(id: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/articles/${id}`)

        if (!response.ok) {
          throw new Error('Article not found')
        }

        const data = await response.json()
        setArticle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch article')
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  return { article, loading, error }
}

export async function createArticleInFirebase(articleData: {
  title: string
  description: string
  category: string
  submitterName: string
  submitterEmail: string
  image?: string
  video?: string
  hashtags?: string[]
  socialCaption?: string
}) {
  const response = await fetch('/api/articles/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articleData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || 'Failed to create article')
  }

  return response.json()
}
