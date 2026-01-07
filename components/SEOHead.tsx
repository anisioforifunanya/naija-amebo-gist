/**
 * SEO Head Component
 * Adds comprehensive meta tags and structured data to individual pages
 */

import Head from 'next/head';
import { SEO_CONFIG } from '@/lib/seo-config';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article' | 'news';
  published?: string;
  modified?: string;
  author?: string;
  schema?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  type = 'website',
  published,
  modified,
  author,
  schema,
}: SEOProps) {
  const fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
  const finalDescription = description || SEO_CONFIG.description;
  const finalOgImage = ogImage || SEO_CONFIG.ogImage.url;
  const finalOgUrl = ogUrl || SEO_CONFIG.domain;
  const finalKeywords = keywords || SEO_CONFIG.keywords;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content={author || SEO_CONFIG.author} />
      <meta name="viewport" content={SEO_CONFIG.viewport} />
      <meta name="theme-color" content={SEO_CONFIG.themeColor} />
      <meta name="language" content={SEO_CONFIG.language} />
      <meta name="robots" content={SEO_CONFIG.robots} />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta charSet="utf-8" />

      {/* Open Graph Tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={SEO_CONFIG.twitter.cardType} />
      <meta name="twitter:site" content={SEO_CONFIG.twitter.site} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitter.handle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Article-specific Meta Tags */}
      {type === 'article' && published && (
        <>
          <meta property="article:published_time" content={published} />
          <meta property="article:modified_time" content={modified || published} />
          <meta property="article:author" content={author || SEO_CONFIG.author} />
          <meta property="article:section" content="News" />
          <meta property="article:tag" content={finalKeywords.slice(0, 5).join(', ')} />
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={finalOgUrl} />

      {/* Alternate Language Links */}
      <link rel="alternate" hrefLang="en-NG" href={SEO_CONFIG.domain} />
      <link rel="alternate" hrefLang="en-US" href={`${SEO_CONFIG.domain}/en-US`} />
      <link rel="alternate" hrefLang="en-GB" href={`${SEO_CONFIG.domain}/en-GB`} />
      <link rel="alternate" hrefLang="x-default" href={SEO_CONFIG.domain} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
}

/**
 * Export as Server Component alternative for App Router
 */
export function SchemaScript({ schema }: { schema: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      suppressHydrationWarning
    />
  );
}
