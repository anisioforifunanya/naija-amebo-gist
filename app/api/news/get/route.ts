import { NextRequest, NextResponse } from 'next/server'
import { getAllAutomatedNews } from '@/lib/newsService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')

    let articles = await getAllAutomatedNews(limit)

    // Filter by category if provided
    if (category) {
      articles = articles.filter((a) => a.category === category)
    }

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news', details: String(error) },
      { status: 500 }
    )
  }
}
