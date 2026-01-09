import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Use a JSON file in public folder for persistent storage
const newsFilePath = path.join(process.cwd(), 'public', 'admin-news.json')

// Ensure file exists
function ensureNewsFile() {
  try {
    if (!fs.existsSync(newsFilePath)) {
      fs.writeFileSync(newsFilePath, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Error ensuring news file:', error)
  }
}

export async function GET() {
  try {
    ensureNewsFile()
    const data = fs.readFileSync(newsFilePath, 'utf-8')
    const news = JSON.parse(data || '[]')
    return NextResponse.json({ success: true, news })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ success: true, news: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    ensureNewsFile()
    
    // Read existing news
    const data = fs.readFileSync(newsFilePath, 'utf-8')
    const news = JSON.parse(data || '[]')
    
    // Add new article
    const newArticle = {
      ...body,
      id: body.id || Date.now().toString(),
      serverAddedAt: new Date().toISOString(),
    }
    
    news.push(newArticle)
    
    // Write back to file
    fs.writeFileSync(newsFilePath, JSON.stringify(news, null, 2))
    
    return NextResponse.json({ success: true, news: newArticle })
  } catch (error) {
    console.error('POST error:', error)
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
    
    ensureNewsFile()
    const data = fs.readFileSync(newsFilePath, 'utf-8')
    let news = JSON.parse(data || '[]')
    
    // Remove article
    news = news.filter((item: any) => item.id?.toString() !== id.toString())
    
    fs.writeFileSync(newsFilePath, JSON.stringify(news, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
