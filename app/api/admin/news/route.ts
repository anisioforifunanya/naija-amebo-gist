import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// In-memory storage for news (persists during server runtime)
let serverNews: any[] = []

// Load news from extended-news.json on startup
async function loadNewsFromFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'extended-news.json')
    const data = await fs.readFile(filePath, 'utf-8')
    serverNews = JSON.parse(data)
    console.log('[API] Loaded', serverNews.length, 'news items from extended-news.json')
  } catch (error) {
    console.log('[API] Could not load extended-news.json, starting with empty array:', error)
    serverNews = []
  }
}

// Save news to extended-news.json for persistence
async function saveNewsToFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'extended-news.json')
    await fs.writeFile(filePath, JSON.stringify(serverNews, null, 2), 'utf-8')
    console.log('[API] Saved news to extended-news.json')
  } catch (error) {
    console.error('[API] Error saving to extended-news.json:', error)
  }
}

// Initialize on first request
let initialized = false
async function ensureInitialized() {
  if (!initialized) {
    await loadNewsFromFile()
    initialized = true
  }
}

export async function GET() {
  try {
    await ensureInitialized()
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
    await ensureInitialized()
    const body = await request.json()
    
    // Add new article with server timestamp
    const newArticle = {
      ...body,
      id: body.id || Date.now(),
      serverAddedAt: new Date().toISOString(),
      isServerStored: true,
    }
    
    // Store in memory
    serverNews.push(newArticle)
    
    // Also keep only unique items (by title)
    serverNews = Array.from(
      new Map(serverNews.map((item: any) => [item.title, item])).values()
    )
    
    // Persist to file so it survives server restarts
    await saveNewsToFile()
    
    console.log('[API] News saved. Total:', serverNews.length)
    
    return NextResponse.json({ success: true, news: newArticle })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureInitialized()
    const body = await request.json()
    const { id, status } = body
    
    // Update article status
    serverNews = serverNews.map((item: any) =>
      item.id?.toString() === id?.toString() 
        ? { ...item, status }
        : item
    )
    
    // Persist to file
    await saveNewsToFile()
    
    console.log('[API] News updated:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureInitialized()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }
    
    // Remove article
    serverNews = serverNews.filter((item: any) => item.id?.toString() !== id.toString())
    
    // Persist to file
    await saveNewsToFile()
    
    console.log('[API] News deleted:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
