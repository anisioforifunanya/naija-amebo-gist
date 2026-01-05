'use client'

import Link from 'next/link'

interface FloatingButton {
  icon: string
  label: string
  href: string
  bgColor: string
}

export default function FloatingButtons() {
  const buttons: FloatingButton[] = [
    {
      icon: '🛍️',
      label: 'Store',
      href: '/marketplace',
      bgColor: 'from-green-400 to-green-600'
    },
    {
      icon: '👥',
      label: 'People',
      href: '/community',
      bgColor: 'from-blue-400 to-blue-600'
    },
    {
      icon: '💼',
      label: 'Jobs',
      href: '/submit-news',
      bgColor: 'from-purple-400 to-purple-600'
    },
    {
      icon: '📅',
      label: 'Events',
      href: '/group-chats',
      bgColor: 'from-orange-400 to-orange-600'
    },
    {
      icon: '📍',
      label: 'Map',
      href: '/location',
      bgColor: 'from-red-400 to-red-600'
    },
    {
      icon: '📡',
      label: 'Stream',
      href: '/channels',
      bgColor: 'from-pink-400 to-pink-600'
    }
  ]

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 max-w-xs">
      {/* Grid layout for floating buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {buttons.map((button, index) => (
          <Link
            key={index}
            href={button.href}
            className={`
              bg-gradient-to-br ${button.bgColor}
              text-white
              rounded-full
              shadow-lg
              hover:shadow-xl
              transition-all
              duration-300
              transform
              hover:scale-110
              active:scale-95
              flex
              flex-col
              items-center
              justify-center
              gap-1
              p-4
              min-h-24
              min-w-24
              group
              relative
              overflow-hidden
            `}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            {/* Icon and label */}
            <div className="relative z-10 text-center">
              <div className="text-3xl mb-1">{button.icon}</div>
              <div className="text-xs font-bold whitespace-nowrap">{button.label}</div>
            </div>

            {/* Floating animation */}
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
              
              ${`[href="${button.href}"]`} {
                animation: float 3s ease-in-out infinite;
                animation-delay: ${index * 0.2}s;
              }
            `}</style>
          </Link>
        ))}
      </div>

      {/* Helpful text for mobile */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 sm:hidden">
        Quick Access
      </div>
    </div>
  )
}
