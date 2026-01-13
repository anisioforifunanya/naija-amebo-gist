import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CelebrityNewsClient from './celebrity-news-client';

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
  { id: '1', title: "Celebrity Red Carpet", description: "Stars shine at awards...", date: "1 hour ago", category: "celebrity-news", status: "approved" as const },
  { id: '2', title: "Celebrity Breakup", description: "Famous couple splits...", date: "2 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '3', title: "Celebrity Wedding", description: "Star-studded event...", date: "3 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '4', title: "Celebrity Interview", description: "Exclusive chat...", date: "4 hours ago", category: "celebrity-news", status: "approved" as const },
  { id: '5', title: "Celebrity Feud", description: "Drama unfolds...", date: "5 hours ago", category: "celebrity-news", status: "approved" as const },
];

export default async function CelebrityNewsPage() {
  let initialNews = defaultNews;

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'celebrity-news'),
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
        category: data.category || 'celebrity-news',
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
    console.error('Celebrity-News: Server-side fetch failed:', error);
  }

  return <CelebrityNewsClient initialNews={initialNews} />;
}
