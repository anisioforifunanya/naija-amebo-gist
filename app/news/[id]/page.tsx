"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NewsCard from '../../../components/NewsCard';

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

// Full news items database
const allNewsItems: Record<string, NewsItem> = {
  '1': { id: '1', title: "Major Celebrity Scandal Rocks Entertainment Industry", description: "In a shocking turn of events, one of Africa's biggest entertainment figures was caught in a major scandal that's sent shockwaves through the entertainment industry. Insiders reveal exclusive details about what went down and how the celebrity is responding. This developing story has sparked heated debates on social media with thousands of fans weighing in on their opinions. Industry experts predict this could significantly impact the celebrity's career trajectory and upcoming projects. Stay tuned as we bring you more updates as this story unfolds.\n\n### What Happened\nAccording to multiple sources close to the situation, the incident occurred at a high-profile industry event where several witnesses were present. The details have been corroborated by multiple reputable news outlets who have conducted independent investigations. Surveillance footage and testimonies from attendees have provided a comprehensive account of the events that transpired.\n\n### Industry Response\nFellow celebrities and industry professionals have been divided in their responses, with some offering support while others have distanced themselves from the celebrity. Major brand partnerships have been reconsidered following the scandal. The celebrity's team has assembled a crisis management group to address the situation and prepare for potential legal proceedings.\n\n### What's Next\nThe celebrity's legal team has announced that they will be cooperating fully with any official investigations. Fans and industry observers are waiting to see how this situation develops and what long-term consequences the celebrity may face. Legal experts are already speculating about potential outcomes and precedents from similar cases.", date: "Just now", category: "breaking-news", status: "approved" as const },
  
  '2': { id: '2', title: "Award Show Delivers Shocking Surprise Winners Announcement", description: "The most prestigious award ceremony of the year took an unexpected turn last night when an underdog nominee walked away with the top prize, beating out heavily favored competitors. The shocking announcement left audiences stunned and sparked widespread conversation across social media. Industry insiders were caught off guard, and critics have already started debating the jury's decision. The winner gave an emotional acceptance speech that had everyone in the venue in tears. This moment has already become one of the most talked-about award show moments in recent memory.\n\n### The Upset\nNo one expected the relatively unknown artist to triumph over established industry titans. The voting process was completely transparent and followed decades-old protocols. Multiple security measures were in place to ensure the integrity of the voting process. When the winner's name was announced, it caused a visible reaction from the audience, with many gasps and looks of surprise.\n\n### The Winner's Reaction\nThe winner took to the stage in a state of shock, barely able to speak through tears of joy. Their acceptance speech was heartfelt and genuine, thanking everyone who believed in them and supported their journey. The speech included references to personal struggles and how this award validates their hard work and dedication to their craft. Many viewers were moved by the authenticity and humility displayed during the acceptance.\n\n### Industry Analysis\nCritics and analysts are divided on whether this was the right decision. Some argue it represents a fresh direction for the awards, while others believe more established nominees should have won. The decision has sparked discussions about diversity, representation, and what makes a worthy award recipient.", date: "1 hour ago", category: "breaking-news", status: "approved" as const },
  
  '6': { id: '6', title: "Viral Dance Challenge Takes Over Social Media With Millions Participating Worldwide", description: "A catchy new dance challenge has exploded across TikTok, Instagram Reels, and YouTube Shorts, with millions of people from around the globe putting their own spin on the choreography. From celebrities to everyday people, everyone is jumping on the trend and showcasing their dance moves. The challenge has generated billions of views across social media platforms and shows no signs of slowing down. Choreographers are creating variations and remixes of the original dance, keeping the trend fresh and exciting. Major brands are even starting to incorporate the dance into their advertising campaigns, recognizing the massive cultural impact.\n\n### How It Started\nThe original choreography was created by a rising dance influencer who posted it as a fun challenge to their followers. The simplicity of the moves made it easy for anyone to learn and execute, regardless of their dance experience. The catchy song paired with the dance moves created the perfect viral formula. Within 24 hours, the original video had over 50 million views.\n\n### Celebrity Participation\nMajor celebrities from sports, music, and entertainment have all participated in the challenge. Some have added their own unique flair to the dance, creating memorable variations. Their participation has significantly amplified the challenge's reach and cultural relevance. Many celebrities have stated that the challenge is fun and a great way to connect with fans.\n\n### Impact and Legacy\nMarketing experts are studying this challenge as a prime example of organic viral marketing. Brands are seeing the value in authentic, fun content that naturally resonates with audiences. The challenge has transcended social media and is being discussed in mainstream media outlets. It's likely to be remembered as one of the defining viral moments of the year.", date: "1 hour ago", category: "trending-stories", status: "approved" as const },

  '11': { id: '11', title: "Major Actor Signs Career-Defining Role In Highly Anticipated Blockbuster Movie", description: "In exciting news for film enthusiasts, a major actor has signed on to lead one of the most anticipated films of the decade. The role marks a significant departure from their previous work, showcasing a more dramatic and complex character. Industry insiders suggest the role could position the actor for major award recognition and critical acclaim. The film's production is set to begin in the coming months, with an international crew of acclaimed directors, cinematographers, and writers on board. The actor expressed tremendous excitement about the project, calling it the most challenging and rewarding role of their career.\n\n### About The Role\nThe character is described as a morally complex protagonist who faces impossible choices throughout the film. The actor will have to portray a wide range of emotions and psychological states. Industry veterans who have read the script are calling it one of the best-written characters in recent cinema. The role offers substantial screen time and several powerful dramatic scenes.\n\n### Production Details\nThe film will be directed by an Oscar-winning director known for extracting exceptional performances from actors. The supporting cast includes several other A-list actors and rising talents. Filming will take place across multiple exotic international locations. The production budget is substantial, reflecting the studio's confidence in the project's commercial and critical potential.\n\n### Awards Potential\nCritics and awards predictors are already speculating about potential Oscar nominations for the film and the lead actor's performance. The actor's previous nominations and award wins suggest they have the skills to deliver the kind of performance that wins awards. The director has a proven track record of creating award-winning films with strong lead performances.", date: "1 hour ago", category: "celebrity-news", status: "approved" as const },

  '16': { id: '16', title: "Major Movie Studio Releases First Trailer For Highly Anticipated Blockbuster Arriving Soon", description: "A major movie studio has just released the first official trailer for one of the year's most anticipated blockbuster films, and the reaction from fans and critics has been overwhelmingly positive. The trailer showcases stunning visual effects, exciting action sequences, and hints at an engaging storyline that has audiences eager to see the full film. The cast, featuring several A-list actors, brings star power and credibility to the project. Early ticket sales for the film have already broken records, suggesting this could be one of the biggest box office successes of the year. Industry analysts are predicting the film will dominate the box office for weeks after its release.\n\n### Trailer Reception\nThe trailer has been viewed over 200 million times in its first 48 hours. Fan reactions on social media have been largely positive, with people praising the cinematography, casting, and storyline hints. Critics have noted that the trailer successfully balances mystery and revelation, giving viewers enough information to be excited without spoiling major plot points.\n\n### Box Office Predictions\nAnalysts are predicting opening weekend numbers that could break records for the studio. Pre-orders and advance ticket sales have exceeded expectations by significant margins. The film is already being positioned as a potential awards contender with strong technical achievements and acclaimed performances.\n\n### Marketing Strategy\nThe studio has planned an extensive marketing campaign that includes merchandise, themed experiences, and cross-promotion with major brands. Viral marketing strategies are being employed to maximize reach among younger audiences. The studio is confident the film will be a massive commercial and potentially critical success.", date: "30 minutes ago", category: "entertainment", status: "approved" as const },

  '21': { id: '21', title: "Hilarious TikTok Video Featuring Unexpected Plot Twist Goes Viral With Billions Of Views", description: "A comedy TikTok video featuring an unexpected plot twist that catches viewers completely off guard has exploded on the platform, accumulating billions of views in just days. The video's creator has leveraged the massive popularity to grow their following exponentially. The video's format has inspired countless creators to make their own versions, spawning an entire trend. Major media outlets have covered the video and the creator's sudden rise to fame. Brands are already reaching out to the creator for potential sponsorship and collaboration opportunities.\n\n### The Video\nThe video features a seemingly ordinary setup that takes a completely unexpected turn in the final seconds. The plot twist is so surprising that many viewers have watched it multiple times to catch what they initially missed. The comedy is derived from the subversion of expectations and the absurdity of the twist. The simplicity and elegance of the concept has made it highly shareable.\n\n### The Creator's Journey\nThe video was created by a relatively unknown content creator who was attempting to build an audience on TikTok. The sudden viral success has transformed their life and career prospects. The creator has received offers for brand partnerships, sponsorships, and content creation deals with major platforms. Interviews and appearance requests are flooding in from mainstream media outlets.\n\n### Impact on TikTok Culture\nThe video has influenced the type of content being created on the platform, with many creators attempting similar plot twist formats. The trend shows the power of creativity and originality in gaining attention on social media. Analysts believe this demonstrates how a single piece of creative content can launch someone to fame in the digital age.", date: "1 hour ago", category: "viral-content", status: "approved" as const },
};

export default function NewsDetail() {
  const params = useParams();
  const id = params.id as string;
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first, then fall back to all news items
    const loadNews = () => {
      // Try localStorage
      const storedNews = localStorage.getItem('naijaAmeboNews');
      let foundItem = null;

      if (storedNews) {
        try {
          const newsArray = JSON.parse(storedNews);
          foundItem = newsArray.find((item: NewsItem) => item.id === id);
        } catch (e) {
          console.error('Error parsing stored news:', e);
        }
      }

      // Fall back to all news items
      if (!foundItem) {
        foundItem = allNewsItems[id];
      }

      setNewsItem(foundItem || null);

      // Load related news from localStorage or defaults
      let newsToUse: NewsItem[] = [];
      if (storedNews) {
        try {
          newsToUse = JSON.parse(storedNews);
        } catch (e) {
          newsToUse = Object.values(allNewsItems);
        }
      } else {
        newsToUse = Object.values(allNewsItems);
      }

      // Get related news from same category (excluding current item)
      const related = newsToUse
        .filter((item: NewsItem) => item.category === foundItem?.category && item.id !== id)
        .slice(0, 3);
      
      setRelatedNews(related);
      setIsLoading(false);
    };

    loadNews();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Sorry, we couldn't find the article you're looking for.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold">
            ← Back to News
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold capitalize">
            {newsItem.category.replace('-', ' ')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {newsItem.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>Published {newsItem.date}</span>
          </div>
          {newsItem.author && (
            <div className="flex items-center gap-2">
              <span className="text-lg">✍️</span>
              <span>By {newsItem.author}</span>
            </div>
          )}
        </div>

        {/* Featured Image/Logo */}
        <div className="mb-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          {newsItem.image ? (
            <img 
              src={newsItem.image} 
              alt={newsItem.title} 
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
              <img src="/logo.svg" alt="Naija Amebo Gist" className="h-32 w-auto opacity-70 dark:opacity-50" />
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {newsItem.description}
          </div>
        </div>

        {/* Hashtags */}
        {newsItem.hashtags && newsItem.hashtags.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {newsItem.hashtags.map((tag, idx) => (
                <span key={idx} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share This Article</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(newsItem.title + ' ' + window.location.href)}`, '_blank')}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsItem.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              title="Share on Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="Share on Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(newsItem.title)}`, '_blank')}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Share on Telegram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                        <img src="/logo.svg" alt="Naija Amebo Gist" className="h-16 w-auto opacity-70 dark:opacity-50" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        📅 {item.date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
