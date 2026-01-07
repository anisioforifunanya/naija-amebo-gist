/**
 * Google Discover Optimization
 * Increases visibility in Google Discover feed for Nigerian users
 * 
 * Google Discover shows personalized content based on:
 * - User interests & search history
 * - Content freshness
 * - Engaging headlines & images
 * - E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness)
 */

export interface DiscoverOptimization {
  title: string;
  headline: string;
  description: string;
  image: string;
  category: string;
  isBreakingNews: boolean;
  publishDate: string;
  updateDate?: string;
  author: string;
  engaging: boolean;
}

/**
 * Google Discover Requirements:
 * 1. High-quality, original content
 * 2. Engaging headline (60-70 characters)
 * 3. High-quality featured image (1200x627px+)
 * 4. Recent publication (< 7 days)
 * 5. Mobile-friendly design
 * 6. No intrusive ads/interstitials
 * 7. Clear author & publication date
 */

/**
 * Check if article is Discover-eligible
 */
export function isDiscoverEligible(article: DiscoverOptimization): boolean {
  const publishedDate = new Date(article.publishDate);
  const daysOld = (new Date().getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

  return (
    article.title.length > 10 &&
    article.title.length <= 70 &&
    article.image !== '' &&
    daysOld <= 7 &&
    article.description.length >= 50 &&
    article.engaging === true
  );
}

/**
 * Generate Discover-optimized headline
 * - Avoid clickbait
 * - Include relevant keywords
 * - 60-70 characters ideal
 * - Use active voice
 */
export function generateDiscoverHeadline(
  mainTopic: string,
  verb: string,
  category: string
): string {
  const headlines = [
    `${verb} ${mainTopic} | Breaking ${category} news`,
    `${mainTopic} ${verb}: What you need to know`,
    `Latest: ${mainTopic} ${verb.toLowerCase()}`,
    `${mainTopic} ${verb} in shocking turn of events`,
  ];

  // Return headline closest to 60-70 characters
  return headlines.sort((a, b) => 
    Math.abs(a.length - 65) - Math.abs(b.length - 65)
  )[0];
}

/**
 * Metadata for Discover optimization
 */
export function generateDiscoverMetaTags(article: DiscoverOptimization): {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
} {
  return {
    headline: article.headline,
    description: article.description.substring(0, 160),
    image: article.image,
    datePublished: article.publishDate,
    dateModified: article.updateDate,
  };
}

/**
 * Breaking news optimization for Discover
 * Breaking news gets higher priority in Discover feed
 */
export function optimizeForBreakingNews(
  headline: string,
  publishTime: Date
): {
  label: string;
  freshness: 'very_recent' | 'recent' | 'standard';
} {
  const minutesOld = (new Date().getTime() - publishTime.getTime()) / (1000 * 60);

  return {
    label: minutesOld < 30 ? 'BREAKING' : minutesOld < 60 ? 'LATEST' : 'NEW',
    freshness:
      minutesOld < 30
        ? 'very_recent'
        : minutesOld < 120
        ? 'recent'
        : 'standard',
  };
}

/**
 * Discover Content Guidelines for Nigerian Audience:
 * 
 * 1. Entertainment & Celebrity News (TOP PRIORITY)
 *    - BBNaija updates
 *    - Nollywood news
 *    - Music releases
 *    - Celebrity relationships
 * 
 * 2. Viral & Trending Content
 *    - TikTok trends
 *    - Twitter/X trending topics
 *    - Meme trends
 *    - Challenge updates
 * 
 * 3. Exclusive Stories
 *    - Exclusive interviews
 *    - Behind-the-scenes content
 *    - Celebrity responses
 * 
 * 4. Trending Keywords for Nigerian Users:
 *    - "BBNaija" (HIGH)
 *    - "Trending" (HIGH)
 *    - "Breaking" (HIGH)
 *    - "Exclusive" (MEDIUM)
 *    - "Update" (MEDIUM)
 */

/**
 * Content freshness impact on Discover ranking:
 * - < 1 hour: HIGHEST boost
 * - 1-6 hours: HIGH boost
 * - 6-24 hours: MEDIUM boost
 * - 1-7 days: Standard ranking
 * - > 7 days: Lower visibility (unless updated)
 */
export function getDiscoverBoost(publishedMinutesAgo: number): number {
  if (publishedMinutesAgo < 60) return 1.5; // 50% boost
  if (publishedMinutesAgo < 360) return 1.3; // 30% boost
  if (publishedMinutesAgo < 1440) return 1.1; // 10% boost
  return 1.0; // No boost
}
