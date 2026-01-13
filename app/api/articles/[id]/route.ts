import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const docRef = doc(db, 'articles', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const articleData = docSnap.data()

    return NextResponse.json({
      id: docSnap.id,
      ...articleData,
      createdAt: articleData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: articleData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
    })
  } catch (error) {
    console.error('Article retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve article',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const docRef = doc(db, 'articles', id)
    await deleteDoc(docRef)

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
      id
    })
  } catch (error) {
    console.error('Article deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete article',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
