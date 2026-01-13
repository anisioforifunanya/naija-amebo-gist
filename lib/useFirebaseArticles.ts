/**
 * FIREBASE ARTICLE MANAGER
 * =========================
 * Replaces all localStorage article operations with Firestore
 * This is the SINGLE SOURCE OF TRUTH for article persistence
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import {
  saveArticle,
  getArticlesByCategory,
  updateArticleStatus,
  deleteArticle,
  Article
} from '@/lib/firebase-persistence'

export interface AdminArticleManagerProps {
  onArticlesUpdate?: (articles: Article[]) => void
  onError?: (error: string) => void
}

/**
 * Hook to manage articles exclusively through Firebase
 * Returns all CRUD operations
 */
export function useFirebaseArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all articles from Firebase
  const fetchAllArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const categories = ['entertainment', 'celebrity-news', 'viral-content', 'trending-stories']
      const allArticles: Article[] = []

      for (const category of categories) {
        const approved = await getArticlesByCategory(category, 'approved')
        const pending = await getArticlesByCategory(category, 'pending')
        allArticles.push(...approved, ...pending)
      }

      setArticles(allArticles)
      return allArticles
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch articles'
      setError(errorMsg)
      console.error('[Firebase] Articles fetch error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Create or update article
  const createOrUpdateArticle = useCallback(async (article: Article) => {
    setError(null)
    try {
      // Validate required fields
      if (!article.title || !article.description || !article.category) {
        throw new Error('Missing required fields: title, description, category')
      }

      const id = await saveArticle(article)
      console.log('[Firebase] Article saved:', id)

      // Refresh articles list
      await fetchAllArticles()
      return id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save article'
      setError(errorMsg)
      console.error('[Firebase] Save error:', err)
      throw err
    }
  }, [fetchAllArticles])

  // Update article status
  const changeArticleStatus = useCallback(
    async (articleId: string, newStatus: 'approved' | 'pending' | 'rejected') => {
      setError(null)
      try {
        await updateArticleStatus(articleId, newStatus)
        console.log('[Firebase] Article status updated:', articleId, newStatus)

        // Refresh articles list
        await fetchAllArticles()
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update status'
        setError(errorMsg)
        console.error('[Firebase] Status update error:', err)
        throw err
      }
    },
    [fetchAllArticles]
  )

  // Delete article
  const removeArticle = useCallback(
    async (articleId: string) => {
      setError(null)
      try {
        await deleteArticle(articleId)
        console.log('[Firebase] Article deleted:', articleId)

        // Refresh articles list
        await fetchAllArticles()
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete article'
        setError(errorMsg)
        console.error('[Firebase] Delete error:', err)
        throw err
      }
    },
    [fetchAllArticles]
  )

  // Get articles by category
  const getByCategory = useCallback(async (category: string, status?: string) => {
    setError(null)
    try {
      const result = await getArticlesByCategory(category, status || 'approved')
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch articles'
      setError(errorMsg)
      console.error('[Firebase] Category fetch error:', err)
      return []
    }
  }, [])

  return {
    articles,
    loading,
    error,
    fetchAllArticles,
    createOrUpdateArticle,
    changeArticleStatus,
    removeArticle,
    getByCategory
  }
}

export default useFirebaseArticles
