'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AlternatingLogo from './AlternatingLogo'
import SocialBar from './SocialBar'
import { debugAddSampleUsers, debugAddSampleGroupChats } from './DebugComponent'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('')

  // Check if user is logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
      console.log('✅ Header loaded - Users in localStorage:', users.length)
      if (users.length === 0) {
        console.log('📝 Populating sample data...')
        debugAddSampleUsers()
        debugAddSampleGroupChats()
        console.log('✅ Sample data populated')
      } else {
        console.log('📦 Users found:', users.map((u: any) => `${u.firstName} ${u.lastName}`))
      }

      // Check for logged-in user
      const checkLoginStatus = () => {
        const userSession = localStorage.getItem('naijaAmeboCurrentUser')
        const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
        
        if (userSession) {
          const user = JSON.parse(userSession)
          setIsLoggedIn(true)
          setCurrentUserName(user.firstName || user.username || 'User')
        } else if (adminSession) {
          const admin = JSON.parse(adminSession)
          setIsLoggedIn(true)
          setCurrentUserName(admin.username || 'Admin')
        } else {
          setIsLoggedIn(false)
          setCurrentUserName('')
        }
      }

      // Check on initial load
      checkLoginStatus()

      // Listen for storage changes (e.g., when login happens in another tab or on another page)
      window.addEventListener('storage', checkLoginStatus)
      
      return () => {
        window.removeEventListener('storage', checkLoginStatus)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('naijaAmeboCurrentUser')
    localStorage.removeItem('naijaAmeboCurrentAdmin')
    setIsLoggedIn(false)
    setCurrentUserName('')
    setIsMenuOpen(false)
    // Redirect to home
    window.location.href = '/'
  }

  // Poll for login status changes (to detect logins that happen on the same page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        const userSession = localStorage.getItem('naijaAmeboCurrentUser')
        const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
        
        const newLoggedInState = !!(userSession || adminSession)
        const newUserName = userSession 
          ? JSON.parse(userSession).firstName || JSON.parse(userSession).username || 'User'
          : adminSession 
          ? JSON.parse(adminSession).username || 'Admin'
          : ''

        if (newLoggedInState !== isLoggedIn || newUserName !== currentUserName) {
          setIsLoggedIn(newLoggedInState)
          setCurrentUserName(newUserName)
        }
      }, 500) // Check every 500ms

      return () => clearInterval(interval)
    }
  }, [isLoggedIn, currentUserName])

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-center h-12">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <AlternatingLogo className="relative h-8 w-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient group-hover:scale-105 transition-transform duration-300">
              Naija Amebo Gist
            </span>
          </Link>
        </div>

        {/* Social Media Bar */}
        <SocialBar />
      </div>
    </header>
  )
}