import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { BrowserCompatibilityInit } from '../components/BrowserCompatibilityInit'
import { ThemeProvider } from '../lib/theme'
import ClientSideFeatures from '../components/ClientSideFeatures'
import { NewsSchedulerInit } from '../components/NewsSchedulerInit'
import { SEO_CONFIG } from '@/lib/seo-config'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: SEO_CONFIG.themeColor,
}

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.domain),
  title: {
    template: '%s | Naija Amebo Gist',
    default: 'Naija Amebo Gist - Nigeria\'s #1 Celebrity News, Gossip & Entertainment Platform',
  },
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: SEO_CONFIG.author }],
  creator: SEO_CONFIG.organization.name,
  publisher: SEO_CONFIG.organization.name,
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  alternates: {
    canonical: SEO_CONFIG.domain,
    languages: {
      'en-NG': `${SEO_CONFIG.domain}/en-NG`,
      'en-US': `${SEO_CONFIG.domain}/en-US`,
      'en-GB': `${SEO_CONFIG.domain}/en-GB`,
    },
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.domain,
    siteName: SEO_CONFIG.siteName,
    title: 'Naija Amebo Gist - Nigeria\'s #1 Celebrity News & Gossip Platform',
    description: SEO_CONFIG.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Naija Amebo Gist - Celebrity News from Nigeria',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONFIG.socialMedia.twitter,
    creator: SEO_CONFIG.socialMedia.twitter,
    title: 'Naija Amebo Gist - Nigeria\'s #1 Celebrity News Platform',
    description: SEO_CONFIG.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Cache control meta tags for fresh content across all browsers */}
        <meta httpEquiv="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="pragma" content="no-cache" />
        <meta httpEquiv="expires" content="0" />
        {/* Theme initialization script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = stored === 'dark' || (stored === null && prefersDark);
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Naija Amebo Gist",
              "url": "https://naijaamebogist.com",
              "logo": "https://naijaamebogist.com/logo.png",
              "sameAs": [
                "https://www.instagram.com/naijaamebogist",
                "https://chat.whatsapp.com/DOHmbRW1PlNHMtB8ijVLFC"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Naija Amebo Gist",
              "url": "https://naijaamebogist.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://naijaamebogist.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <BrowserCompatibilityInit />
          <NewsSchedulerInit />
          <Header />
          <main className="pt-20 pb-32">{children}</main>
          <Footer />
          <BottomNav />
          <ClientSideFeatures />
        </ThemeProvider>
      </body>
    </html>
  )
}