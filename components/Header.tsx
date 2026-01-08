'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AlternatingLogo from './AlternatingLogo'
import SearchComponent from './SearchComponent'
import SocialBar from './SocialBar'
import { debugAddSampleUsers, debugAddSampleGroupChats, debugLoadAdmins } from './DebugComponent'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

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

      // Load admins from localStorage or API
      debugLoadAdmins()

      // Check for logged-in user
      const checkLoginStatus = () => {
        const userSession = localStorage.getItem('naijaAmeboCurrentUser')
        const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
        
        if (userSession) {
          const user = JSON.parse(userSession)
          setIsLoggedIn(true)
          setCurrentUserName(user.firstName || user.username || 'User')
          setIsSuperAdmin(false)
        } else if (adminSession) {
          const admin = JSON.parse(adminSession)
          setIsLoggedIn(true)
          setCurrentUserName(admin.username || 'Admin')
          // Check if admin is super admin (has isSuperAdmin flag or role is 'super-admin')
          setIsSuperAdmin(admin.isSuperAdmin === true || admin.role === 'super-admin')
        } else {
          setIsLoggedIn(false)
          setCurrentUserName('')
          setIsSuperAdmin(false)
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
        const newIsSuperAdmin = adminSession 
          ? (JSON.parse(adminSession).isSuperAdmin === true || JSON.parse(adminSession).role === 'super-admin')
          : false

        if (newLoggedInState !== isLoggedIn || newUserName !== currentUserName || newIsSuperAdmin !== isSuperAdmin) {
          setIsLoggedIn(newLoggedInState)
          setCurrentUserName(newUserName)
          setIsSuperAdmin(newIsSuperAdmin)
        }
      }, 500) // Check every 500ms

      return () => clearInterval(interval)
    }
  }, [isLoggedIn, currentUserName, isSuperAdmin])

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-12 gap-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <AlternatingLogo className="relative h-8 w-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient group-hover:scale-105 transition-transform duration-300">
              Naija Amebo Gist
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center flex-1 space-x-1">
            <Link href="/breaking-news" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Breaking News</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
            <Link href="/trending-stories" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Trending</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
            <Link href="/celebrity-news" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Celebrity</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
            <Link href="/entertainment" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Entertainment</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
            <Link href="/gossip" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Gossip</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
            <Link href="/viral-content" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 group">
              <span className="relative z-10">Viral</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-4/5 transition-all duration-300"></div>
            </Link>
          </nav>

          {/* Right Section - Search + Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Search Icon Button - Desktop */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-110"
              aria-label="Open search"
              title="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User Icons - Desktop (Only when logged in) */}
            {isLoggedIn && (
              <div className="hidden lg:flex items-center space-x-1">
                {/* Community Chat Icon */}
                <Link
                  href="/community"
                  className="flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-110"
                  aria-label="Community Chat"
                  title="Community Chat"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </Link>

                {/* User Profile Icon */}
                <button
                  onClick={() => {
                    try {
                      const userSession = localStorage.getItem('naijaAmeboCurrentUser')
                      const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
                      
                      if (userSession) {
                        const user = JSON.parse(userSession)
                        console.log('[Header] Navigating to user profile:', user.id)
                        window.location.href = `/profile/${user.id}`
                      } else if (adminSession) {
                        const admin = JSON.parse(adminSession)
                        console.log('[Header] Navigating to admin profile:', admin.id)
                        window.location.href = `/profile/${admin.id}`
                      } else {
                        console.warn('[Header] No user or admin session found')
                        alert('Please log in first to view your profile')
                      }
                    } catch (error) {
                      console.error('[Header] Error navigating to profile:', error)
                      alert('Error loading profile. Please try again.')
                    }
                  }}
                  className="flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-110"
                  aria-label="My Profile"
                  title="My Profile"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Super Admin News Management Button - Only visible to super admins */}
              {isSuperAdmin && (
                <Link href="/super-admin/news-management" className="relative px-3 py-1 text-xs font-bold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  <span className="relative z-10 flex items-center space-x-1">
                    <span>📰</span>
                    <span>News Management</span>
                  </span>
                </Link>
              )}

              <Link href="/submit-news" className="relative px-3 py-1 text-xs font-bold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform duration-300 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Submit</span>
                </span>
              </Link>
              
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('naijaAmeboCurrentUser')
                    localStorage.removeItem('naijaAmeboCurrentAdmin')
                    setIsLoggedIn(false)
                    setCurrentUserName('')
                    window.location.href = '/'
                  }}
                  className="relative px-3 py-1 text-xs font-bold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md bg-red-600 hover:bg-red-700"
                >
                  <span className="relative z-10">Logout</span>
                </button>
              ) : (
                <>
                  <Link href="/login" className="relative px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105">
                    Login
                  </Link>
                  <Link href="/register" className="relative px-3 py-1 text-xs font-bold border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Join</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-110"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                {isMenuOpen ? (
                  <svg className="w-6 h-6 animate-spin" style={{animationDuration: '0.3s', animationIterationCount: '1'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-1 animate-slideDown">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setIsSearchOpen(true)
                setIsMenuOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </span>
            </button>

            {/* Mobile Navigation Links */}
            <Link href="/breaking-news" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Breaking News</span>
              </span>
            </Link>
            <Link href="/trending-stories" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Trending Stories</span>
              </span>
            </Link>
            <Link href="/celebrity-news" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Celebrity News</span>
              </span>
            </Link>
            <Link href="/entertainment" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Entertainment</span>
              </span>
            </Link>
            <Link href="/gossip" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Gossip</span>
              </span>
            </Link>
            <Link href="/viral-content" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>Viral Content</span>
              </span>
            </Link>
            <Link href="/marketplace" className="relative block px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:translate-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center space-x-2">
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>🛍️ Marketplace</span>
              </span>
            </Link>

            {/* Mobile Action Links */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 px-2">
              {/* Super Admin News Management Button - Only visible to super admins */}
              {isSuperAdmin && (
                <Link href="/super-admin/news-management" className="relative block px-5 py-3 text-white text-center rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl" onClick={() => setIsMenuOpen(false)}>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>📰</span>
                    <span>News Management</span>
                  </span>
                </Link>
              )}

              <Link href="/submit-news" className="relative block px-5 py-3 text-white text-center rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl" onClick={() => setIsMenuOpen(false)}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Submit News</span>
                </span>
              </Link>
              
              {isLoggedIn ? (
                <>
                  <div className="px-5 py-3 text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentUserName}</p>
                  </div>
                  <Link href="/community" className="relative block px-5 py-3 text-center bg-blue-600 text-white rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 hover:bg-blue-700 shadow-lg hover:shadow-xl" onClick={() => setIsMenuOpen(false)}>
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                      <span>Community Chat</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      try {
                        const userSession = localStorage.getItem('naijaAmeboCurrentUser')
                        const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
                        
                        if (userSession) {
                          const user = JSON.parse(userSession)
                          console.log('[Header Mobile] Navigating to user profile:', user.id)
                          window.location.href = `/profile/${user.id}`
                        } else if (adminSession) {
                          const admin = JSON.parse(adminSession)
                          console.log('[Header Mobile] Navigating to admin profile:', admin.id)
                          window.location.href = `/profile/${admin.id}`
                        } else {
                          console.warn('[Header Mobile] No user or admin session found')
                          alert('Please log in first to view your profile')
                        }
                        setIsMenuOpen(false)
                      } catch (error) {
                        console.error('[Header Mobile] Error navigating to profile:', error)
                        alert('Error loading profile. Please try again.')
                        setIsMenuOpen(false)
                      }
                    }}
                    className="relative block w-full px-5 py-3 bg-green-600 text-white text-center rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 hover:bg-green-700 shadow-lg hover:shadow-xl"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>My Profile</span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('naijaAmeboCurrentUser')
                      localStorage.removeItem('naijaAmeboCurrentAdmin')
                      setIsLoggedIn(false)
                      setCurrentUserName('')
                      setIsMenuOpen(false)
                      window.location.href = '/'
                    }}
                    className="relative block w-full px-5 py-3 bg-red-600 text-white text-center rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 hover:bg-red-700 shadow-lg hover:shadow-xl"
                  >
                    <span className="relative z-10">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-5 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="relative block px-5 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 text-center rounded-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Join Community</span>
                  </Link>
                </>
              )}
              
              <Link href="/admin" className="block px-5 py-3 text-center text-gray-600 dark:text-gray-400 font-semibold rounded-lg transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>
                Admin Panel
              </Link>
            </div>
          </div>
        )}

        {/* Social Media Bar */}
        <SocialBar />
      </div>

      {/* Search Component Modal */}
      <SearchComponent isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}