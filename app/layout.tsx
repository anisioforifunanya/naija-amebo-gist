import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { BrowserCompatibilityInit } from '../components/BrowserCompatibilityInit'
import { ThemeProvider } from '../lib/theme'
import ClientSideFeatures from '../components/ClientSideFeatures'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'Naija Amebo Gist - Nigeria\'s Top Celebrity News & Gossip Platform',
  description: 'Get the latest celebrity news, gossip, viral stories, and entertainment updates from Nigeria and Africa. Breaking news on actors, musicians, influencers, and more.',
  keywords: 'celebrity news Nigeria, gossip, viral stories, entertainment, Naija gossip, celebrity scandals, African celebrities',
  authors: [{ name: 'Naija Amebo Gist Team' }],
  icons: {
    icon: '/logo.svg',
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    title: 'Naija Amebo Gist - Nigeria\'s Top Celebrity News & Gossip Platform',
    description: 'Get the latest celebrity news, gossip, viral stories, and entertainment updates from Nigeria and Africa.',
    url: 'https://naijaamebogist.com',
    siteName: 'Naija Amebo Gist',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Naija Amebo Gist',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naija Amebo Gist - Nigeria\'s Top Celebrity News & Gossip Platform',
    description: 'Get the latest celebrity news, gossip, viral stories, and entertainment updates from Nigeria and Africa.',
    images: ['/og-image.jpg'],
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
    <html lang="en">
      <head>
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
          <Header />
          <main className="pt-20">{children}</main>
          <Footer />
          <ClientSideFeatures />
        </ThemeProvider>
      </body>
    </html>
  )
}