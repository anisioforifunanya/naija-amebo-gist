import { NextRequest, NextResponse } from 'next/server'
import { updateAllNews } from '@/lib/newsService'

export async function GET(request: NextRequest) {
  try {
    // Verify request is from authorized source (optional security)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.NEWS_UPDATE_TOKEN

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await updateAllNews()
    return NextResponse.json({ success: true, message: 'News updated successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update news', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Also allow POST for manual triggers
  return GET(request)
}
