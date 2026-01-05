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
  { id: '11', title: "Actor Lands Major Role", description: "Exciting new project announced...", date: "1 hour ago", category: "celebrity-news", status: "approved" as const },
  { id: '12', title: "Musician Releases New Album", description: "Fans eagerly awaiting the tracks...", date: "2 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '13', title: "Celebrity Couple's Romance", description: "New photos surface online...", date: "3 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '14', title: "Award-Winning Performance", description: "Critics praise the latest role...", date: "4 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '15', title: "Celebrity's Charity Work", description: "Donates to local community...", date: "5 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '16', title: "Movie Star's Comeback", description: "Returns to screens after hiatus...", date: "6 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '17', title: "Singer's World Tour", description: "Announces dates for next year...", date: "7 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '18', title: "Celebrity's Fashion Line", description: "New collection hits stores...", date: "8 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '19', title: "Actor's Directorial Debut", description: "First film as director released...", date: "9 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '20', title: "Musician's Collaboration", description: "Teams up with popular artist...", date: "10 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '21', title: "Celebrity's Health Update", description: "Shares recovery journey...", date: "11 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '22', title: "Award Show Appearance", description: "Stuns in red carpet look...", date: "12 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '23', title: "Celebrity's New Business", description: "Launches successful venture...", date: "13 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '24', title: "Singer's Hit Single", description: "Breaks streaming records...", date: "14 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '25', title: "Actor's Memoir Release", description: "Book becomes bestseller...", date: "15 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '26', title: "Celebrity's Social Media", description: "Posts inspiring message...", date: "16 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '27', title: "Movie Premiere Event", description: "Stars attend glamorous event...", date: "17 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '28', title: "Musician's Album Tour", description: "Fans line up for tickets...", date: "18 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '29', title: "Celebrity's Family News", description: "Welcomes new addition...", date: "19 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '30', title: "Actor's Next Project", description: "Teases upcoming film...", date: "20 hours ago", category: "celebrity-news", status: "approved" as const },
];

export default function CelebrityNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNews);

  useEffect(() => {
    const loadNews = () => {
      const storedNews = localStorage.getItem('naijaAmeboNews');
      if (storedNews) {
        try {
          const parsedNews = JSON.parse(storedNews);
          const celebrityNews = Array.isArray(parsedNews)
            ? parsedNews.filter((item: NewsItem) => item.category === 'celebrity-news' && item.status === 'approved')
            : [];
          setNewsItems([...celebrityNews, ...defaultNews]);
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
        <h1 className="text-4xl font-bold mb-8">Celebrity News</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* News Carousel */}
        <NewsCarousel items={newsItems} title="Featured Celebrity News" />
      </div>
    </div>
  )
}