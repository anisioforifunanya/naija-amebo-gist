import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import TrendingStoriesClient from './trending-stories-client';

// Revalidate every 60 seconds to show fresh data
export const revalidate = 60;

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

const defaultNews: NewsItem[] = [
  { id: '1', title: "Trending Today", description: "What's hot...", date: "1 hour ago", category: "trending-stories", status: "approved" as const },
  { id: '2', title: "Breaking News", description: "Latest updates...", date: "2 hours ago", category: "trending-stories", status: "approved" as const },
  { id: '3', title: "Top Stories", description: "Most read...", date: "3 hours ago", category: "trending-stories", status: "approved" as const },
];

export default async function TrendingStoriesPage() {
  let initialNews = defaultNews;

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'trending-stories'),
      where('status', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);
    
    const fbNews: NewsItem[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.excerpt || data.description || '',
        date: data.date || new Date().toISOString(),
        category: data.category || 'trending-stories',
        status: data.status || 'pending',
        author: data.submittedBy || '',
        hashtags: data.hashtags || [],
        image: data.image || '',
        video: data.video || '',
      };
    });

    if (fbNews.length > 0) {
      initialNews = fbNews;
    }
  } catch (error) {
    console.error('Trending-Stories: Server-side fetch failed:', error);
  }

  return <TrendingStoriesClient initialNews={initialNews} />;
}
