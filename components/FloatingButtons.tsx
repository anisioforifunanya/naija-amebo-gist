'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

interface FloatingButton {
  icon: string
  label: string
  href: string
  bgColor: string
  id: number
}

interface ButtonPosition {
  x: number
  y: number
  vx: number
  vy: number
}

export default function FloatingButtons() {
  const [positions, setPositions] = useState<ButtonPosition[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<ButtonPosition[]>([])
  
  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const buttons: FloatingButton[] = [
    {
      id: 0,
      icon: '🛍️',
      label: 'Store',
      href: '/marketplace',
      bgColor: 'from-green-400 to-green-600'
    },
    {
      id: 1,
      icon: '👥',
      label: 'People',
      href: '/community',
      bgColor: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      icon: '💼',
      label: 'Jobs',
      href: '/submit-news',
      bgColor: 'from-purple-400 to-purple-600'
    },
    {
      id: 3,
      icon: '📅',
      label: 'Events',
      href: '/group-chats',
      bgColor: 'from-orange-400 to-orange-600'
    },
    {
      id: 4,
      icon: '📍',
      label: 'Map',
      href: '/location',
      bgColor: 'from-red-400 to-red-600'
    },
    {
      id: 5,
      icon: '📡',
      label: 'Stream',
      href: '/channels',
      bgColor: 'from-pink-400 to-pink-600'
    }
  ]

  // Initialize positions
  useEffect(() => {
    const buttonSize = isMobile ? 70 : 110
    const initialPositions = buttons.map((_, index) => ({
      x: Math.random() * Math.max(100, window.innerWidth - buttonSize - 20),
      y: Math.random() * Math.max(100, window.innerHeight - buttonSize - 20),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }))
    positionsRef.current = initialPositions
    setPositions(initialPositions)
  }, [isMobile])

  // Animation loop
  useEffect(() => {
    if (!isMobile) return // Disable animation on mobile for better performance
    
    const interval = setInterval(() => {
      const newPositions = positionsRef.current.map(pos => {
        let newX = pos.x + pos.vx
        let newY = pos.y + pos.vy
        let newVx = pos.vx
        let newVy = pos.vy

        const buttonSize = 70 // approximate size of button on mobile
        const padding = 10

        // Bounce off right edge
        if (newX + buttonSize > window.innerWidth - padding) {
          newX = window.innerWidth - buttonSize - padding
          newVx = -Math.abs(newVx) * 0.95
        }
        // Bounce off left edge
        if (newX < padding) {
          newX = padding
          newVx = Math.abs(newVx) * 0.95
        }

        // Bounce off bottom edge
        if (newY + buttonSize > window.innerHeight - padding) {
          newY = window.innerHeight - buttonSize - padding
          newVy = -Math.abs(newVy) * 0.95
        }
        // Bounce off top edge
        if (newY < padding) {
          newY = padding
          newVy = Math.abs(newVy) * 0.95
        }

        // Add slight gravity/damping
        newVx *= 0.98
        newVy *= 0.98

        // Add small random motion to keep it alive
        if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
          newVx = (Math.random() - 0.5) * 2
          newVy = (Math.random() - 0.5) * 2
        }

        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        }
      })

      positionsRef.current = newPositions
      setPositions(newPositions)
    }, 30) // Update every 30ms for smooth animation

    return () => clearInterval(interval)
  }, [isMobile])

  // Don't render full animation on mobile - show simplified grid instead
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        {buttons.slice(0, 3).map((button) => (
          <Link
            key={button.id}
            href={button.href}
            className={`bg-gradient-to-br ${button.bgColor} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center w-14 h-14 text-lg`}
            title={button.label}
          >
            {button.icon}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
    >
      {buttons.map((button, index) => {
        const pos = positions[index]
        return pos ? (
          <div
            key={button.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transition: 'none',
              transform: 'translate(0, 0)'
            }}
          >
            <Link
              href={button.href}
              className={`
                bg-gradient-to-br ${button.bgColor}
                text-white
                rounded-full
                shadow-xl
                hover:shadow-2xl
                transition-all
                duration-200
                transform
                hover:scale-110
                active:scale-95
                flex
                flex-col
                items-center
                justify-center
                gap-1
                p-4
                w-24
                h-24
                group
                relative
                overflow-hidden
                block
              `}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Icon and label */}
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-1">{button.icon}</div>
                <div className="text-xs font-bold whitespace-nowrap">{button.label}</div>
              </div>
            </Link>
          </div>
        ) : null
      })}
    </div>
  )
}
