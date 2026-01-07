/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for better SEO and performance
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression for better performance
  compress: true,
  
  // Remove powered-by header for security
  poweredByHeader: false,
  
  // SEO optimizations
  reactStrictMode: false,
  
  // HTTP headers for SEO and security
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-UA-Compatible',
          value: 'IE=edge',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // Allow crawlers
        {
          key: 'Permissions-Policy',
          value: 'geolocation=(), microphone=(), camera=()',
        },
      ],
    },
    // Sitemap and robots.txt should be publicly accessible
    {
      source: '/sitemap.xml',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/xml; charset=utf-8',
        },
      ],
    },
    {
      source: '/robots.txt',
      headers: [
        {
          key: 'Content-Type',
          value: 'text/plain; charset=utf-8',
        },
      ],
    },
  ],
  
  // Redirects for SEO
  redirects: async () => [
    // Redirect common variations to canonical URL
    {
      source: '/news/index',
      destination: '/news',
      permanent: true,
    },
  ],
  
  // Build optimization
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig