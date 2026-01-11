import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'Missing userId or status' },
        { status: 400 }
      )
    }

    if (!['online', 'offline'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "online" or "offline"' },
        { status: 400 }
      )
    }

    // Update user presence in Firestore
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      status: status,
      lastSeen: serverTimestamp(),
      lastStatusChange: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Presence update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update presence',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const data = userDoc.data()
    const lastSeen = data.lastSeen?.toDate?.() || null
    const isOnline = data.status === 'online'

    return NextResponse.json({
      userId,
      status: data.status || 'offline',
      isOnline,
      lastSeen: lastSeen?.toISOString() || null,
      lastStatusChange: data.lastStatusChange?.toDate?.().toISOString() || null
    })
  } catch (error) {
    console.error('Presence retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve presence',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
