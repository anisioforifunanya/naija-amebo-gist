import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const articles = await request.json()

    const savedArticles = []

    for (const article of articles) {
      const firebaseArticle = {
        title: article.title,
        description: article.description,
        excerpt: article.description.substring(0, 200),
        category: article.category,
        status: article.status || 'approved',
        image: article.image || '',
        video: article.video || '',
        date: article.date || new Date().toISOString(),
        submittedBy: article.submittedBy || 'IFUNANYA ANISIOFOR',
        submitterEmail: article.submitterEmail || 'ifunanya.anisiofor@gmail.com',
        hashtags: article.hashtags || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'articles'), firebaseArticle)
      savedArticles.push({
        id: docRef.id,
        ...firebaseArticle,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${savedArticles.length} articles`,
      articles: savedArticles,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
