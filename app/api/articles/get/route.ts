import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryConstraint } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'approved'
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const startIndex = parseInt(searchParams.get('startIndex') || '0')

    let constraints: QueryConstraint[] = [
      where('status', '==', status),
    ]

    if (category && category !== 'all') {
      constraints.push(where('category', '==', category))
    }

    // Add orderBy and limit after where clauses
    constraints.push(orderBy('createdAt', 'desc'))
    constraints.push(limit(pageSize))

    const q = query(collection(db, 'articles'), ...constraints)
    const querySnapshot = await getDocs(q)

    const articles = querySnapshot.docs.map(doc => {
      const data = doc.data()
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
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        date: data.date || data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        excerpt: data.excerpt || data.description?.substring(0, 200) || '',
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
      }
    })

    return NextResponse.json({
      articles,
      total: querySnapshot.size,
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
