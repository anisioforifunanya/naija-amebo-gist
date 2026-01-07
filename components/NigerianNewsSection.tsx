'use client'

import AutomatedNewsDisplay from './AutomatedNewsDisplay'

export default function NigerianNewsSection() {
  return (
    <div className="w-full bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <AutomatedNewsDisplay
          limit={6}
          category="Nigerian News"
          title="🇳🇬 Nigerian News"
        />
      </div>
    </div>
  )
}
