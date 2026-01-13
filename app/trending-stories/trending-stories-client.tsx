"use client";

import { useState, useEffect } from 'react';
import NewsCard from '../../components/NewsCard';
import NewsCarousel from '../../components/NewsCarousel';
import DashboardButton from '../../components/DashboardButton';
import { StorageSync } from '@/lib/storageSync';
import extendedNews from '@/data/extended-news.json';

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
}

interface TrendingStoriesClientProps {
  initialNews: NewsItem[];
}

export default function TrendingStoriesClient({ initialNews }: TrendingStoriesClientProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);

  useEffect(() => {
    const loadNews = async () => {
      try {
        console.log('Trending-Stories: Loading articles from API...')
        const response = await fetch('/api/articles/get?category=trending-stories&status=approved&t=' + Date.now())
        const apiData = await response.json()
        console.log('Trending-Stories: API returned', apiData.articles?.length, 'articles')
        const apiNews = (apiData.articles || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.excerpt || item.description,
          date: item.date,
          category: item.category,
          status: item.status as 'approved' | 'pending' | 'rejected',
          submittedBy: item.submittedBy,
          hashtags: item.hashtags || [],
          image: item.image,
          video: item.video,
        }))

        const staticNews = (extendedNews as any[])
          .filter((item: any) => item.category === 'trending-stories' && item.status === 'approved')
          .map((item: any) => ({
            id: item.id?.toString() || '',
            title: item.title,
            description: item.excerpt || item.description,
            date: item.date,
            category: item.category,
            status: item.status as 'approved' | 'pending' | 'rejected',
            author: typeof item.author === 'object' ? item.author?.name : item.author,
            hashtags: item.hashtags || [],
            image: item.image,
            video: item.videoUrl,
          }))

        const combined = [...apiNews, ...staticNews, ...initialNews]
        const unique = Array.from(
          new Map(combined.map((item: any) => [item.title, item])).values()
        )
        console.log('Trending-Stories: Setting newsItems to', unique.length, 'items')
        setNewsItems(unique)
      } catch (error) {
        console.error('Error loading trending stories:', error)
        setNewsItems(initialNews)
      }
    };

    loadNews();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'naijaAmeboNews') {
        loadNews();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initialNews]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardButton />
        <h1 className="text-4xl font-bold mb-8">Trending Stories</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        <NewsCarousel items={newsItems} title="Featured Trending Stories" />
      </div>
    </div>
  )
}
