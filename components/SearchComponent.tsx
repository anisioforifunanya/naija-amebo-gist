'use client'
import { useState, useEffect } from 'react'

interface SearchResult {
  type: 'user' | 'admin' | 'groupchat' | 'channel' | 'news' | 'static'
  id: string
  title: string
  subtitle?: string
  description?: string
  category?: string
  avatar?: string
  url?: string
}

const STATIC_PAGES = [
  { id: 'privacy', title: 'Privacy Policy', url: '/privacy-policy', category: 'Legal' },
  { id: 'terms', title: 'Terms & Copyright', url: '/terms-copyright', category: 'Legal' },
  { id: 'about', title: 'About Us', url: '/about-us', category: 'Info' },
  { id: 'contact', title: 'Contact', url: '/contact', category: 'Info' }
]

export default function SearchComponent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Perform search via API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const query = searchQuery.toLowerCase().replace(/^@/, '')

    console.log('🔍 Searching for:', query)

    // Call API to search
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(response => {
        console.log('📊 API Response Status:', response.status)
        return response.json()
      })
      .then(data => {
        console.log('📊 API Response Data:', data)
        if (data.results && Array.isArray(data.results)) {
          console.log(`✅ Found ${data.results.length} results`)
          
          // Combine API results with static pages
          const apiResults: SearchResult[] = data.results.map((result: any) => ({
            type: result.type,
            id: result.id,
            title: result.title || result.name,
            subtitle: result.subtitle || result.username || result.email,
            description: result.description || result.bio,
            category: result.category,
            avatar: result.avatar,
            url: result.url
          }))
          
          const staticResults = STATIC_PAGES.filter(page =>
            page.title.toLowerCase().includes(query) || page.category.toLowerCase().includes(query)
          ).map(page => ({
            type: 'static' as const,
            id: page.id,
            title: page.title,
            category: page.category,
            url: page.url
          }))
          
          setResults([...apiResults, ...staticResults])
        } else {
          console.warn('⚠️ No results array in response')
          setResults([])
        }
        setIsSearching(false)
      })
      .catch(error => {
        console.error('❌ Search error:', error)
        setIsSearching(false)
      })
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Section */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Escape') {
                  onClose()
                }
              }}
              placeholder="Search users, groups, channels, news..."
              className="w-full pl-12 pr-16 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-900 dark:text-blue-300">
            Query: "{searchQuery}" | Results: {results.length} | Searching: {isSearching ? 'Yes' : 'No'}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    if (result.url) {
                      console.log('Navigating to:', result.url)
                      window.location.href = result.url
                    }
                  }}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                      {result.type === 'user' && '👤'}
                      {result.type === 'admin' && '🛡️'}
                      {result.type === 'groupchat' && '👥'}
                      {result.type === 'channel' && '#'}
                      {result.type === 'news' && '📰'}
                      {result.type === 'static' && '📄'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {result.type === 'user' ? 'User' :
                           result.type === 'admin' ? 'Admin' :
                           result.type === 'groupchat' ? 'Group' :
                           result.type === 'channel' ? 'Channel' :
                           result.type === 'news' ? 'News' :
                           'Page'}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
