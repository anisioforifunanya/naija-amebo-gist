'use client'
import Link from 'next/link'
import { useState } from 'react'
import featuresData from '@/data/features-300.json'

export default function FeaturesWidget() {
  const allFeatures = featuresData.categories.flatMap(cat => cat.features).filter(f => f.status === 'active').slice(0, 6)

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-8 my-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>✨</span>
          <span>Featured Tools & Features</span>
        </h2>
        <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold text-sm">
          View All 300+ →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {allFeatures.map((feature) => (
          <Link
            key={feature.id}
            href={feature.href}
            className="group relative p-4 rounded-lg bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-transparent hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{feature.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                  {feature.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/features"
          className="inline-block px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Explore All 300+ Features
        </Link>
      </div>
    </div>
  )
}
