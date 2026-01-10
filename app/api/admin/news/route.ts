import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for news (persists during server runtime)
let serverNews: any[] = []

export async function GET() {
  try {
    // Return both server-stored news and fallback data
    return NextResponse.json({ 
      success: true, 
      news: serverNews,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ success: true, news: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Add new article with server timestamp
    const newArticle = {
      ...body,
      id: body.id || Date.now().toString(),
      serverAddedAt: new Date().toISOString(),
      isServerStored: true,
    }
    
    // Store in memory
    serverNews.push(newArticle)
    
    // Also keep only unique items (by title)
    serverNews = Array.from(
      new Map(serverNews.map((item: any) => [item.title, item])).values()
    )
    
    console.log('[API] News saved. Total:', serverNews.length)
    
    return NextResponse.json({ success: true, news: newArticle })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body
    
    // Update article status
    serverNews = serverNews.map((item: any) =>
      item.id?.toString() === id?.toString() 
        ? { ...item, status }
        : item
    )
    
    console.log('[API] News updated:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }
    
    // Remove article
    serverNews = serverNews.filter((item: any) => item.id?.toString() !== id.toString())
    
    console.log('[API] News deleted:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
