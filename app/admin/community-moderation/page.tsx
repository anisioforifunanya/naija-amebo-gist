'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CommunityModeration() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user or admin is logged in
    const userSession = localStorage.getItem('naijaAmeboCurrentUser')
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
    
    if (!userSession && !adminSession) {
      window.location.href = '/login'
      return
    }

    // Check if admin
    if (adminSession) {
      setIsAdmin(true)
    }

    // Redirect to community page for moderation
    const timeout = setTimeout(() => {
      window.location.href = '/community'
    }, 2000)

    setIsLoading(false)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
          <span className="mr-2">← Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community Moderation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to community chat...
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/community"
            className="inline-flex w-full justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Go to Community Chat
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex w-full justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin Dashboard
            </Link>
          )}

          {!isAdmin && (
            <Link
              href="/"
              className="inline-flex w-full justify-center items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
