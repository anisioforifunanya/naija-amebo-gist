/**
 * SEO Utilities for Marketplace
 * Handles metadata, structured data, breadcrumbs, and SEO optimization
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterImage?: string;
  robots?: 'index, follow' | 'noindex, follow' | 'index, nofollow' | 'noindex, nofollow';
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Default marketplace SEO metadata
 */
export const DEFAULT_MARKETPLACE_SEO: SEOMetadata = {
  title: 'Naija Marketplace - Online Shopping for Electronics, Fashion & More',
  description: 'Shop Nigeria\'s leading online marketplace. Find authentic phones, electronics, fashion, home goods and more. Secure payments with Paystack, Flutterwave. Fast delivery across Nigeria.',
  keywords: [
    'online shopping Nigeria',
    'Nigerian marketplace',
    'buy phones online',
    'electronics Nigeria',
    'fashion online',
    'Naija store',
    'secure shopping',
    'fast delivery Nigeria',
    'best prices Nigeria',
    'authentic products'
  ],
  canonical: 'https://naija-amebo-gist-production.up.railway.app/marketplace',
  ogTitle: 'Naija Marketplace - Shop Everything Online',
  ogDescription: 'Discover a wide range of products from trusted sellers. Secure payments, fast delivery, best prices.',
  ogImage: 'https://naija-amebo-gist-production.up.railway.app/og-marketplace.png',
  robots: 'index, follow'
};

/**
 * Generate product SEO metadata
 */
export function generateProductSEO(
  productName: string,
  productDescription: string,
  price: number,
  rating: number,
  reviews: number,
  image: string,
  category: string
): SEOMetadata {
  return {
    title: `${productName} - Buy Online Nigeria | Naija Marketplace`,
    description: `${productDescription} - ₦${price.toLocaleString('en-NG')}. ${rating}★ from ${reviews} reviews. Fast delivery across Nigeria.`,
    keywords: [
      productName,
      `${productName} Nigeria`,
      `buy ${productName}`,
      category,
      `${productName} price Nigeria`,
      `${productName} online`,
      'authentic products',
      'fast shipping'
    ],
    ogTitle: `${productName} - ₦${price.toLocaleString('en-NG')}`,
    ogDescription: productDescription,
    ogImage: image,
    robots: 'index, follow'
  };
}

/**
 * Generate category page SEO
 */
export function generateCategorySEO(
  categoryName: string,
  productCount: number
): SEOMetadata {
  return {
    title: `${categoryName} - Buy Online Nigeria | Naija Marketplace`,
    description: `Browse ${productCount} ${categoryName.toLowerCase()} products on Naija Marketplace. Best prices, authentic products, fast delivery across Nigeria.`,
    keywords: [
      categoryName,
      `${categoryName} Nigeria`,
      `buy ${categoryName}`,
      `${categoryName} online Nigeria`,
      'best prices',
      'authentic products'
    ],
    canonical: `https://naija-amebo-gist-production.up.railway.app/marketplace?category=${categoryName.toLowerCase()}`,
    robots: 'index, follow'
  };
}

/**
 * Product structured data (Schema.org)
 */
export function generateProductStructuredData(
  productName: string,
  productDescription: string,
  image: string,
  price: number,
  currency: string = 'NGN',
  rating: number,
  reviews: number,
  inStock: boolean,
  seller: string
): StructuredData {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: productName,
    description: productDescription,
    image: image,
    brand: {
      '@type': 'Brand',
      name: seller
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: currency,
      price: price.toString(),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: seller
      }
    },
    aggregateRating: reviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviews.toString(),
      bestRating: '5',
      worstRating: '1'
    } : undefined
  };
}

/**
 * Organization structured data
 */
export function generateOrganizationStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'Naija Marketplace',
    url: 'https://naija-amebo-gist-production.up.railway.app/marketplace',
    logo: 'https://naija-amebo-gist-production.up.railway.app/logo.png',
    description: 'Nigeria\'s leading online marketplace for authentic products',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      telephone: '+234-XXX-XXX-XXXX',
      email: 'support@naija-amebo-gist.com'
    },
    sameAs: [
      'https://twitter.com/naijaameobogist',
      'https://instagram.com/naijaameobogist',
      'https://facebook.com/naijaameobogist'
    ]
  };
}

/**
 * Breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * FAQPage structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Local business structured data (for Nigerian market)
 */
export function generateLocalBusinessStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Naija Marketplace',
    description: 'Online marketplace for Nigerian products and services',
    url: 'https://naija-amebo-gist-production.up.railway.app/marketplace',
    telephone: '+234-XXX-XXX-XXXX',
    email: 'support@naija-amebo-gist.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nigeria',
      addressCountry: 'NG'
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Lagos'
      },
      {
        '@type': 'City',
        name: 'Abuja'
      },
      {
        '@type': 'City',
        name: 'Portharcourt'
      }
    ],
    priceRange: '₦1,000 - ₦3,000,000'
  };
}

/**
 * Generate open graph meta tags
 */
export function generateOpenGraphTags(metadata: SEOMetadata): Record<string, string> {
  return {
    'og:title': metadata.ogTitle || metadata.title,
    'og:description': metadata.ogDescription || metadata.description,
    'og:image': metadata.ogImage || 'https://naija-amebo-gist-production.up.railway.app/og-image.png',
    'og:url': metadata.ogUrl || 'https://naija-amebo-gist-production.up.railway.app/marketplace',
    'og:type': 'website',
    'og:site_name': 'Naija Amebo Gist'
  };
}

/**
 * Generate Twitter card meta tags
 */
export function generateTwitterCardTags(metadata: SEOMetadata): Record<string, string> {
  return {
    'twitter:card': metadata.twitterCard || 'summary_large_image',
    'twitter:title': metadata.ogTitle || metadata.title,
    'twitter:description': metadata.ogDescription || metadata.description,
    'twitter:image': metadata.twitterImage || metadata.ogImage || 'https://naija-amebo-gist-production.up.railway.app/twitter-image.png',
    'twitter:creator': '@naijaameobogist'
  };
}

/**
 * Sitemap entry for marketplace
 */
export interface SitemapEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

export function generateMarketplaceSitemapEntries(
  categories: Array<{ id: string; name: string }>,
  productCount: number
): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    {
      url: 'https://naija-amebo-gist-production.up.railway.app/marketplace',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString()
    }
  ];

  // Add category pages
  categories.forEach(category => {
    entries.push({
      url: `https://naija-amebo-gist-production.up.railway.app/marketplace?category=${category.id}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString()
    });
  });

  return entries;
}

/**
 * Create robots.txt content for marketplace
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /marketplace
Allow: /api/products
Disallow: /admin
Disallow: /api/payment
Disallow: /api/orders

Sitemap: https://naija-amebo-gist-production.up.railway.app/sitemap.xml

# Crawl delay (in seconds)
Crawl-delay: 1
`;
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: SEOMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.length === 0) {
    errors.push('Title is required');
  } else if (metadata.title.length > 60) {
    errors.push('Title should be less than 60 characters');
  }

  if (!metadata.description || metadata.description.length === 0) {
    errors.push('Description is required');
  } else if (metadata.description.length < 120) {
    errors.push('Description should be at least 120 characters');
  } else if (metadata.description.length > 160) {
    errors.push('Description should be less than 160 characters');
  }

  if (!metadata.keywords || metadata.keywords.length === 0) {
    errors.push('Keywords are required');
  } else if (metadata.keywords.length > 10) {
    errors.push('Maximum 10 keywords recommended');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Common FAQs for marketplace
 */
export const MARKETPLACE_FAQS = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 2-5 business days depending on your location. Lagos and Abuja orders usually arrive within 2-3 days.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Paystack, Flutterwave, and Pay on Delivery (COD) for orders in Lagos, Abuja, and other major cities.'
  },
  {
    question: 'Are all products authentic?',
    answer: 'Yes, all products on Naija Marketplace are 100% authentic. We work with verified sellers and manufacturers. Every product comes with a warranty.'
  },
  {
    question: 'What is your return policy?',
    answer: 'You can return items within 7 days of delivery if they are unopened and in original condition. Refunds are processed within 5-7 business days.'
  },
  {
    question: 'Is my payment secure?',
    answer: 'Yes, all payments are secured through industry-leading payment gateways (Paystack and Flutterwave) with SSL encryption.'
  },
  {
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time from your account dashboard. You\'ll also receive SMS and email updates about your delivery status.'
  }
];
