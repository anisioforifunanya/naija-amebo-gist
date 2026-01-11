"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CheckImageUrls() {
  const [articles, setArticles] = useState<any[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [storageSize, setStorageSize] = useState('0 MB')

  useEffect(() => {
    const newsData = localStorage.getItem('naijaAmeboNews')
    if (newsData) {
      const parsed = JSON.parse(newsData)
      setArticles(parsed)
      
      // Check for problems
      const newWarnings: string[] = []
      
      // Check localStorage size
      const sizeInBytes = new Blob([newsData]).size
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
      setStorageSize(sizeInMB + ' MB')
      
      if (parseFloat(sizeInMB) > 4) {
        newWarnings.push(`⚠️ localStorage is getting full: ${sizeInMB}MB / ~5MB limit`)
      }
      
      // Check each article's image
      parsed.forEach((article: any, idx: number) => {
        if (!article.image) {
          newWarnings.push(`❌ Article "${article.title}" has NO image`)
        } else if (article.image.startsWith('data:')) {
          newWarnings.push(`⚠️ Article "${article.title}" has base64 image (not Cloudinary!) - This could disappear`)
        } else if (!article.image.includes('cloudinary.com') && !article.image.includes('unsplash.com')) {
          newWarnings.push(`⚠️ Article "${article.title}" image is NOT from Cloudinary`)
        }
      })
      
      setWarnings(newWarnings)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900">🔍 Image URL Diagnostic Report</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Storage Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">localStorage Used</div>
              <div className="text-3xl font-bold text-blue-600">{storageSize}</div>
              <div className="text-xs text-gray-500">Limit: ~5 MB</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Articles</div>
              <div className="text-3xl font-bold text-green-600">{articles.length}</div>
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-red-700">⚠️ WARNINGS DETECTED</h2>
            <ul className="space-y-2">
              {warnings.map((warning, idx) => (
                <li key={idx} className="text-red-700 font-semibold">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length === 0 && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-700">✓ All Good!</h2>
            <p className="text-green-700">All articles have valid Cloudinary images</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6 bg-gray-100 border-b">Articles Image URLs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4 text-left">Article Title</th>
                  <th className="p-4 text-left">Image Source</th>
                  <th className="p-4 text-left">URL Type</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, idx) => {
                  let status = '❌ Missing'
                  let urlType = 'None'
                  let color = 'bg-red-100'
                  
                  if (article.image) {
                    if (article.image.startsWith('data:')) {
                      status = '⚠️ Base64 (Not Permanent)'
                      urlType = 'Base64'
                      color = 'bg-yellow-100'
                    } else if (article.image.includes('cloudinary.com') || article.image.includes('res.cloudinary.com')) {
                      status = '✓ Cloudinary (Permanent)'
                      urlType = 'Cloudinary'
                      color = 'bg-green-100'
                    } else if (article.image.includes('unsplash.com')) {
                      status = '✓ Unsplash (Permanent)'
                      urlType = 'External'
                      color = 'bg-blue-100'
                    } else {
                      status = '⚠️ Unknown'
                      urlType = 'Other'
                      color = 'bg-yellow-100'
                    }
                  }
                  
                  return (
                    <tr key={idx} className={`border-b ${color} hover:bg-opacity-80 transition`}>
                      <td className="p-4 font-semibold max-w-xs truncate">
                        {article.title}
                      </td>
                      <td className="p-4 text-xs font-mono max-w-md truncate" title={article.image}>
                        {article.image ? (
                          article.image.startsWith('data:') ? (
                            <span className="text-red-700">Base64 data ({(article.image.length / 1024).toFixed(0)}KB)</span>
                          ) : (
                            <a href={article.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                              {article.image}
                            </a>
                          )
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="p-4 font-semibold">{urlType}</td>
                      <td className="p-4 font-semibold">{status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">📋 What This Means</h3>
          <ul className="space-y-3 text-blue-900">
            <li>
              <strong>✓ Cloudinary URLs:</strong> These are PERMANENT and stored on Cloudinary servers. They will NEVER disappear.
            </li>
            <li>
              <strong>⚠️ Base64 Images:</strong> These are stored IN localStorage as text. If localStorage is cleared or full, they disappear.
            </li>
            <li>
              <strong>❌ Missing Images:</strong> Articles without images will show a broken image icon.
            </li>
            <li>
              <strong>localStorage Size:</strong> Each MB of base64 images takes up storage space. After ~5MB, you can't add more.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
