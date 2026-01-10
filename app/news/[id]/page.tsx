import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DashboardButton from '@/components/DashboardButton'
import extendedNews from '@/data/extended-news.json'

interface NewsDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata(
  { params }: NewsDetailPageProps
): Promise<Metadata> {
  const article = extendedNews.find(
    (item: any) => item.id === parseInt(params.id) || item.slug === params.id
  )

  if (!article) {
    return {
      title: 'Article Not Found | Naija Amebo Gist',
      description: 'The article you are looking for could not be found.',
    }
  }

  const title = `${article.title} | Naija Amebo Gist`
  const description = article.description || article.excerpt || 'Read the latest news on Naija Amebo Gist'
  const url = `https://amebo.org/news/${article.id}`
  const image = article.image || 'https://amebo.org/og-image.jpg'
  const publishedDate = article.publishedAt || article.date

  return {
    title,
    description,
    keywords: [
      article.title,
      article.category,
      'Nigeria news',
      'Nigerian entertainment',
      'celebrity news',
      'gossip',
      'Naija gist',
    ],
    authors: [{ name: article.submittedBy || 'Naija Amebo Gist' }],
    creator: article.submittedBy || 'Naija Amebo Gist',
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
      publishedTime: publishedDate,
      authors: [article.submittedBy || 'Naija Amebo Gist'],
      tags: (article.hashtags as string[]) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@naijaambogist',
    },
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const article = extendedNews.find(
    (item: any) => item.id === parseInt(params.id) || item.slug === params.id
  )

  if (!article) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description || article.excerpt,
    image: article.image || 'https://amebo.org/og-image.jpg',
    datePublished: article.publishedAt || article.date,
    dateModified: article.updatedAt || article.publishedAt || article.date,
    author: {
      '@type': 'Person',
      name: article.submittedBy || 'Naija Amebo Gist',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Naija Amebo Gist',
      logo: {
        '@type': 'ImageObject',
        url: 'https://amebo.org/logo.png',
        width: 256,
        height: 256,
      }
    },
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <DashboardButton />
        
        <article className="mt-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link href={`/${article.category}`} className="hover:text-purple-600 capitalize">
              {article.category?.replace('-', ' ')}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate">{article.title}</span>
          </nav>

          {/* Hero Image */}
          {article.image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>📅 {new Date(article.publishedAt || article.date).toLocaleDateString()}</span>
              <span>✍️ By {article.submittedBy || 'Naija Amebo Gist'}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded capitalize">
                {article.category?.replace('-', ' ')}
              </span>
            </div>

            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.hashtags.map((tag: string, idx: number) => (
                  <a
                    key={idx}
                    href={`/?search=${encodeURIComponent(tag)}`}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose dark:prose-invert max-w-none mb-8">
            {article.description && (
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {article.description}
              </p>
            )}
            
            {article.excerpt && article.excerpt !== article.description && (
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-purple-500 pl-4">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Share buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">📢 Share this article:</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://amebo.org/news/${article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://amebo.org/news/${article.id}`)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://amebo.org/news/${article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </article>

        {/* Back button */}
        <div className="mt-8">
          <Link
            href={`/${article.category}`}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
          >
            ← Back to {article.category?.replace('-', ' ')}
          </Link>
        </div>
      </div>
    </main>
  )
}
