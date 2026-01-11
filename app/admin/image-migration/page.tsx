'use client'

import { useState, useEffect } from 'react'

interface NewsItem {
  id: string | number
  title: string
  image?: string
  submittedBy?: string
  [key: string]: any
}

interface MigrationStatus {
  id: string | number
  title: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  oldUrl?: string
  newUrl?: string
  error?: string
}

export default function ImageMigration() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [migrationStatuses, setMigrationStatuses] = useState<MigrationStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)

  // Extract news from localStorage
  useEffect(() => {
    const existingNews = localStorage.getItem('naijaAmeboNews')
    if (existingNews) {
      const newsArray = JSON.parse(existingNews)
      setNewsItems(newsArray)
      setMigrationStatuses(
        newsArray.map((item: NewsItem) => ({
          id: item.id,
          title: item.title,
          status: 'pending',
          oldUrl: item.image,
        }))
      )
    }
    setIsLoading(false)
  }, [])

  // Upload single image to Cloudinary via API
  const uploadImageToCloudinary = async (
    base64String: string,
    fileName: string
  ): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('base64', base64String)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      throw new Error(
        `Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Start migration
  const handleMigrate = async () => {
    setIsMigrating(true)
    const updatedStatuses = [...migrationStatuses]
    let successCount = 0

    for (let i = 0; i < newsItems.length; i++) {
      const item = newsItems[i]

      // Skip if no image or already a URL
      if (!item.image || item.image.startsWith('http')) {
        updatedStatuses[i].status = 'success'
        updatedStatuses[i].newUrl = item.image
        continue
      }

      // Update status
      updatedStatuses[i].status = 'uploading'
      setMigrationStatuses([...updatedStatuses])
      setMigrationProgress(((i + 1) / newsItems.length) * 100)

      try {
        const fileName = `news-${item.id}-${Date.now()}.jpg`
        const newUrl = await uploadImageToCloudinary(item.image, fileName)

        updatedStatuses[i].status = 'success'
        updatedStatuses[i].newUrl = newUrl
        successCount++
      } catch (error) {
        updatedStatuses[i].status = 'error'
        updatedStatuses[i].error = error instanceof Error ? error.message : 'Unknown error'
      }

      setMigrationStatuses([...updatedStatuses])
    }

    setIsMigrating(false)
    setMigrationProgress(100)

    // Show summary
    alert(
      `Migration complete!\n✅ Uploaded: ${successCount}/${newsItems.length}\nCheck the results below.`
    )
  }

  // Save migrated data
  const handleSaveData = () => {
    const updatedNews = newsItems.map((item, index) => {
      if (migrationStatuses[index].newUrl) {
        return {
          ...item,
          image: migrationStatuses[index].newUrl,
        }
      }
      return item
    })

    localStorage.setItem('naijaAmeboNews', JSON.stringify(updatedNews))
    alert('✅ LocalStorage updated with new Cloudinary URLs!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images from localStorage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🖼️ Image Migration Tool</h1>
          <p className="text-gray-600 mb-4">
            Migrate your uploaded images from localStorage to Cloudinary for permanent storage
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-sm text-blue-900">
              <strong>Found {newsItems.length} news items</strong> with images ready to migrate
            </p>
          </div>

          {newsItems.length > 0 ? (
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isMigrating ? `Migrating... ${Math.round(migrationProgress)}%` : '🚀 Start Migration'}
            </button>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-900">
                ⚠️ No images found in localStorage. Have you submitted any news from this browser?
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isMigrating && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${migrationProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600 font-semibold">
              {Math.round(migrationProgress)}% Complete
            </p>
          </div>
        )}

        {/* Migration Results */}
        {migrationStatuses.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Migration Results</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {migrationStatuses.map((status, index) => (
                <div key={status.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{status.title}</p>
                      <p className="text-sm text-gray-500 mt-1">ID: {status.id}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      {status.status === 'pending' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          ⏳ Pending
                        </span>
                      )}
                      {status.status === 'uploading' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full animate-pulse">
                          📤 Uploading
                        </span>
                      )}
                      {status.status === 'success' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          ✅ Success
                        </span>
                      )}
                      {status.status === 'error' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          ❌ Error
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {status.error && (
                    <p className="text-sm text-red-600 mt-2">Error: {status.error}</p>
                  )}

                  {/* URLs */}
                  {status.newUrl && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">New Cloudinary URL:</p>
                      <p className="text-xs text-blue-600 truncate font-mono bg-blue-50 p-2 rounded">
                        {status.newUrl}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            {!isMigrating && migrationStatuses.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {migrationStatuses.filter((s) => s.status === 'success').length}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {migrationStatuses.filter((s) => s.status === 'error').length}
                    </p>
                    <p className="text-sm text-gray-600">Errors</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {migrationStatuses.filter((s) => s.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Not Migrated</p>
                  </div>
                </div>

                {migrationStatuses.filter((s) => s.status === 'success').length > 0 && (
                  <button
                    onClick={handleSaveData}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    💾 Save Updated Data to LocalStorage
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
