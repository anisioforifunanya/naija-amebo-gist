import axios from 'axios'
import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY || process.env.NEWSAPI_KEY
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: string
  author?: string
  category: string
  country?: string
  createdAt?: any
  id?: string
}

// Fetch from NewsAPI
export async function fetchFromNewsAPI(): Promise<NewsArticle[]> {
  try {
    if (!NEWSAPI_KEY) {
      console.warn('NEWSAPI_KEY not configured')
      return []
    }

    const articles: NewsArticle[] = []

    // Fetch Nigerian news
    const nigeriaNigeria = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Nigeria news',
        sortBy: 'publishedAt',
        language: 'en',
        apiKey: NEWSAPI_KEY,
        pageSize: 20,
      },
    })

    nigeriaNigeria.data.articles.forEach((article: any) => {
      articles.push({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author,
        category: 'Nigerian News',
        country: 'Nigeria',
      })
    })

    // Fetch world news
    const worldNews = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'general',
        sortBy: 'publishedAt',
        apiKey: NEWSAPI_KEY,
        pageSize: 20,
      },
    })

    worldNews.data.articles.forEach((article: any) => {
      articles.push({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author,
        category: 'World News',
        country: article.country || 'International',
      })
    })

    return articles
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error)
    return []
  }
}

// Fetch from Rapid News API
export async function fetchFromRapidAPI(): Promise<NewsArticle[]> {
  try {
    if (!RAPIDAPI_KEY) {
      console.warn('RAPIDAPI_KEY not configured')
      return []
    }

    const response = await axios.get('https://news-api14.p.rapidapi.com/search', {
      params: {
        query: 'Nigeria',
        pageNumber: 1,
        pageSize: 20,
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'news-api14.p.rapidapi.com',
      },
    })

    return response.data.news?.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.link,
      urlToImage: article.image,
      publishedAt: article.published_date || new Date().toISOString(),
      source: article.source || 'Unknown',
      category: 'Nigerian News',
      country: 'Nigeria',
    })) || []
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error)
    return []
  }
}

// Scrape Nigerian news sites
export async function scrapeNigerianNewsSites(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = []

  try {
    // Pulse Nigeria
    const pulseResponse = await axios.get('https://pulse.ng', { timeout: 5000 })
    console.log('Pulse Nigeria fetched')
  } catch (error) {
    console.error('Error scraping Pulse Nigeria:', error)
  }

  return articles
}

// Save articles to Firebase
export async function saveArticlesToFirebase(articles: NewsArticle[]): Promise<void> {
  try {
    const newsCollection = collection(db, 'automated-news')

    for (const article of articles) {
      // Check if article already exists to avoid duplicates
      const q = query(newsCollection, where('url', '==', article.url))
      const existingDocs = await getDocs(q)

      if (existingDocs.empty) {
        await addDoc(newsCollection, {
          ...article,
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        })
      }
    }

    console.log(`Saved ${articles.length} new articles to Firebase`)
  } catch (error) {
    console.error('Error saving articles to Firebase:', error)
  }
}

// Delete expired articles (older than 48 hours)
export async function deleteExpiredArticles(): Promise<void> {
  try {
    const newsCollection = collection(db, 'automated-news')
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const q = query(newsCollection, where('createdAt', '<', fortyEightHoursAgo))
    const docs = await getDocs(q)

    let deletedCount = 0
    docs.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, 'automated-news', docSnapshot.id))
      deletedCount++
    })

    console.log(`Deleted ${deletedCount} expired articles`)
  } catch (error) {
    console.error('Error deleting expired articles:', error)
  }
}

// Main function to fetch and save news from all sources
export async function updateAllNews(): Promise<void> {
  console.log('Starting news update...')

  try {
    // Delete expired articles first
    await deleteExpiredArticles()

    // Fetch from all sources
    const [newsAPIArticles, rapidAPIArticles, nigerianSitesArticles] = await Promise.all([
      fetchFromNewsAPI(),
      fetchFromRapidAPI(),
      scrapeNigerianNewsSites(),
    ])

    // Combine and deduplicate
    const allArticles = [...newsAPIArticles, ...rapidAPIArticles, ...nigerianSitesArticles]
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    )

    // Save to Firebase
    await saveArticlesToFirebase(uniqueArticles)

    console.log(`News update completed. Total articles: ${uniqueArticles.length}`)
  } catch (error) {
    console.error('Error updating news:', error)
  }
}

// Fetch all news from Firebase
export async function getAllAutomatedNews(limit: number = 50): Promise<NewsArticle[]> {
  try {
    const newsCollection = collection(db, 'automated-news')
    const q = query(newsCollection)
    const docs = await getDocs(q)

    const articles: NewsArticle[] = []
    docs.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      articles.push({
        ...data,
        id: docSnapshot.id,
      } as NewsArticle)
    })

    // Sort by published date and limit
    return articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ).slice(0, limit)
  } catch (error) {
    console.error('Error fetching automated news:', error)
    return []
  }
}
