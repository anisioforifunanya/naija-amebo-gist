import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'approved'
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where('status', '==', status),
    ]

    if (category && category !== 'all') {
      constraints.push(where('category', '==', category))
    }

    // Execute query without orderBy (to avoid composite index requirement)
    const q = query(collection(db, 'articles'), ...constraints)
    const querySnapshot = await getDocs(q)

    // Transform documents
    const articles = querySnapshot.docs.map(doc => {
      const data = doc.data()
      const createdAtDate = data.createdAt?.toDate?.() || new Date()
      
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        status: data.status || 'pending',
        image: data.image || '',
        video: data.video || '',
        hashtags: data.hashtags || [],
        submittedBy: data.submittedBy || '',
        submitterEmail: data.submitterEmail || '',
        createdAt: createdAtDate.toISOString(),
        updatedAt: (data.updatedAt?.toDate?.() || createdAtDate).toISOString(),
        date: data.date || createdAtDate.toISOString(),
        excerpt: data.excerpt || data.description?.substring(0, 200) || '',
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
      }
    })

    // Sort by date (newest first) - client-side sorting
    const sorted = articles.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const paginated = sorted.slice(0, pageSize)

    return NextResponse.json({
      articles: paginated,
      total: articles.length,
      pageSize,
    })
  } catch (error) {
    console.error('Articles retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve articles',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
