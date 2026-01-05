'use client'
import Link from 'next/link'

interface CelebrityComparison {
  name: string
  netWorth: string
  awards: number
  followers: string
  relevance: number
}

const celebrities: CelebrityComparison[] = [
  { name: 'Wizkid', netWorth: '$20M', awards: 45, followers: '14.5M', relevance: 95 },
  { name: 'Davido', netWorth: '$25M', awards: 38, followers: '19.2M', relevance: 98 },
  { name: 'Tiwa Savage', netWorth: '$18M', awards: 32, followers: '8.1M', relevance: 92 },
  { name: 'CKay', netWorth: '$8M', awards: 15, followers: '6.3M', relevance: 88 },
]

export default function CelebComparison() {
  const [selected, setSelected] = React.useState<[CelebrityComparison | null, CelebrityComparison | null]>([celebrities[0], celebrities[1]])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/features" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-6 inline-flex items-center">
          ← Back to Features
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">⚖️ Celebrity Comparison Tool</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Compare celebrities side-by-side to see net worth, awards, followers, and popularity metrics.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Comparison Cards */}
          {[0, 1].map((index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <select
                value={selected[index]?.name || ''}
                onChange={(e) => {
                  const celeb = celebrities.find(c => c.name === e.target.value)
                  if (celeb) {
                    const newSelected = [...selected] as [CelebrityComparison | null, CelebrityComparison | null]
                    newSelected[index] = celeb
                    setSelected(newSelected)
                  }
                }}
                className="w-full mb-6 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {celebrities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              {selected[index] && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selected[index]!.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Net Worth</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected[index]!.netWorth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Awards</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected[index]!.awards} 🏆</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Followers</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected[index]!.followers}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Popularity Score</label>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${selected[index]!.relevance}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">{selected[index]!.relevance}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        {selected[0] && selected[1] && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Metric</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">{selected[0].name}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">{selected[1].name}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Net Worth</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[0].netWorth}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[1].netWorth}</td>
                  <td className="px-6 py-4 font-bold">
                    {parseInt(selected[1].netWorth) > parseInt(selected[0].netWorth) ? '🎉 ' + selected[1].name : '🎉 ' + selected[0].name}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Awards</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[0].awards}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[1].awards}</td>
                  <td className="px-6 py-4 font-bold">
                    {selected[1].awards > selected[0].awards ? '🎉 ' + selected[1].name : '🎉 ' + selected[0].name}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Popularity</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[0].relevance}%</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{selected[1].relevance}%</td>
                  <td className="px-6 py-4 font-bold">
                    {selected[1].relevance > selected[0].relevance ? '🎉 ' + selected[1].name : '🎉 ' + selected[0].name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Features List */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About This Feature</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-center space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Compare multiple celebrities side-by-side</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>View net worth, awards, and followers</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Real-time popularity scoring</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Easy-to-read comparison tables</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
