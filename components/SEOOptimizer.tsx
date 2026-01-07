'use client';

/**
 * SEO Optimization Component
 * Adds structured data and meta tags to pages
 */

import Script from 'next/script';
import { useEffect } from 'react';
import { organizationSchema, localBusinessSchema, websiteSchema, createBreadcrumbSchema } from '@/lib/schema';
import { SEO_CONFIG } from '@/lib/seo-config';

interface SEOOptimizerProps {
  pageType?: 'homepage' | 'category' | 'article' | 'default';
  customSchema?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SEOOptimizer({
  pageType = 'default',
  customSchema,
  breadcrumbs,
}: SEOOptimizerProps) {
  useEffect(() => {
    // Add preconnect to external domains for better performance
    const links = document.querySelectorAll('link[rel="preconnect"]');
    if (links.length === 0) {
      const preconnectGoogle = document.createElement('link');
      preconnectGoogle.rel = 'preconnect';
      preconnectGoogle.href = 'https://www.google.com';
      document.head.appendChild(preconnectGoogle);

      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = 'https://www.google-analytics.com';
      document.head.appendChild(dnsPrefetch);
    }
  }, []);

  // Determine which schema to use
  let schema = customSchema;
  if (!schema) {
    if (pageType === 'homepage') {
      schema = organizationSchema;
    } else if (pageType === 'category') {
      schema = localBusinessSchema;
    }
  }

  // Add breadcrumb schema if provided
  const breadcrumbSchema = breadcrumbs ? createBreadcrumbSchema(breadcrumbs) : null;

  return (
    <>
      {/* Organization Schema */}
      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
        suppressHydrationWarning
      />

      {/* Local Business Schema for Nigerian presence */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
        suppressHydrationWarning
      />

      {/* Website Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
        suppressHydrationWarning
      />

      {/* Custom Schema */}
      {schema && (
        <Script
          id="custom-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
          suppressHydrationWarning
        />
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
          suppressHydrationWarning
        />
      )}

      {/* Google Analytics for tracking (add your tracking ID) */}
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"
      />
      <Script
        id="google-analytics-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'YOUR_GA_ID', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
        suppressHydrationWarning
      />

      {/* Performance optimizations */}
      <Script
        id="perf-observer"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            // Web Vitals tracking
            if ('web-vital' in window) {
              window.addEventListener('web-vital', (event) => {
                console.log('Web Vital:', event.detail);
              });
            }
          `,
        }}
        suppressHydrationWarning
      />
    </>
  );
}
