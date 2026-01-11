import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Create article document
    const articleData = {
      title: body.title,
      description: body.description,
      category: body.category || 'breaking-news',
      date: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
      status: 'pending',
      submittedBy: body.submitterName || 'Anonymous',
      submitterEmail: body.submitterEmail,
      hashtags: body.hashtags || [],
      socialCaption: body.socialCaption || '',
      image: body.image || '',
      video: body.video || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isServerStored: true,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      excerpt: body.description.substring(0, 150),
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'articles'), articleData)

    return NextResponse.json({
      id: docRef.id,
      ...articleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Article creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
