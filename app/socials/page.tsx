'use client'

import Link from 'next/link'
import AlternatingLogo from '@/components/AlternatingLogo'

export default function SocialsPage() {
  const socialLinks = [
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@naijaamebogist?_r=1&_t=ZS-92Unt2SqyGb',
      icon: '🎵',
      color: 'from-black to-gray-800',
      hoverColor: 'hover:from-gray-800 hover:to-black'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/naija_amebo',
      icon: '✈️',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/naijaamebonews',
      icon: 'f',
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-700 hover:to-blue-900'
    },
    {
      name: 'Threads',
      url: 'https://www.threads.com/@naijaamebogist',
      icon: '@',
      color: 'from-gray-700 to-gray-900',
      hoverColor: 'hover:from-gray-800 hover:to-black'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@naijaamebogist?si=HzMq_upDJcGD0xRz',
      icon: '▶️',
      color: 'from-red-500 to-red-700',
      hoverColor: 'hover:from-red-600 hover:to-red-800'
    },
    {
      name: 'Twitter/X',
      url: 'https://x.com/naijaamebonews',
      icon: '𝕏',
      color: 'from-gray-800 to-black',
      hoverColor: 'hover:from-black hover:to-gray-900'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/naijaamebogist',
      icon: '📷',
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8">
      {/* Container */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <AlternatingLogo className="h-12 sm:h-16 md:h-20 w-auto" />
          </div>

          {/* Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Naija Amebo Gist
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Follow Us On Social Media
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Stay connected with Nigeria's #1 celebrity news platform
          </p>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-12">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl overflow-hidden min-h-[200px] xs:min-h-[180px] sm:min-h-[200px] md:min-h-[220px]`}
              title={social.name}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${social.color} ${social.hoverColor} transition-all duration-300`} />

              {/* Animated background shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Icon */}
                <div className="text-5xl sm:text-6xl md:text-7xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {social.icon}
                </div>

                {/* Name */}
                <span className="text-base sm:text-lg md:text-xl font-bold text-center">
                  {social.name}
                </span>

                {/* Hover indicator */}
                <span className="text-xs sm:text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Follow Now →
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4 sm:pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            Don't miss out on breaking news and exclusive updates!
          </p>
          <Link href="/" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] flex items-center justify-center">
            ← Back to Homepage
          </Link>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            🔗 Click any button to visit our official social media page
          </p>
        </div>
      </div>
    </div>
  )
}
