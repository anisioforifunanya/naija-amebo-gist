'use client'
import Link from 'next/link'
import { useState } from 'react'
import featuresData from '@/data/features-300.json'

export default function FeaturesHub() {
  const [selectedCategory, setSelectedCategory] = useState(featuresData.categories[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const currentCategory = featuresData.categories.find(c => c.id === selectedCategory)
  
  const filteredFeatures = currentCategory?.features.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            300+ Features
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Explore all the powerful tools and features available on Naija Amebo Gist</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
              {featuresData.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setSearchQuery('')
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-semibold text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentCategory?.icon} {currentCategory?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{currentCategory?.description}</p>
            </div>

            {filteredFeatures.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredFeatures.map((feature) => (
                  <Link
                    key={feature.id}
                    href={feature.href}
                    className="group relative p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{feature.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {feature.name}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500">#{feature.id}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        feature.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {feature.status === 'active' ? '✓ Active' : '⏳ Coming Soon'}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No features found matching your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16 pt-16 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">300+</div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Total Features</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {featuresData.categories.reduce((acc, cat) => acc + cat.features.filter(f => f.status === 'active').length, 0)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Active Features</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {featuresData.categories.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Categories</p>
          </div>
        </div>
      </div>
    </div>
  )
}
