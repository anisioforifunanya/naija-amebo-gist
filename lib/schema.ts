/**
 * Structured Data Schemas (JSON-LD)
 * Helps search engines understand website content and improve SERP display
 */

import { SEO_CONFIG } from './seo-config';

/**
 * Organization Schema - Identifies the organization to search engines
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: SEO_CONFIG.organization.name,
  url: SEO_CONFIG.organization.url,
  logo: {
    '@type': 'ImageObject',
    url: 'https://amebo.org/logo.png',
    width: 200,
    height: 60,
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://amebo.org/logo.png',
    width: 200,
    height: 60,
  },
  description: SEO_CONFIG.organization.description,
  foundingDate: SEO_CONFIG.organization.foundingDate,
  email: SEO_CONFIG.organization.email,
  telephone: SEO_CONFIG.organization.telephone,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: SEO_CONFIG.organization.contactType,
    email: SEO_CONFIG.organization.email,
  },
  sameAs: [
    `https://twitter.com/${SEO_CONFIG.socialMedia.twitter.replace('@', '')}`,
    `https://facebook.com/${SEO_CONFIG.socialMedia.facebook}`,
    `https://instagram.com/${SEO_CONFIG.socialMedia.instagram.replace('@', '')}`,
  ],
  areaServed: {
    '@type': 'Country',
    name: 'NG',
  },
  knowsAbout: [
    'Nigerian Entertainment',
    'Celebrity News',
    'Gossip',
    'Entertainment News',
    'Trending Stories',
  ],
};

/**
 * Local Business Schema - Helps with local Nigerian search results
 */
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SEO_CONFIG.localBusiness.name,
  url: SEO_CONFIG.organization.url,
  logo: {
    '@type': 'ImageObject',
    url: 'https://amebo.org/logo.png',
    width: 200,
    height: 60,
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://amebo.org/logo.png',
    width: 200,
    height: 60,
  },
  description: SEO_CONFIG.organization.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.localBusiness.address.streetAddress,
    addressLocality: SEO_CONFIG.localBusiness.address.addressLocality,
    addressRegion: SEO_CONFIG.localBusiness.address.addressRegion,
    postalCode: SEO_CONFIG.localBusiness.address.postalCode,
    addressCountry: SEO_CONFIG.localBusiness.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SEO_CONFIG.localBusiness.geo.latitude,
    longitude: SEO_CONFIG.localBusiness.geo.longitude,
  },
  areaServed: 'NG',
};

/**
 * WebSite Schema - Defines the website and search action
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.domain,
  description: SEO_CONFIG.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO_CONFIG.domain}/search?q={search_term_string}`,
    },
    query: 'required name=search_term_string',
  },
};

/**
 * News Article Schema - For individual articles
 */
export const createNewsArticleSchema = (data: {
  id: string;
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  category: string;
  author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: data.title,
  description: data.description,
  image: data.image || SEO_CONFIG.ogImage.url,
  datePublished: data.datePublished,
  dateModified: data.dateModified || data.datePublished,
  author: {
    '@type': 'Organization',
    name: data.author || SEO_CONFIG.organization.name,
    url: SEO_CONFIG.organization.url,
  },
  publisher: {
    '@type': 'Organization',
    name: SEO_CONFIG.organization.name,
    logo: {
      '@type': 'ImageObject',
      url: SEO_CONFIG.organization.logo,
      width: 250,
      height: 60,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SEO_CONFIG.domain}/news/${data.id}`,
  },
  articleSection: data.category,
  keywords: data.category,
  articleBody: data.description,
});

/**
 * Breadcrumb Schema - For navigation hierarchy
 */
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * FAQPage Schema - For FAQ sections
 */
export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Image Object Schema - For images in articles
 */
export const createImageSchema = (url: string, title: string, description?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  url: url,
  name: title,
  description: description || title,
  width: 1200,
  height: 630,
});

/**
 * Video Schema - For video content
 */
export const createVideoSchema = (data: {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: data.title,
  description: data.description,
  thumbnailUrl: [data.thumbnailUrl],
  uploadDate: data.uploadDate,
  duration: data.duration,
  contentUrl: data.contentUrl,
});
