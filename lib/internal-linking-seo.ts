/**
 * Internal Linking Strategy for SEO
 * Creates strategic links between articles for crawl depth & link juice distribution
 */

export interface RelatedArticle {
  id: number;
  title: string;
  category: string;
  relevance: 'high' | 'medium' | 'low';
}

/**
 * Generate related articles for internal linking
 * Algorithm: Same category + trending = highest relevance
 */
export function getRelatedArticles(
  currentArticleId: number,
  allArticles: any[],
  limit: number = 3
): RelatedArticle[] {
  if (!allArticles || allArticles.length === 0) return [];

  const currentArticle = allArticles[currentArticleId];
  if (!currentArticle) return [];

  // Filter articles in same category
  const sameCategory = allArticles.filter(
    (article, idx) =>
      idx !== currentArticleId && article.category === currentArticle.category
  );

  // Sort by relevance (trending first, then recent)
  const sorted = sameCategory
    .map((article, idx) => ({
      id: allArticles.indexOf(article),
      title: article.title,
      category: article.category,
      relevance:
        article.title.toLowerCase().includes('trending') ||
        article.title.toLowerCase().includes('viral')
          ? ('high' as const)
          : ('medium' as const),
    }))
    .sort((a, b) => {
      if (a.relevance === 'high' && b.relevance !== 'high') return -1;
      if (a.relevance !== 'high' && b.relevance === 'high') return 1;
      return 0;
    });

  return sorted.slice(0, limit);
}

/**
 * Generate SEO-optimized anchor text for internal links
 */
export function generateAnchorText(
  articleTitle: string,
  category: string
): string {
  // Use keyword-rich anchor text instead of "read more"
  const keywords: Record<string, string> = {
    'breaking-news': `Latest ${articleTitle} breaking news`,
    'celebrity-news': `${articleTitle} celebrity gossip`,
    entertainment: `${articleTitle} entertainment update`,
    gossip: `${articleTitle} gist and drama`,
    'trending-stories': `Trending: ${articleTitle}`,
    'viral-content': `Viral: ${articleTitle}`,
  };

  return (
    keywords[category] ||
    `Read more about: ${articleTitle}` 
  );
}

/**
 * Create breadcrumb path for SEO
 */
export function generateBreadcrumbs(
  category: string,
  articleTitle: string
): Array<{ name: string; url: string }> {
  return [
    { name: 'Home', url: '/' },
    {
      name: category.replace('-', ' ').toUpperCase(),
      url: `/${category}`,
    },
    {
      name: articleTitle.substring(0, 50),
      url: '#',
    },
  ];
}

/**
 * Generate schema-optimized snippet for article
 * Used for Google Discover & News Tab optimization
 */
export function generateArticleSnippet(
  title: string,
  description: string,
  category: string,
  maxLength: number = 155
): string {
  // Optimize for search results - include category keyword
  const categoryKeyword = category.replace('-', ' ');
  let snippet = `${title.substring(0, 80)} - Latest ${categoryKeyword} news on Naija Amebo Gist`;

  if (snippet.length > maxLength) {
    snippet = description.substring(0, maxLength - 3) + '...';
  }

  return snippet;
}
