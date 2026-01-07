'use client'

import { useState } from 'react'

const SOCIAL_LINKS = [
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@naijaamebogist?_r=1&_t=ZS-92Unt2SqyGb',
    icon: '🎵',
    color: 'hover:text-black dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  },
  {
    name: 'Telegram',
    url: 'https://t.me/naija_amebo',
    icon: '✈️',
    color: 'hover:text-blue-500',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/naijaamebonews',
    icon: 'f',
    color: 'hover:text-blue-600',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  {
    name: 'Threads',
    url: 'https://www.threads.com/@naijaamebogist',
    icon: '@',
    color: 'hover:text-gray-900 dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@naijaamebogist?si=HzMq_upDJcGD0xRz',
    icon: '▶️',
    color: 'hover:text-red-600',
    bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20'
  },
  {
    name: 'Twitter/X',
    url: 'https://x.com/naijaamebonews',
    icon: '𝕏',
    color: 'hover:text-black dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/naijaamebogist',
    icon: '📷',
    color: 'hover:text-pink-600',
    bgColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
  }
]

const LINK_BASE = 'flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-105 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md min-h-[40px]'

export default function SocialBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="self-end mb-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close social menu"
          >
            <span className="text-2xl">←</span>
          </button>

          {/* Header */}
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
            Follow Us
          </div>

          {/* Social Links - Vertical Stack */}
          <div className="flex flex-col gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className={`${LINK_BASE} w-full justify-start ${social.bgColor} ${social.color}`}
                aria-label={`Visit ${social.name}`}
              >
                <span className="text-lg">{social.icon}</span>
                <span className="text-sm">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Open Button - Fixed on Left */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg transition-all duration-300 z-40 ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open social menu"
      >
        <span className="text-2xl">→</span>
      </button>
    </>
  )
}
