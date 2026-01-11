import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { articleId, status } = await request.json()

    if (!articleId || !status) {
      return NextResponse.json(
        { error: 'Missing articleId or status' },
        { status: 400 }
      )
    }

    await updateDoc(doc(db, 'articles', articleId), { status })

    return NextResponse.json({
      success: true,
      message: `Article status updated to ${status}`
    })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update article status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
