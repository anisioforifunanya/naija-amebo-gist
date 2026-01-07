/**
 * Dynamic Sitemap for Naija Amebo Gist
 * Generates sitemap.xml for all pages
 * Helps search engines discover and index all content
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Base URL
    const baseUrl = 'https://amebo.org';

    // Define static pages with priority
    const staticPages = [
      {
        url: '/',
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/breaking-news',
        changefreq: 'hourly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/trending-stories',
        changefreq: 'hourly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/celebrity-news',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/entertainment',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/gossip',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/viral-content',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/about',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/contact',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/privacy-policy',
        changefreq: 'monthly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      },
      {
        url: '/terms',
        changefreq: 'monthly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      },
    ];

    // Generate dynamic news article URLs (25 items based on homepage)
    const newsPages = Array.from({ length: 25 }, (_, i) => ({
      url: `/news/${i}`,
      changefreq: 'weekly' as const,
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }));

    // Combine all pages
    const allPages = [...staticPages, ...newsPages];

    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '         xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
    xml += '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    xml += '         xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    allPages.forEach((page) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
