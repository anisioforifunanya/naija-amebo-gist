import Poll from '@/components/Poll'
import polls from '@/data/polls.json'

export const metadata = {
  title: 'Polls & Voting - Naija Amebo Gist',
  description: 'Engage with fans! Vote on "Who wore it better?", best artist, and more',
}

export default function PollsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            🗳️ Polls & Fan Voting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Vote on your favorite celebrity moments, fashion choices, and entertainment trends!
          </p>
        </div>

        {/* All Polls */}
        <div className="space-y-8">
          {polls.map((poll: any) => (
            <Poll key={poll.id} {...poll} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800 text-center">
          <h2 className="text-2xl font-bold mb-4">Have a poll idea?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Send us your poll ideas and we'll feature them here!
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all">
            Suggest a Poll
          </button>
        </div>
      </div>
    </main>
  )
}
