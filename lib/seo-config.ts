/**
 * SEO Configuration for Naija Amebo Gist
 * Optimized for Nigerian search rankings and international visibility
 */

export const SEO_CONFIG = {
  // Domain and basic info
  domain: 'https://amebo.org',
  siteName: 'Naija Amebo Gist',
  siteShortName: 'Amebo',
  author: 'Naija Amebo Gist Team',
  description: 'Your ultimate source for celebrity news, gossip, gist, entertainment updates, trending stories, and viral content from Nigeria and the diaspora',
  
  // Keywords for Nigerian and global search
  keywords: [
    // Main keywords
    'Naija gist',
    'Nigerian celebrity news',
    'Naija gossip',
    'Nigerian entertainment news',
    'Nigerian breaking news',
    'Celebrity gist Nigeria',
    'Latest Nigerian news',
    'Trending in Nigeria',
    'Nigerian celebrities',
    'Naija entertainment',
    
    // Long-tail keywords
    'best Nigerian news website',
    'Nigerian celebrity gossip forum',
    'Naija gist and gossip',
    'Nigerian trending stories today',
    'latest Nigerian entertainment updates',
    'Nigerian viral videos',
    'Naija celebrity updates',
    'Nigeria breaking news today',
    
    // International/diaspora keywords
    'Nigerian news abroad',
    'diaspora news Nigeria',
    'African entertainment news',
    'Nigerian diaspora gossip',
    'latest news from Nigeria',
    
    // Category keywords
    'Nigerian music news',
    'Nollywood news',
    'Nigerian celebrity relationships',
    'Nigerian celebrity scandals',
    'Nigeria politics news',
  ],
  
  // Language and location
  language: 'en-NG',
  locale: 'en_NG',
  locales: ['en_NG', 'en_US', 'en_GB'],
  country: 'NG',
  countryName: 'Nigeria',
  
  // Image URLs for social sharing
  ogImage: {
    url: 'https://amebo.org/og-image.png',
    width: 1200,
    height: 630,
    type: 'image/png',
  },
  
  // Social media
  socialMedia: {
    twitter: '@NaijaAmeboGist',
    facebook: 'NaijaAmeboGist',
    instagram: '@naijaambogist',
    whatsapp: '+234',
  },
  
  // Organization schema
  organization: {
    name: 'Naija Amebo Gist',
    url: 'https://amebo.org',
    logo: 'https://amebo.org/logo.svg',
    description: 'Your ultimate source for Nigerian celebrity news, gossip, gist, entertainment updates, trending stories, and viral content',
    foundingDate: '2024',
    email: 'ifunanya.anisiofor@gmail.com',
    telephone: '+234',
    contactType: 'Customer Service',
  },
  
  // Local business schema (for Nigerian presence)
  localBusiness: {
    name: 'Naija Amebo Gist',
    type: 'LocalBusiness',
    address: {
      streetAddress: '',
      addressLocality: 'Lagos',
      addressRegion: 'Lagos',
      postalCode: '',
      addressCountry: 'NG',
    },
    geo: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
  },
  
  // OpenGraph defaults
  og: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Naija Amebo Gist',
  },
  
  // Twitter Card
  twitter: {
    handle: '@NaijaAmeboGist',
    site: '@NaijaAmeboGist',
    cardType: 'summary_large_image',
  },
  
  // Mobile optimization
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#8b5cf6',
  
  // Canonical URL (auto-generated per page)
  canonical: 'https://amebo.org',
  
  // Robots meta
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  
  // Alternate links for localization
  alternates: {
    'en-NG': 'https://amebo.org',
    'en-US': 'https://amebo.org/en-us',
    'en-GB': 'https://amebo.org/en-gb',
  },
};

/**
 * Category-specific keywords for better ranking
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'breaking-news': [
    'Nigeria breaking news',
    'latest Nigerian news',
    'Nigeria news today',
    'breaking news Nigeria',
    'Nigerian headlines',
  ],
  'celebrity-news': [
    'Nigerian celebrity news',
    'celebrity gossip Nigeria',
    'Naija celebrity updates',
    'Nigerian famous personalities',
  ],
  'entertainment': [
    'Nigerian entertainment news',
    'entertainment updates Nigeria',
    'Naija entertainment gist',
    'Nigerian showbiz news',
  ],
  'gossip': [
    'Nigerian gossip',
    'Naija gist',
    'celebrity gossip Nigeria',
    'Nigerian gist today',
  ],
  'trending-stories': [
    'trending in Nigeria',
    'Nigerian trending stories',
    'viral Nigerian news',
    'what\'s trending Nigeria',
  ],
  'viral-content': [
    'viral Nigerian videos',
    'Nigerian viral content',
    'viral Nigeria news',
  ],
};

/**
 * Generate meta description based on content type
 */
export const getMetaDescription = (type: string, title?: string): string => {
  const descriptions: Record<string, string> = {
    homepage: 'Naija Amebo Gist - Your ultimate source for Nigerian celebrity news, gossip, entertainment updates, trending stories, and viral content. Get the latest gist from Nigeria and the diaspora.',
    news: `Read the latest Nigerian news on Naija Amebo Gist. Stay updated with breaking news, celebrity gossip, entertainment updates, and trending stories from Nigeria.${title ? ` - ${title}` : ''}`,
    category: `Explore Nigerian ${type} news on Naija Amebo Gist. Get the latest gist, updates, and viral content from Nigeria and the diaspora.`,
    article: `Get all the latest gist and updates on Naija Amebo Gist. Your #1 source for Nigerian celebrity news and entertainment.`,
  };
  
  return descriptions[type] || descriptions.homepage;
};

/**
 * Generate structured heading based on SEO best practices
 */
export const generateH1 = (type: string): string => {
  const headings: Record<string, string> = {
    homepage: 'Latest Nigerian Celebrity News, Gossip & Entertainment Gist - Naija Amebo Gist',
    category: 'Breaking News, Celebrity Gossip & Entertainment Updates from Nigeria',
    article: 'Nigerian News: Your #1 Source for Celebrity Gist & Entertainment Updates',
  };
  
  return headings[type] || headings.homepage;
};
