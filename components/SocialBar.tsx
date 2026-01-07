'use client'

export default function SocialBar() {
  const socialLinks = [
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

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 sm:py-2.5 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Label */}
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Follow Us
          </div>

          {/* Social Links - Horizontal Scroll on Mobile, Flex on Desktop */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-105 ${social.bgColor} ${social.color} border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md min-h-[40px] flex items-center justify-center`}
                aria-label={`Visit ${social.name}`}
              >
                <span className="text-sm sm:text-base md:text-lg">{social.icon}</span>
                <span className="hidden sm:inline text-xs sm:text-sm">{social.name}</span>
              </a>
            ))}
          </div>

          {/* Mobile Alternative - Icon Only Grid (if needed, currently using flex wrap above) */}
        </div>
      </div>
    </div>
  )
}
