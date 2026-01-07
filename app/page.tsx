"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import NewsCard from '../components/NewsCard';
import AlternatingLogo from '../components/AlternatingLogo';
import FeaturesWidget from '../components/FeaturesWidget';
import HomepageEnhancements from '../components/HomepageEnhancements';
import { SEOOptimizer } from '../components/SEOOptimizer';
import { organizationSchema, localBusinessSchema, websiteSchema, createBreadcrumbSchema } from '@/lib/schema';
import { SEO_CONFIG } from '@/lib/seo-config';

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
    { id: '1', title: "Major Celebrity Scandal Rocks Entertainment Industry", description: "In a shocking turn of events, one of Africa's biggest entertainment figures was caught in a major scandal that's sent shockwaves through the entertainment industry. Insiders reveal exclusive details about what went down and how the celebrity is responding. This developing story has sparked heated debates on social media with thousands of fans weighing in on their opinions. Industry experts predict this could significantly impact the celebrity's career trajectory and upcoming projects. Stay tuned as we bring you more updates as this story unfolds.", date: "Just now", category: "breaking-news", status: "approved" as const },
    { id: '2', title: "Award Show Delivers Shocking Surprise Winners Announcement", description: "The most prestigious award ceremony of the year took an unexpected turn last night when an underdog nominee walked away with the top prize, beating out heavily favored competitors. The shocking announcement left audiences stunned and sparked widespread conversation across social media. Industry insiders were caught off guard, and critics have already started debating the jury's decision. The winner gave an emotional acceptance speech that had everyone in the venue in tears. This moment has already become one of the most talked-about award show moments in recent memory.", date: "1 hour ago", category: "breaking-news", status: "approved" as const },
    { id: '3', title: "Prominent Movie Star Arrested in Dramatic Police Operation", description: "In a dramatic turn of events that has shocked the entertainment world, a major movie star was taken into custody following a high-profile police operation. Multiple sources close to the situation have provided details about the incident and what allegedly led to the arrest. The celebrity's legal team has released a statement denying all allegations and promising to fight the charges vigorously. Fellow actors and industry peers have expressed their support for the star on social media. Legal experts weigh in on the potential implications and what could happen next in this unfolding legal drama.", date: "2 hours ago", category: "breaking-news", status: "approved" as const },
    { id: '4', title: "Beloved Singer Hospitalized After Unexpected Health Crisis", description: "Music fans around the world are expressing concern after learning that a beloved singer was hospitalized yesterday following an unexpected health crisis that occurred during a high-profile concert performance. The artist's medical team has provided updates on their condition, and initial reports suggest they are in stable condition and receiving the best possible care. The incident forced the cancellation of several upcoming shows, disappointing thousands of fans who had purchased tickets. The music community has rallied around the artist with well-wishes and messages of support pouring in from fellow musicians and celebrities.", date: "3 hours ago", category: "breaking-news", status: "approved" as const },
    { id: '5', title: "High-Profile Celebrity Couple Announces Separation After Years Together", description: "In a statement released to the media, one of Hollywood's most beloved couples announced they are parting ways after more than a decade together. The announcement came as a shock to fans who have followed their relationship closely over the years. Both parties released heartfelt statements expressing their love and respect for each other, emphasizing that the decision was made amicably. Industry insiders suggest that busy schedules and conflicting career demands may have contributed to the split. The couple plans to co-parent their children and maintain a friendly relationship moving forward.", date: "4 hours ago", category: "breaking-news", status: "approved" as const },
  ],
  'trending-stories': [
    { id: '6', title: "Viral Dance Challenge Takes Over Social Media With Millions Participating Worldwide", description: "A catchy new dance challenge has exploded across TikTok, Instagram Reels, and YouTube Shorts, with millions of people from around the globe putting their own spin on the choreography. From celebrities to everyday people, everyone is jumping on the trend and showcasing their dance moves. The challenge has generated billions of views across social media platforms and shows no signs of slowing down. Choreographers are creating variations and remixes of the original dance, keeping the trend fresh and exciting. Major brands are even starting to incorporate the dance into their advertising campaigns, recognizing the massive cultural impact.", date: "1 hour ago", category: "trending-stories", status: "approved" as const },
    { id: '7', title: "Celebrity's Trending Hashtag Becomes Number One Worldwide On Multiple Platforms", description: "A hashtag created by a major celebrity has taken social media by storm, becoming the number one trending topic on Twitter, TikTok, and Instagram simultaneously. The hashtag campaign was designed to promote a charitable cause close to the celebrity's heart, and the response from fans has been overwhelming. Millions of people have joined in, creating content and sharing their personal stories related to the cause. The campaign has raised awareness and funds for the charity at an unprecedented level. Marketing experts are studying this campaign as a masterclass in viral social media marketing and celebrity influence.", date: "2 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '8', title: "Music Video Breaks All-Time Records With Record-Breaking 100 Million Views In 24 Hours", description: "A highly anticipated music video released just 24 hours ago has already broken multiple world records, achieving an incredible 100 million views faster than any other music video in history. The video's stunning visuals, innovative cinematography, and star-studded guest appearances have captivated audiences worldwide. Music streaming platforms have recorded unprecedented traffic as fans rush to listen to the full track. Industry executives are calling it a watershed moment in music video production and digital distribution. The artist's previous record holder has been surpassed, cementing this as one of the biggest launches in entertainment history.", date: "3 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '9', title: "Influencer Breaks Records With Massive Live Stream Attracting Record Number Of Concurrent Viewers", description: "An international influencer set a new world record yesterday during a live streaming event that attracted over 10 million concurrent viewers at its peak. The stream featured exclusive interviews, surprise announcements, and interactive segments that kept audiences engaged throughout the multi-hour broadcast. Viewers from over 150 countries tuned in to watch the event, making it a truly global phenomenon. The influencer announced several major projects and collaborations during the stream, causing social media to erupt with excitement. Tech companies praised the event as a demonstration of how live streaming technology has evolved.", date: "4 hours ago", category: "trending-stories", status: "approved" as const },
    { id: '10', title: "Celebrity's Fashion Choice Sparks Viral Trend As Fans Recreate The Iconic Look", description: "A recent red carpet appearance by a fashion-forward celebrity has sparked a massive trend, with fans worldwide rushing to recreate the iconic outfit. Fashion retailers have reported selling out of items similar to those worn by the celebrity, demonstrating the power of celebrity influence on consumer behavior. Fashion bloggers and style influencers have created countless tutorials showing how to achieve the look with more affordable alternatives. The original outfit was designed by a renowned fashion house and cost tens of thousands of dollars, but fans are finding creative ways to replicate it with budget-friendly pieces. Fashion analysts predict this will become one of the defining looks of the year.", date: "5 hours ago", category: "trending-stories", status: "approved" as const },
  ],
  'celebrity-news': [
    { id: '11', title: "Major Actor Signs Career-Defining Role In Highly Anticipated Blockbuster Movie", description: "In exciting news for film enthusiasts, a major actor has signed on to lead one of the most anticipated films of the decade. The role marks a significant departure from their previous work, showcasing a more dramatic and complex character. Industry insiders suggest the role could position the actor for major award recognition and critical acclaim. The film's production is set to begin in the coming months, with an international crew of acclaimed directors, cinematographers, and writers on board. The actor expressed tremendous excitement about the project, calling it the most challenging and rewarding role of their career.", date: "1 hour ago", category: "celebrity-news", status: "approved" as const },
    { id: '12', title: "Grammy-Winning Musician Announces Highly Anticipated New Album Release This Month", description: "A Grammy-winning musician has officially announced the release of their highly anticipated new album, much to the delight of fans who have been waiting years for new material. The album features an impressive lineup of collaborations with other renowned artists and showcases a fresh musical direction for the musician. Early singles from the album have already received critical acclaim and chart success. Fans have been expressing their excitement on social media, with the announcement trending worldwide within minutes. Pre-orders for the album have already broken records, indicating massive demand from the global fanbase.", date: "2 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '13', title: "Beloved Celebrity Couple Shares Adorable Photos Of Their Relationship Milestone", description: "A beloved celebrity couple has shared a series of adorable photos celebrating an important milestone in their relationship, and fans cannot get enough of the sweet moments captured. The couple has been open about their relationship journey, regularly sharing glimpses into their life together with their massive social media following. The latest photos showcase romantic getaways, intimate moments, and the couple's infectious chemistry. Relationship experts and relationship bloggers have praised the couple as a model for healthy celebrity relationships. The couple's openness about their personal life has resonated with millions of followers who find their story inspiring.", date: "3 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '14', title: "Award-Winning Performance Receives Critical Praise And Standing Ovation From Industry Peers", description: "A celebrity's recent performance has been hailed by critics as one of the finest acting performances in recent years, earning a standing ovation from fellow industry professionals and audience members alike. The performance showcased incredible range, emotional depth, and technical skill that left viewers moved and impressed. Critics have already begun comparing the performance to iconic roles from cinema history. Industry experts are predicting major award nominations and recognition from prestigious award ceremonies. The actor's portrayal has sparked discussions about the craft of acting and what makes a truly transformative performance.", date: "4 hours ago", category: "celebrity-news", status: "approved" as const },
    { id: '15', title: "A-List Celebrity Announces Major Charitable Initiative Supporting Global Humanitarian Causes", description: "One of the world's most prominent celebrities has announced a major new charitable initiative aimed at supporting vulnerable communities and addressing critical humanitarian issues. The initiative comes with a substantial financial commitment and partnerships with established charitable organizations around the world. The celebrity has been a longtime advocate for social causes and sees this initiative as their most significant contribution to date. The announcement has been praised by humanitarian organizations, NGOs, and fellow celebrities who are calling for others to follow suit. The celebrity's dedication to social responsibility has inspired millions of fans to get involved in charitable work themselves.", date: "5 hours ago", category: "celebrity-news", status: "approved" as const },
  ],
  'entertainment': [
    { id: '16', title: "Major Movie Studio Releases First Trailer For Highly Anticipated Blockbuster Arriving Soon", description: "A major movie studio has just released the first official trailer for one of the year's most anticipated blockbuster films, and the reaction from fans and critics has been overwhelmingly positive. The trailer showcases stunning visual effects, exciting action sequences, and hints at an engaging storyline that has audiences eager to see the full film. The cast, featuring several A-list actors, brings star power and credibility to the project. Early ticket sales for the film have already broken records, suggesting this could be one of the biggest box office successes of the year. Industry analysts are predicting the film will dominate the box office for weeks after its release.", date: "30 minutes ago", category: "entertainment", status: "approved" as const },
    { id: '17', title: "Annual Entertainment Awards Ceremony Celebrates Excellence And Honors Outstanding Achievements", description: "The entertainment industry's most prestigious awards ceremony took place last night, celebrating the year's outstanding films, television shows, music, and performances. The event featured touching acceptance speeches, memorable performances by award-winning artists, and unexpected wins that surprised industry observers. Stars from around the world gathered to honor their peers and celebrate the best of entertainment. The ceremony was watched by millions of viewers worldwide and trended on social media throughout the evening. Award winners expressed gratitude for the recognition and credited their teams for their hard work and dedication.", date: "1 hour ago", category: "entertainment", status: "approved" as const },
    { id: '18', title: "Long-Running TV Series Concludes With Emotional Finale That Leaves Fans In Tears", description: "One of television's most beloved and long-running series concluded last night with an emotional two-hour finale that had fans reaching for tissues as they bid farewell to characters they've grown to love over the years. The final episode delivered satisfying conclusions to major storylines while maintaining the emotional and dramatic intensity the show is known for. Social media was flooded with fans sharing their reactions, favorite moments, and emotional goodbyes to the characters and show. The creator and cast have expressed their gratitude to the dedicated fanbase who supported the show throughout its impressive run. The finale has already become one of the most-watched TV episodes in recent history.", date: "2 hours ago", category: "entertainment", status: "approved" as const },
    { id: '19', title: "Major Summer Music Festival Announces Star-Studded Lineup Of International And Local Artists", description: "One of the world's most popular summer music festivals has announced its lineup for the upcoming year, and it features an incredible selection of international superstars and local artists. The festival will feature multiple stages with performances happening simultaneously, ensuring something for every music taste. Tickets are expected to sell out quickly given the strength of the lineup and the festival's legendary reputation. Previous attendees have praised the festival's organization, amenities, and vibrant atmosphere. Music fans are already making travel plans to attend what promises to be an unforgettable celebration of music and culture.", date: "3 hours ago", category: "entertainment", status: "approved" as const },
    { id: '20', title: "Acclaimed Actor Sits Down For Revealing Interview Sharing Behind-The-Scenes Secrets And Personal Stories", description: "In a rare and revealing interview, an acclaimed actor has opened up about their career, personal life, behind-the-scenes stories from major productions, and the challenges and rewards of working in the entertainment industry. The actor shares candid insights into the creative process, working with renowned directors, and navigating fame and its pressures. The interview also covers the actor's charitable work and what they hope their legacy will be beyond their film career. Fans and industry professionals alike have praised the actor's honesty and willingness to share such personal details. The interview has become one of the most-shared celebrity interviews in recent months.", date: "4 hours ago", category: "entertainment", status: "approved" as const },
  ],
  'viral-content': [
    { id: '21', title: "Hilarious TikTok Video Featuring Unexpected Plot Twist Goes Viral With Billions Of Views", description: "A comedy TikTok video featuring an unexpected plot twist that catches viewers completely off guard has exploded on the platform, accumulating billions of views in just days. The video's creator has leveraged the massive popularity to grow their following exponentially. The video's format has inspired countless creators to make their own versions, spawning an entire trend. Major media outlets have covered the video and the creator's sudden rise to fame. Brands are already reaching out to the creator for potential sponsorship and collaboration opportunities.", date: "1 hour ago", category: "viral-content", status: "approved" as const },
    { id: '22', title: "Adorable Instagram Reel Of Cute Puppies Learning To Dance Goes Massively Viral Overnight", description: "An absolutely adorable Instagram Reel featuring cute puppies learning to dance to a trending song has melted hearts across the internet and become the most-liked reel on Instagram in recent weeks. The video's charm and cuteness factor has made it shareable across all social media platforms and even traditional media. Celebrity accounts with hundreds of millions of followers have reposted the video to their audiences. The creator has been inundated with interview requests and brand partnership offers. Animal welfare organizations have reached out about potential collaborations to raise awareness and funds.", date: "2 hours ago", category: "viral-content", status: "approved" as const },
    { id: '23', title: "Epic Twitter Thread Recounting Bizarre True Story Captivates Millions Of Readers Worldwide", description: "A viral Twitter thread documenting an incredibly bizarre but completely true story has captivated millions of readers and become one of the most engaging threads in Twitter history. The storyteller's compelling narrative, good humor, and attention to detail kept readers hooked from beginning to end. The thread has been retweeted hundreds of thousands of times and shared across all social media platforms. Publishers and producers have already expressed interest in turning the story into a book, podcast, or television series. The original poster has been interviewed by major media outlets about their experience and the viral reaction to sharing their story.", date: "3 hours ago", category: "viral-content", status: "approved" as const },
    { id: '24', title: "Ambitious YouTube Challenge Successfully Completed By Thousands Of Participants Globally", description: "A fun and creative YouTube challenge has taken off globally, with thousands of content creators and regular users attempting to complete the challenge and upload their own versions. The challenge has generated millions of views across YouTube and other social media platforms. The original challenge creator has been amazed by the creative interpretations and variations people have come up with. Mainstream celebrities and athletes have participated in the challenge, bringing even more attention to the trend. The challenge has even inspired charitable initiatives, with some participants using their participation to raise money and awareness for important causes.", date: "4 hours ago", category: "viral-content", status: "approved" as const },
    { id: '25', title: "Funny Internet Meme Reaches Peak Popularity Spreading Across All Social Media Platforms Globally", description: "A funny internet meme featuring hilarious and relatable humor has achieved peak popularity and spread to every major social media platform and online community. The meme's simplicity and universal relatability make it easy for people from different cultures and backgrounds to understand and enjoy. Marketers have begun incorporating the meme into their advertising campaigns, recognizing its cultural relevance and appeal. Major media outlets have written articles analyzing the meme's success and what it reveals about internet culture. Meme databases and archives are already documenting the meme's evolution as people continue to create new variations and iterations.", date: "5 hours ago", category: "viral-content", status: "approved" as const },
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
          
          // Create news object - START EMPTY (don't merge with defaults)
          const mergedNews: Record<string, NewsItem[]> = {};
          
          // Organize ONLY APPROVED news by category
          newsArray.forEach((newsItem: NewsItem) => {
            if (newsItem.status === 'approved' && newsItem.category) {
              if (!mergedNews[newsItem.category]) {
                mergedNews[newsItem.category] = [];
              }
              mergedNews[newsItem.category].unshift(newsItem); // Add to beginning
            }
          });
          
          // If we have real approved news, use it; otherwise fallback to defaults
          const finalNews = Object.keys(mergedNews).length > 0 ? mergedNews : defaultNews;
          setNewsData(finalNews);
        } catch (error) {
          console.error('Error loading news from localStorage:', error);
          setNewsData(defaultNews);
        }
      } else {
        // No stored news, use defaults
        setNewsData(defaultNews);
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
      {/* SEO Optimization Component */}
      <SEOOptimizer pageType="homepage" />

      {/* Structured Data for Homepage */}
      <Script
        id="homepage-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            createBreadcrumbSchema([
              { name: 'Home', url: 'https://amebo.org' },
              { name: 'News', url: 'https://amebo.org/breaking-news' },
            ])
          ),
        }}
        suppressHydrationWarning
      />

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
