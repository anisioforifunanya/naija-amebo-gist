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

const defaultNews = [
  { id: '71', title: "Trending TikTok Video", description: "Watch this hilarious clip that's blowing up...", date: "1 hour ago", category: "viral-content", status: "approved" as const },
  { id: '72', title: "Instagram Reel Sensation", description: "This dance is taking over the internet...", date: "2 hours ago", category: "viral-content", status: "approved" as const },
  { id: '73', title: "Viral Twitter Thread", description: "Story that everyone is sharing...", date: "3 hours ago", category: "viral-content", status: "approved" as const },
  { id: '74', title: "YouTube Challenge", description: "Millions attempting this trend...", date: "4 hours ago", category: "viral-content", status: "approved" as const },
  { id: '75', title: "Meme Goes Global", description: "Funny image spreads worldwide...", date: "5 hours ago", category: "viral-content", status: "approved" as const },
  { id: '76', title: "Viral Pet Video", description: "Adorable animal steals hearts...", date: "6 hours ago", category: "viral-content", status: "approved" as const },
  { id: '77', title: "Dance Challenge Craze", description: "Everyone learning the moves...", date: "7 hours ago", category: "viral-content", status: "approved" as const },
  { id: '78', title: "Viral Cooking Hack", description: "Kitchen tip goes viral...", date: "8 hours ago", category: "viral-content", status: "approved" as const },
  { id: '79', title: "Social Media Prank", description: "Funny stunt gets millions of views...", date: "9 hours ago", category: "viral-content", status: "approved" as const },
  { id: '80', title: "Viral Fashion Trend", description: "Outfit inspiration spreads online...", date: "10 hours ago", category: "viral-content", status: "approved" as const },
  { id: '81', title: "Comedy Sketch", description: "Hilarious video breaks records...", date: "11 hours ago", category: "viral-content", status: "approved" as const },
  { id: '82', title: "Viral Art Creation", description: "Creative work inspires thousands...", date: "12 hours ago", category: "viral-content", status: "approved" as const },
  { id: '83', title: "Music Remix", description: "Original song gets viral treatment...", date: "13 hours ago", category: "viral-content", status: "approved" as const },
  { id: '84', title: "Viral Life Hack", description: "Useful tip everyone needs...", date: "14 hours ago", category: "viral-content", status: "approved" as const },
  { id: '85', title: "Funny Fail Video", description: "Epic moment captured on camera...", date: "15 hours ago", category: "viral-content", status: "approved" as const },
  { id: '86', title: "Viral Beauty Tutorial", description: "Makeup look goes viral...", date: "16 hours ago", category: "viral-content", status: "approved" as const },
  { id: '87', title: "Animal Rescue Story", description: "Heartwarming video touches millions...", date: "17 hours ago", category: "viral-content", status: "approved" as const },
  { id: '88', title: "Viral Science Experiment", description: "Amazing reaction goes viral...", date: "18 hours ago", category: "viral-content", status: "approved" as const },
  { id: '89', title: "Comedy Roast", description: "Hilarious takedown gets shared...", date: "19 hours ago", category: "viral-content", status: "approved" as const },
  { id: '90', title: "Viral Sports Moment", description: "Incredible play captured perfectly...", date: "20 hours ago", category: "viral-content", status: "approved" as const },
];

export default function ViralContent() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNews);

  useEffect(() => {
    const loadNews = async () => {
      const allNews = await StorageSync.loadNews(extendedNews);
      const viralNews = allNews.filter((item: NewsItem) => item.category === 'viral-content' && item.status === 'approved');
      
      const combined = [...viralNews, ...defaultNews];
      const unique = Array.from(
        new Map(combined.map((item: any) => [item.title, item])).values()
      );
      setNewsItems(unique);
    };

    loadNews();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'naijaAmeboNews') {
        loadNews();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <DashboardButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Viral Content</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* News Carousel */}
        <NewsCarousel items={newsItems} title="Featured Viral Content" />
      </div>
    </div>
  )
}