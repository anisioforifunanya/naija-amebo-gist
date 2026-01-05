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
  { id: '31', title: "New Movie Trailer Released", description: "Fans excited for the upcoming blockbuster...", date: "30 minutes ago", category: "entertainment", status: "approved" as const },
  { id: '32', title: "Award Show Winners Announced", description: "Celebrating the best in entertainment...", date: "1 hour ago", category: "entertainment", status: "approved" as const },
  { id: '33', title: "TV Series Finale", description: "Emotional ending leaves fans in tears...", date: "2 hours ago", category: "entertainment", status: "approved" as const },
  { id: '34', title: "Music Festival Lineup", description: "Major artists confirmed for summer event...", date: "3 hours ago", category: "entertainment", status: "approved" as const },
  { id: '35', title: "Celebrity Interview", description: "Reveals behind-the-scenes secrets...", date: "4 hours ago", category: "entertainment", status: "approved" as const },
  { id: '36', title: "Box Office Records", description: "New film breaks opening weekend records...", date: "5 hours ago", category: "entertainment", status: "approved" as const },
  { id: '37', title: "Streaming Service Original", description: "Critically acclaimed series renewed...", date: "6 hours ago", category: "entertainment", status: "approved" as const },
  { id: '38', title: "Concert Tour Dates", description: "Artist announces world tour...", date: "7 hours ago", category: "entertainment", status: "approved" as const },
  { id: '39', title: "Movie Remake News", description: "Classic film getting modern update...", date: "8 hours ago", category: "entertainment", status: "approved" as const },
  { id: '40', title: "TV Show Cast Change", description: "New actor joins popular series...", date: "9 hours ago", category: "entertainment", status: "approved" as const },
  { id: '41', title: "Music Video Premiere", description: "Stunning visuals accompany new track...", date: "10 hours ago", category: "entertainment", status: "approved" as const },
  { id: '42', title: "Film Festival Winners", description: "Independent films celebrated...", date: "11 hours ago", category: "entertainment", status: "approved" as const },
  { id: '43', title: "Celebrity Podcast", description: "Launches new entertainment show...", date: "12 hours ago", category: "entertainment", status: "approved" as const },
  { id: '44', title: "Theater Production", description: "Broadway show extends run...", date: "13 hours ago", category: "entertainment", status: "approved" as const },
  { id: '45', title: "Music Collaboration", description: "Unexpected duo releases single...", date: "14 hours ago", category: "entertainment", status: "approved" as const },
  { id: '46', title: "Movie Sequel Confirmed", description: "Fans rejoice at announcement...", date: "15 hours ago", category: "entertainment", status: "approved" as const },
  { id: '47', title: "TV Reality Show", description: "New season brings drama...", date: "16 hours ago", category: "entertainment", status: "approved" as const },
  { id: '48', title: "Concert Film Release", description: "Live performance hits theaters...", date: "17 hours ago", category: "entertainment", status: "approved" as const },
  { id: '49', title: "Award Nominations", description: "Industry honors the year's best...", date: "18 hours ago", category: "entertainment", status: "approved" as const },
  { id: '50', title: "Entertainment Merger", description: "Major companies join forces...", date: "19 hours ago", category: "entertainment", status: "approved" as const },
];

export default function Entertainment() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNews);

  useEffect(() => {
    const loadNews = () => {
      const storedNews = localStorage.getItem('naijaAmeboNews');
      if (storedNews) {
        try {
          const parsedNews = JSON.parse(storedNews);
          const entertainmentNews = Array.isArray(parsedNews)
            ? parsedNews.filter((item: NewsItem) => item.category === 'entertainment' && item.status === 'approved')
            : [];
          setNewsItems([...entertainmentNews, ...defaultNews]);
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
        <h1 className="text-4xl font-bold mb-8">Entertainment News</h1>
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