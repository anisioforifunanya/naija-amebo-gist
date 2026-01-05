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
  liveVideo?: string;
  liveAudio?: string;
}

const defaultNews = [
  { id: '1', title: "Celebrity Arrest in Lagos", description: "Breaking details about the high-profile arrest...", date: "1 hour ago", category: "breaking-news", status: "approved" as const },
  { id: '2', title: "Major Movie Deal Announced", description: "Hollywood star signs multi-million dollar contract...", date: "2 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '3', title: "Singer's New Album Release", description: "Fans excited for the upcoming tracks...", date: "3 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '4', title: "Actress Wins Award", description: "Celebrating her latest achievement...", date: "4 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '5', title: "Influencer Scandal Exposed", description: "Social media reacts to the controversy...", date: "5 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '6', title: "Musician's Tour Dates", description: "Announcing the concert schedule...", date: "6 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '7', title: "Celebrity Couple Split", description: "Details of the breakup emerge...", date: "7 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '8', title: "New TV Show Premiere", description: "First look at the upcoming series...", date: "8 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '9', title: "Athlete's Record Breaking", description: "Sports star achieves new milestone...", date: "9 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '10', title: "Fashion Icon's Collection", description: "Latest runway show highlights...", date: "10 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '11', title: "Music Video Release", description: "Behind the scenes of the new clip...", date: "11 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '12', title: "Celebrity Health Update", description: "Well-wishes pour in for recovery...", date: "12 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '13', title: "Award Show Winners", description: "Complete list of this year's winners...", date: "13 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '14', title: "Influencer's Brand Deal", description: "New partnership announced...", date: "14 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '15', title: "Movie Sequel Confirmed", description: "Fans rejoice at the news...", date: "15 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '16', title: "Singer's Collaboration", description: "Teaming up with major artist...", date: "16 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '17', title: "Celebrity's Charity Work", description: "Supporting important causes...", date: "17 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '18', title: "TV Star's New Role", description: "Exciting casting announcement...", date: "18 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '19', title: "Music Festival Lineup", description: "Stars confirmed for the event...", date: "19 hours ago", category: "breaking-news", status: "approved" as const },
  { id: '20', title: "Celebrity's Social Media Post", description: "Viral moment captures attention...", date: "20 hours ago", category: "breaking-news", status: "approved" as const },
];

export default function BreakingNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNews);

  useEffect(() => {
    const loadNews = () => {
      const storedNews = localStorage.getItem('naijaAmeboNews');
      if (storedNews) {
        try {
          const parsedNews = JSON.parse(storedNews);
          const breakingNews = Array.isArray(parsedNews)
            ? parsedNews.filter((item: NewsItem) => item.category === 'breaking-news' && item.status === 'approved')
            : [];
          setNewsItems([...breakingNews, ...defaultNews]);
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
        <h1 className="text-4xl font-bold mb-8">Breaking News</h1>
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* News Carousel */}
        <NewsCarousel items={newsItems} title="Featured Breaking News" />
      </div>
    </div>
  )
}