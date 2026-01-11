"use client";
import { useState } from 'react'
import Link from 'next/link'

export default function MigrateToFirebase() {
  const [migrationStatus, setMigrationStatus] = useState<string>('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)

  const handleMigration = async () => {
    setIsMigrating(true)
    setMigrationStatus('Starting migration...')
    setResult(null)

    try {
      // Get articles from localStorage
      const localStorageNews = localStorage.getItem('naijaAmeboNews')
      if (!localStorageNews) {
        setMigrationStatus('No articles found in localStorage')
        setIsMigrating(false)
        return
      }

      const articles = JSON.parse(localStorageNews)
      const errors: string[] = []
      let successCount = 0
      let failedCount = 0

      setMigrationStatus(`Found ${articles.length} articles to migrate...`)

      // Migrate each article
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i]
        setMigrationStatus(`Migrating article ${i + 1}/${articles.length}: "${article.title}"`)

        try {
          const response = await fetch('/api/articles/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: article.title,
              description: article.description,
              category: article.category,
              submitterName: article.submittedBy || 'Anonymous',
              submitterEmail: article.submitterEmail || '',
              image: article.image,
              video: article.video,
              hashtags: article.hashtags || [],
              socialCaption: article.socialCaption || '',
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            failedCount++
            const error = await response.json()
            errors.push(`Article "${article.title}": ${error.error}`)
          }
        } catch (error) {
          failedCount++
          errors.push(`Article "${article.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setMigrationStatus('Migration complete!')
      setResult({ success: successCount, failed: failedCount, errors })
    } catch (error) {
      setMigrationStatus('Migration failed')
      setResult({
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">📦 Migrate Articles to Firebase</h1>
          
          <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">What This Does:</h2>
            <ul className="space-y-2 text-blue-900">
              <li>✓ Takes all articles from localStorage (browser storage)</li>
              <li>✓ Moves them to Firebase Firestore (cloud database)</li>
              <li>✓ Your articles will be permanent and accessible from any device</li>
              <li>✓ No more 5MB storage limit!</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Important:</h2>
            <p className="text-yellow-900">
              This process will read all articles from your browser's localStorage and save them to Firebase database. 
              Make sure you have a stable internet connection.
            </p>
          </div>

          <button
            onClick={handleMigration}
            disabled={isMigrating}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {isMigrating ? '🔄 Migrating...' : '🚀 Start Migration'}
          </button>

          {migrationStatus && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm font-mono text-gray-700">{migrationStatus}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-900 mb-4">Migration Results:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-green-700">Successfully Migrated</div>
                    <div className="text-4xl font-bold text-green-600">{result.success}</div>
                  </div>
                  <div>
                    <div className="text-sm text-red-700">Failed</div>
                    <div className="text-4xl font-bold text-red-600">{result.failed}</div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-red-900 mb-4">Errors:</h3>
                  <ul className="space-y-2">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="text-red-700 text-sm">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.success > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-300 p-6 rounded-lg">
                  <p className="text-indigo-900 font-semibold">
                    ✓ {result.success} articles successfully migrated to Firebase!
                  </p>
                  <p className="text-indigo-700 text-sm mt-2">
                    Your articles are now stored permanently in the cloud database and can be accessed from any device.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
