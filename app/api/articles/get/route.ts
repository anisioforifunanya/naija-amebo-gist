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
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ]

    if (category && category !== 'all') {
      constraints.unshift(where('category', '==', category))
    }

    const q = query(collection(db, 'articles'), ...constraints)
    const querySnapshot = await getDocs(q)

    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
    }))

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
