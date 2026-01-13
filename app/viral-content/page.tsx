import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ViralContentClient from './viral-content-client';

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
  { id: '1', title: "Viral Meme", description: "Internet laughs...", date: "1 hour ago", category: "viral-content", status: "approved" as const },
  { id: '2', title: "Viral Video", description: "Millions of views...", date: "2 hours ago", category: "viral-content", status: "approved" as const },
  { id: '3', title: "Trending Challenge", description: "Everyone's doing it...", date: "3 hours ago", category: "viral-content", status: "approved" as const },
  { id: '4', title: "Social Media Sensation", description: "Breaking the internet...", date: "4 hours ago", category: "viral-content", status: "approved" as const },
  { id: '5', title: "Viral Story", description: "Unbelievable tale...", date: "5 hours ago", category: "viral-content", status: "approved" as const },
];

export default async function ViralContentPage() {
  let initialNews = defaultNews;

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'viral-content'),
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
        category: data.category || 'viral-content',
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
    console.error('Viral-Content: Server-side fetch failed:', error);
  }

  return <ViralContentClient initialNews={initialNews} />;
}
