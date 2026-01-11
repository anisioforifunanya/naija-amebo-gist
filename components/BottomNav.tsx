'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if user is logged in (stored in localStorage)
    const currentUser = localStorage.getItem('naijaAmeboCurrentUser')
    const currentAdmin = localStorage.getItem('naijaAmeboCurrentAdmin')
    const currentSuperAdmin = localStorage.getItem('naijaAmeboCurrentSuperAdmin')
    
    if (currentUser || currentAdmin || currentSuperAdmin) {
      setIsLoggedIn(true)
    }
  }, [])

  // Don't render until mounted (avoid hydration issues)
  if (!isMounted || !isLoggedIn) {
    return null
  }

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/features', label: 'Features', icon: '✨' },
    { href: '/private-messages', label: 'Messages', icon: '💬' },
    { href: '/group-chats', label: 'Groups', icon: '👥' },
    { href: '/channels', label: 'Channels', icon: '#' },
    { href: '/interviews', label: 'Interviews', icon: '🎤' },
    { href: '/gossip', label: 'Gossip', icon: '💬' },
    { href: '/galleries', label: 'Photos', icon: '📸' },
    { href: '/polls', label: 'Polls', icon: '🗳️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                isActive(item.href)
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              <span className="text-lg sm:text-xl mb-0.5">{item.icon}</span>
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
