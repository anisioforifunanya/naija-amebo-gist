'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Wait for next tick to ensure DOM is ready
    const timer = setTimeout(() => {
      const html = document.documentElement
      const isCurrentlyDark = html.classList.contains('dark')
      setIsDark(isCurrentlyDark)
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const isCurrentlyDark = html.classList.contains('dark')
    const newIsDark = !isCurrentlyDark
    
    if (newIsDark) {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
    }
    
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    setIsDark(newIsDark)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-24 right-4 z-40 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center w-14 h-14 group"
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 w-full h-full transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-.707.707a1 1 0 000 1.414l2.12 2.12a1 1 0 001.414 0l.707-.707a1 1 0 000-1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM9 4a1 1 0 100-2H5a2 2 0 00-2 2v2a1 1 0 11-2 0V4a4 4 0 014-4h4z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 w-full h-full transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  )
}
