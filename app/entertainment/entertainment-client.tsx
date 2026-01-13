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

interface EntertainmentClientProps {
  initialNews: NewsItem[];
}

export default function EntertainmentClient({ initialNews }: EntertainmentClientProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);

  useEffect(() => {
    const loadNews = async () => {
      try {
        console.log('Entertainment: Loading articles from API...')
        // Fetch from Firebase API with cache bust
        const response = await fetch('/api/articles/get?category=entertainment&status=approved&t=' + Date.now())
        const apiData = await response.json()
        console.log('Entertainment: API returned', apiData.articles?.length, 'articles')
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

        // Load static news from extended-news.json
        const staticNews = (extendedNews as any[])
          .filter((item: any) => item.category === 'entertainment' && item.status === 'approved')
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

        // Merge both sources and remove duplicates
        const combined = [...apiNews, ...staticNews, ...initialNews]
        const unique = Array.from(
          new Map(combined.map((item: any) => [item.title, item])).values()
        )
        console.log('Entertainment: Setting newsItems to', unique.length, 'items')
        setNewsItems(unique)
      } catch (error) {
        console.error('Error loading entertainment news:', error)
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
        <h1 className="text-4xl font-bold mb-8">Entertainment</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* News Carousel */}
        <NewsCarousel items={newsItems} title="Featured Entertainment" />
      </div>
    </div>
  )
}
