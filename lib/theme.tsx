'use client'

import { useEffect, useState, createContext, useContext } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = stored === 'dark' || (stored === null && prefersDark)

    setIsDark(shouldBeDark)
    applyTheme(shouldBeDark)
    setMounted(true)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches)
        applyTheme(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = '#111827'
      html.style.color = '#f3f4f6'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
      html.style.backgroundColor = '#ffffff'
      html.style.color = '#111827'
    }
    
    // Force body update as well
    const body = document.body
    if (dark) {
      body.classList.add('dark')
      body.style.backgroundColor = '#111827'
      body.style.color = '#f3f4f6'
    } else {
      body.classList.remove('dark')
      body.style.backgroundColor = '#ffffff'
      body.style.color = '#111827'
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    applyTheme(newTheme)
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
