"use client";

import { useState, useEffect } from 'react';
import NewsCard from '../../components/NewsCard';
import NewsCarousel from '../../components/NewsCarousel';

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
  { id: '51', title: "Viral Dance Challenge Takes Over", description: "Millions participating worldwide...", date: "1 hour ago", category: "trending-stories", status: "approved" as const },
  { id: '52', title: "Celebrity Hashtag Trend", description: "Social media explodes with new challenge...", date: "2 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '53', title: "Music Video Breaks Records", description: "Most viewed in 24 hours...", date: "3 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '54', title: "Influencer's Live Stream", description: "Record-breaking viewer count...", date: "4 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '55', title: "Celebrity's Viral Outfit", description: "Fans recreate the look...", date: "5 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '56', title: "TikTok Star's New Trend", description: "Spreading across platforms...", date: "6 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '57', title: "Movie Trailer Goes Viral", description: "Breaking streaming records...", date: "7 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '58', title: "Celebrity's Funny Moment", description: "Clips shared millions of times...", date: "8 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '59', title: "Social Media Challenge", description: "Everyone is joining in...", date: "9 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '60', title: "Viral Pet Video", description: "Celebrity's pet steals the show...", date: "10 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '61', title: "Dance Routine Craze", description: "From TikTok to Instagram...", date: "11 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '62', title: "Celebrity's Viral Tweet", description: "Thread goes viral instantly...", date: "12 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '63', title: "Music Remix Trend", description: "Artists jumping on the bandwagon...", date: "13 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '64', title: "Viral Cooking Video", description: "Celebrity chef's recipe explodes...", date: "14 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '65', title: "Challenge for Charity", description: "Viral campaign raises funds...", date: "15 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '66', title: "Celebrity's Dance Fail", description: "Funny moment goes viral...", date: "16 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '67', title: "Viral Art Creation", description: "Artist's work spreads online...", date: "17 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '68', title: "Social Media Filter", description: "Everyone trying the new effect...", date: "18 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '69', title: "Celebrity's Viral Song", description: "Old track gains new popularity...", date: "19 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '70', title: "Viral Fashion Trend", description: "Celebrity's style influences masses...", date: "20 hours ago", category: "trending-stories", status: "approved" as const },
];

export default function TrendingStories() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNews);

  useEffect(() => {
    const loadNews = () => {
      const storedNews = localStorage.getItem('naijaAmeboNews');
      if (storedNews) {
        try {
          const parsedNews = JSON.parse(storedNews);
          // Filter news by category and status
          const trendingNews = Array.isArray(parsedNews) 
            ? parsedNews.filter((item: NewsItem) => item.category === 'trending-stories' && item.status === 'approved')
            : [];
          setNewsItems([...trendingNews, ...defaultNews]);
        } catch (error) {
          console.error('Error loading news from localStorage:', error);
          setNewsItems(defaultNews);
        }
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Trending Stories</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* News Carousel */}
        <NewsCarousel items={newsItems} title="Featured Trending Stories" />
      </div>
    </div>
  )
}