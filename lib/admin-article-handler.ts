/**
 * ADMIN ARTICLE HANDLER
 * ======================
 * Pure Firebase + Cloudinary - NO localStorage
 * This replaces all the localStorage.setItem('naijaAmeboNews') calls in admin/page.tsx
 */

'use client'

import { saveArticle, updateArticleStatus, deleteArticle } from '@/lib/firebase-persistence'
import { uploadToCloudinary } from '@/lib/cloudinary-upload'

export interface AdminNewsItem {
  title: string
  description: string
  category: string
  hashtags: string
  socialCaption?: string
  image?: File
  video?: File
  liveVideo?: Blob
  liveAudio?: Blob
}

/**
 * Create new article - saves ONLY to Firebase + Cloudinary
 * NO localStorage involved
 */
export async function createArticleFromAdmin(newsItem: AdminNewsItem): Promise<string> {
  try {
    // Upload images/videos to Cloudinary
    let imageUrl: string | undefined
    let videoUrl: string | undefined

    if (newsItem.image) {
      console.log('[Admin] Uploading image to Cloudinary...')
      imageUrl = await uploadToCloudinary(newsItem.image, 'naija-amebo/articles')
    }

    if (newsItem.video) {
      console.log('[Admin] Uploading video to Cloudinary...')
      videoUrl = await uploadToCloudinary(newsItem.video, 'naija-amebo/videos')
    }

    // Create article object with Cloudinary URLs (not base64!)
    const article = {
      title: newsItem.title,
      description: newsItem.description,
      category: newsItem.category as 'entertainment' | 'celebrity-news' | 'viral-content' | 'trending-stories',
      status: 'approved' as const, // Admin articles are auto-approved
      author: 'Admin',
      date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
      image: imageUrl,
      video: videoUrl,
      hashtags: newsItem.hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
      socialCaption: newsItem.socialCaption
    }

    // Save to Firestore (NOT localStorage!)
    const articleId = await saveArticle(article)
    console.log('[Admin] Article saved to Firebase:', articleId)

    return articleId
  } catch (error) {
    console.error('[Admin] Failed to create article:', error)
    throw error
  }
}

/**
 * Approve article
 */
export async function approveArticle(articleId: string): Promise<void> {
  try {
    await updateArticleStatus(articleId, 'approved')
    console.log('[Admin] Article approved:', articleId)
  } catch (error) {
    console.error('[Admin] Failed to approve article:', error)
    throw error
  }
}

/**
 * Reject article
 */
export async function rejectArticle(articleId: string): Promise<void> {
  try {
    await updateArticleStatus(articleId, 'rejected')
    console.log('[Admin] Article rejected:', articleId)
  } catch (error) {
    console.error('[Admin] Failed to reject article:', error)
    throw error
  }
}

/**
 * Delete article
 */
export async function removeArticle(articleId: string): Promise<void> {
  try {
    await deleteArticle(articleId)
    console.log('[Admin] Article deleted:', articleId)
  } catch (error) {
    console.error('[Admin] Failed to delete article:', error)
    throw error
  }
}

export default {
  createArticleFromAdmin,
  approveArticle,
  rejectArticle,
  removeArticle
}
