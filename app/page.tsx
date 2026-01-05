"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NewsCard from '../components/NewsCard';
import AlternatingLogo from '../components/AlternatingLogo';
import FeaturesWidget from '../components/FeaturesWidget';
import HomepageEnhancements from '../components/HomepageEnhancements';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
}

interface AdminData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
  createdAt?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
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

const defaultNews = {
  'breaking-news': [
    { id: '1', title: "Major Celebrity Scandal", description: "Shocking revelations rock the entertainment world...", date: "Just now", category: "breaking-news", status: "approved" as const },
    { id: '2', title: "Award Show Surprise", description: "Unexpected winner announced last night...", date: "1 hour ago", category: "breaking-news", status: "approved" as const },
    { id: '3', title: "Movie Star Arrest", description: "Actor taken into custody following incident...", date: "2 hours ago", category: "breaking-news", status: "approved" as const },
    { id: '4', title: "Singer's Health Crisis", description: "Artist hospitalized after concert...", date: "3 hours ago", category: "breaking-news", status: "approved" as const },
    { id: '5', title: "Celebrity Divorce Filed", description: "High-profile couple announces separation...", date: "4 hours ago", category: "breaking-news", status: "approved" as const },
  ],
  'trending-stories': [
    { id: '6', title: "Viral Dance Challenge", description: "Millions participating worldwide...", date: "1 hour ago", category: "trending-stories", status: "approved" as const },
    { id: '7', title: "Celebrity Hashtag Trend", description: "Social media explodes with new challenge...", date: "2 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '8', title: "Music Video Breaks Records", description: "Most viewed in 24 hours...", date: "3 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '9', title: "Influencer's Live Stream", description: "Record-breaking viewer count...", date: "4 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '10', title: "Celebrity's Viral Outfit", description: "Fans recreate the look...", date: "5 hours ago", category: "trending-stories", status: "approved" as const },
  ],
  'celebrity-news': [
    { id: '11', title: "Actor Lands Major Role", description: "Exciting new project announced...", date: "1 hour ago", category: "celebrity-news", status: "approved" as const },
    { id: '12', title: "Musician Releases New Album", description: "Fans eagerly awaiting the tracks...", date: "2 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '13', title: "Celebrity Couple's Romance", description: "New photos surface online...", date: "3 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '14', title: "Award-Winning Performance", description: "Critics praise the latest role...", date: "4 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '15', title: "Celebrity's Charity Work", description: "Donates to local community...", date: "5 hours ago", category: "celebrity-news", status: "approved" as const },
  ],
  'entertainment': [
    { id: '16', title: "New Movie Trailer Released", description: "Fans excited for the upcoming blockbuster...", date: "30 minutes ago", category: "entertainment", status: "approved" as const },
    { id: '17', title: "Award Show Winners Announced", description: "Celebrating the best in entertainment...", date: "1 hour ago", category: "entertainment", status: "approved" as const },
    { id: '18', title: "TV Series Finale", description: "Emotional ending leaves fans in tears...", date: "2 hours ago", category: "entertainment", status: "approved" as const },
    { id: '19', title: "Music Festival Lineup", description: "Major artists confirmed for summer event...", date: "3 hours ago", category: "entertainment", status: "approved" as const },
    { id: '20', title: "Celebrity Interview", description: "Reveals behind-the-scenes secrets...", date: "4 hours ago", category: "entertainment", status: "approved" as const },
  ],
  'viral-content': [
    { id: '21', title: "Trending TikTok Video", description: "Watch this hilarious clip that's blowing up...", date: "1 hour ago", category: "viral-content", status: "approved" as const },
    { id: '22', title: "Instagram Reel Sensation", description: "This dance is taking over the internet...", date: "2 hours ago", category: "viral-content", status: "approved" as const },
    { id: '23', title: "Viral Twitter Thread", description: "Story that everyone is sharing...", date: "3 hours ago", category: "viral-content", status: "approved" as const },
    { id: '24', title: "YouTube Challenge", description: "Millions attempting this trend...", date: "4 hours ago", category: "viral-content", status: "approved" as const },
    { id: '25', title: "Meme Goes Global", description: "Funny image spreads worldwide...", date: "5 hours ago", category: "viral-content", status: "approved" as const },
  ],
} as const satisfies Record<string, NewsItem[]>;

export default function Home() {
  const router = useRouter();
  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>(defaultNews);
  const [currentUser, setCurrentUser] = useState<UserData | AdminData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is logged in
    const userSession = localStorage.getItem('naijaAmeboCurrentUser');
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin');
    
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('naijaAmeboCurrentUser');
      }
    } else if (adminSession) {
      try {
        const admin = JSON.parse(adminSession);
        setCurrentUser(admin);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('naijaAmeboCurrentAdmin');
      }
    }
  }, []);

  useEffect(() => {
    // Load news from localStorage
    const loadNews = () => {
      const storedNews = localStorage.getItem('naijaAmeboNews');
      if (storedNews) {
        try {
          const parsedNews = JSON.parse(storedNews);
          // Parse as array and organize by category
          const newsArray = Array.isArray(parsedNews) ? parsedNews : [];
          
          // Create merged news object
          const mergedNews: Record<string, NewsItem[]> = { ...defaultNews };
          
          // Organize news by category
          newsArray.forEach((newsItem: NewsItem) => {
            if (newsItem.status === 'approved' && newsItem.category) {
              if (!mergedNews[newsItem.category]) {
                mergedNews[newsItem.category] = [];
              }
              mergedNews[newsItem.category].unshift(newsItem); // Add to beginning
            }
          });
          
          setNewsData(mergedNews);
        } catch (error) {
          console.error('Error loading news from localStorage:', error);
          setNewsData(defaultNews);
        }
      }
    };

    loadNews();
    
    // Listen for storage changes (when admin approves/rejects news)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'naijaAmeboNews') {
        loadNews();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getNewsForCategory = (category: string, limit: number = 5) => {
    return newsData[category]?.slice(0, limit) || [];
  };

  // Get all approved news combined
  const getAllApprovedNews = () => {
    const allNews = Object.values(newsData).flat();
    return allNews.filter((item) => item.status === 'approved');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <AlternatingLogo className="h-12 sm:h-14 md:h-16 w-auto" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Naija Amebo Gist</h1>
          <p className="text-base sm:text-lg md:text-xl font-bold mb-6 sm:mb-8 px-2">Your ultimate source for celebrity news, entertainment updates, and viral content</p>
          
          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a href="/login" className="bg-white text-purple-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition text-sm sm:text-base md:text-lg">
                👤 Login
              </a>
              <a href="/register" className="bg-white text-purple-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition text-sm sm:text-base md:text-lg">
                ✨ Join Us
              </a>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 flex-wrap">
              <a href="/breaking-news" className="bg-white text-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition text-sm sm:text-base">Breaking News</a>
              <a href="/celebrity-news" className="bg-white text-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition text-sm sm:text-base">Celebrity News</a>
              {currentUser?.role !== 'admin' && (
                <a href="/community" className="bg-yellow-400 text-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-yellow-300 transition text-sm sm:text-base">Community Chat</a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Homepage Enhancements - All Interactive Features */}
      <HomepageEnhancements allNews={getAllApprovedNews()} />

      {/* News Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Breaking News */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Breaking News</h2>
            <a href="/breaking-news" className="text-purple-600 hover:text-purple-800 font-bold">View All →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsForCategory('breaking-news').map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Trending Stories */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Stories</h2>
            <a href="/trending-stories" className="text-purple-600 hover:text-purple-800 font-bold">View All →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsForCategory('trending-stories').map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Celebrity News */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Celebrity News</h2>
            <a href="/celebrity-news" className="text-purple-600 hover:text-purple-800 font-bold">View All →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsForCategory('celebrity-news').map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Entertainment News */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Entertainment News</h2>
            <a href="/entertainment" className="text-purple-600 hover:text-purple-800 font-bold">View All →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsForCategory('entertainment').map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Viral Content */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Viral Content</h2>
            <a href="/viral-content" className="text-purple-600 hover:text-purple-800 font-bold">View All →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewsForCategory('viral-content').map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Features Widget */}
        <FeaturesWidget />

      </div>
    </div>
  )
}
