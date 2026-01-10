'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in as admin or super admin
    const adminData = typeof window !== 'undefined' 
      ? localStorage.getItem('naijaAmeboCurrentAdmin')
      : null
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData)
        // Show if user is admin or super admin
        if (admin && (admin.role === 'admin' || admin.isSuperAdmin)) {
          setIsAdmin(true)
        }
      } catch (error) {
        console.warn('Error parsing admin data:', error)
      }
    }
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null

  if (!isAdmin) return null

  return (
    <div className="mb-12 relative z-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to Dashboard</span>
      </Link>
    </div>
  )
}
