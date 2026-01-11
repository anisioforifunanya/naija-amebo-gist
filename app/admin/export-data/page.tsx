'use client'

import { useState, useEffect } from 'react'

export default function ExportData() {
  const [data, setData] = useState<any>(null)
  const [cloudinaryCount, setCloudinaryCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('naijaAmeboNews')
    if (stored) {
      const newsData = JSON.parse(stored)
      setData(newsData)
      
      // Count Cloudinary images
      const count = newsData.filter((item: any) => 
        item.image && item.image.includes('cloudinary.com')
      ).length
      setCloudinaryCount(count)
    }
  }, [])

  const downloadJSON = () => {
    if (!data) return
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = 'migrated-news-data.json'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
          <span className="mr-2">← Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Main Content with Top Padding */}
      <div className="max-w-2xl mx-auto pt-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">📊 Data Export</h1>
          
          {data ? (
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                <p className="text-lg font-semibold text-blue-900">
                  Total Items: {data.length}
                </p>
                <p className="text-blue-800">
                  ☁️ Cloudinary Images: {cloudinaryCount}/{data.length}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Images Summary:</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.map((item: any, idx: number) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{idx + 1}. {item.title}</p>
                      {item.image ? (
                        <p className="text-sm text-gray-600 break-all">
                          {item.image.includes('cloudinary') 
                            ? '✅ Cloudinary' 
                            : '⚠️ ' + item.image.substring(0, 50) + '...'}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">❌ No image</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadJSON}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mb-4"
              >
                📥 Download JSON
              </button>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-900">
                  <strong>Note:</strong> If Cloudinary images show 0, the migration may not have completed. 
                  Copy the JSON data above and share with assistant.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">No data found in localStorage</p>
          )}
        </div>
      </div>
    </div>
  )
}
