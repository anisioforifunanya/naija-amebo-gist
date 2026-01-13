"use client";

import { useState } from 'react';
import NewsCard from '../../components/NewsCard';
import NewsCarousel from '../../components/NewsCarousel';
import DashboardButton from '../../components/DashboardButton';

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

  // Articles are already fetched server-side, no need to refetch on client

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
