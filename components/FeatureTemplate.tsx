'use client'
import Link from 'next/link'

interface FeaturePageProps {
  number: number
  title: string
  icon: string
  description: string
  features: string[]
  content?: React.ReactNode
}

export function FeaturePageTemplate({ number, title, icon, description, features, content }: FeaturePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/features" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-6 inline-flex items-center">
          ← Back to Features
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {icon} {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Feature #{number}</p>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {description}
        </p>

        {/* Custom Content */}
        {content && (
          <div className="mb-12">
            {content}
          </div>
        )}

        {/* Features List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to use this feature?</h3>
          <p className="mb-6">Explore all available features and enhance your experience</p>
          <Link href="/features" className="inline-block bg-white text-purple-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all">
            View All Features
          </Link>
        </div>
      </div>
    </div>
  )
}
