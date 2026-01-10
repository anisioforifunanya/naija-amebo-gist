import HeadlineBanner from '@/components/HeadlineBanner'
import NewsCard from '@/components/NewsCard'
import extendedNews from '@/data/extended-news.json'

export const metadata = {
  title: 'Exclusive Interviews - Naija Amebo Gist',
  description: 'Exclusive interviews with celebrities, musicians, and African influencers',
}

export default function InterviewsPage() {
  const interviews = extendedNews
    .filter((item: any) => 
      item.contentType === 'interview' && 
      item.slug && 
      typeof item.isBreakinNews === 'boolean' &&
      item.publishedAt
    )
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      image: item.image,
      category: item.category,
      isBreakinNews: item.isBreakinNews || false,
      publishedAt: item.publishedAt,
    })) as any[]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            🎤 Exclusive Interviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Get up close and personal with your favorite celebrities in exclusive sit-down interviews
          </p>
        </div>

        {/* Featured Interviews */}
        {interviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Latest Interviews</h2>
            <HeadlineBanner headlines={interviews.slice(0, 5)} />
          </div>
        )}

        {/* All Interviews */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview: any) => (
              <div key={interview.id}>
                <NewsCard item={{ title: interview.title, description: interview.excerpt, date: interview.publishedAt, image: interview.image, video: interview.videoUrl }} index={interview.id} />
                {interview.interviewee && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                    <p className="text-sm font-semibold">Featuring: {interview.interviewee.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{interview.interviewee.role}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
