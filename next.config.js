/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-UA-Compatible',
          value: 'IE=edge',
        },
      ],
    },
  ],
}

module.exports = nextConfig