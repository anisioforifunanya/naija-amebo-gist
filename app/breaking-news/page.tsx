import { Metadata } from 'next'
import NewsPageClient from '@/components/NewsPageClient'
import extendedNews from '@/data/extended-news.json'

export const metadata: Metadata = {
  title: 'Breaking News | Latest Updates | Naija Amebo Gist',
  description: 'Latest breaking news and updates from Nigeria. Stay informed with real-time celebrity news, entertainment updates, and trending stories on Naija Amebo Gist.',
  keywords: [
    'breaking news',
    'latest news',
    'Nigeria news',
    'celebrity news',
    'entertainment news',
    'Naija news',
    'breaking news Nigeria',
    'latest updates',
    'trending now',
  ],
  openGraph: {
    type: 'website',
    url: 'https://amebo.org/breaking-news',
    title: 'Breaking News | Naija Amebo Gist',
    description: 'Latest breaking news and updates from Nigeria.',
    images: [
      {
        url: 'https://amebo.org/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Naija Amebo Gist - Breaking News',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breaking News | Naija Amebo Gist',
    description: 'Latest breaking news and updates from Nigeria.',
    images: ['https://amebo.org/og-image.jpg'],
  },
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  author?: string;
  hashtags?: string[];
  image?: string;
  video?: string;
  liveVideo?: string;
  liveAudio?: string;
}

export default function BreakingNews() {
  const breakingNewsArticles = (extendedNews as any[])
    .filter((item: any) => item.category === 'breaking-news' && item.status === 'approved')
    .sort((a: any, b: any) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime())

  return (
    <NewsPageClient 
      articles={breakingNewsArticles}
      category="breaking-news"
      title="🚨 Breaking News"
      description="Get the latest breaking news from Nigeria and around the world"
    />
  )
}