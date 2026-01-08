'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'

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
  const [buttonSize, setButtonSize] = useState<number>(70) // Mobile: 70px, Desktop: 110px
  const [showLogoId, setShowLogoId] = useState<number | null>(null) // Track which button shows logo
  const containerRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<ButtonPosition[]>([])
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dragStateRef = useRef<{ draggingId: number | null; offsetX: number; offsetY: number }>({
    draggingId: null,
    offsetX: 0,
    offsetY: 0
  })
  
  // Determine button size based on viewport - runs synchronously before first render
  useLayoutEffect(() => {
    const checkButtonSize = () => {
      // Show 6 animated buttons on all devices (smaller buttons on smaller screens)
      // 50px for very small screens, 80px for larger screens
      const size = typeof window !== 'undefined' ? (window.innerWidth < 300 ? 40 : window.innerWidth < 500 ? 50 : 80) : 50
      setButtonSize(size)
    }
    
    // Check immediately
    checkButtonSize()
    
    // Listen for resize
    window.addEventListener('resize', checkButtonSize)
    return () => window.removeEventListener('resize', checkButtonSize)
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
    if (typeof window === 'undefined') return
    
    const size = buttonSize || 70
    const initialPositions = buttons.map((_, index) => ({
      x: Math.max(0, Math.min(Math.random() * (window.innerWidth - size - 20), window.innerWidth - size)),
      y: Math.max(0, Math.min(Math.random() * (window.innerHeight - size - 20), window.innerHeight - size)),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }))
    positionsRef.current = initialPositions
    setPositions(initialPositions)
  }, [buttonSize])

  // Animation loop with browser compatibility
  useEffect(() => {
    // Use requestAnimationFrame for better browser compatibility
    let animationFrameId: number
    let lastUpdateTime = Date.now()
    
    const detectCollisions = (positions: ButtonPosition[], size: number) => {
      const minDistance = size * 1.2 // Collision threshold
      
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const p1 = positions[i]
          const p2 = positions[j]
          
          // Calculate distance between centers
          const dx = (p2.x + size / 2) - (p1.x + size / 2)
          const dy = (p2.y + size / 2) - (p1.y + size / 2)
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // If collision detected
          if (distance < minDistance) {
            // Normalize collision vector
            const nx = dx / distance
            const ny = dy / distance
            
            // Calculate relative velocity
            const dvx = p2.vx - p1.vx
            const dvy = p2.vy - p1.vy
            
            // Only bounce if moving towards each other
            if (dvx * nx + dvy * ny < 0) {
              // Calculate bounce force (reduced for slow bouncing)
              const bounceForce = 1.5
              
              // Apply velocity change
              p1.vx -= nx * bounceForce
              p1.vy -= ny * bounceForce
              p2.vx += nx * bounceForce
              p2.vy += ny * bounceForce
              
              // Separate buttons to prevent overlap
              const overlap = (minDistance - distance) / 2 + 1
              p1.x -= nx * overlap
              p1.y -= ny * overlap
              p2.x += nx * overlap
              p2.y += ny * overlap
            }
          }
        }
      }
    }
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastUpdateTime) / 1000 // Convert to seconds
      lastUpdateTime = currentTime
      
      // Only update if positions exist
      if (positionsRef.current.length === 0) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }
      
      const size = buttonSize || 70
      
      // Detect collisions and apply bouncing
      detectCollisions(positionsRef.current, size)
      
      const newPositions = positionsRef.current.map((pos, index) => {
        // Skip position update if this button is being dragged
        if (dragStateRef.current.draggingId === index) {
          return pos
        }
        
        let newX = pos.x + pos.vx
        let newY = pos.y + pos.vy
        let newVx = pos.vx
        let newVy = pos.vy

        const padding = 10

        // Bounce off right edge
        if (typeof window !== 'undefined' && newX + size > window.innerWidth - padding) {
          newX = window.innerWidth - size - padding
          newVx = -Math.abs(newVx) * 0.95
        }
        // Bounce off left edge
        if (newX < padding) {
          newX = padding
          newVx = Math.abs(newVx) * 0.95
        }

        // Bounce off bottom edge
        if (typeof window !== 'undefined' && newY + size > window.innerHeight - padding) {
          newY = window.innerHeight - size - padding
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
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [buttonSize])

  // Don't render full animation on mobile - show simplified grid instead
  if (buttonSize < 50) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        {buttons.slice(0, 3).map((button) => (
          <Link
            key={button.id}
            href={button.href}
            className={`bg-gradient-to-br ${button.bgColor} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center w-12 h-12 text-base`}
            title={button.label}
          >
            {button.icon}
          </Link>
        ))}
      </div>
    )
  }

  // Handle mouse down on button
  const handleMouseDown = (e: React.MouseEvent, buttonIndex: number) => {
    const button = (e.currentTarget as HTMLElement).parentElement
    if (!button) return

    const rect = button.getBoundingClientRect()
    const pos = positions[buttonIndex]

    dragStateRef.current = {
      draggingId: buttonIndex,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y
    }

    // Zero out velocity while dragging
    positionsRef.current[buttonIndex].vx = 0
    positionsRef.current[buttonIndex].vy = 0
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStateRef.current.draggingId === null) return

    const buttonIndex = dragStateRef.current.draggingId
    const size = buttonSize || 70
    const padding = 10

    let newX = e.clientX - dragStateRef.current.offsetX
    let newY = e.clientY - dragStateRef.current.offsetY

    // Clamp to screen bounds
    newX = Math.max(padding, Math.min(newX, (typeof window !== 'undefined' ? window.innerWidth : 0) - size - padding))
    newY = Math.max(padding, Math.min(newY, (typeof window !== 'undefined' ? window.innerHeight : 0) - size - padding))

    positionsRef.current[buttonIndex].x = newX
    positionsRef.current[buttonIndex].y = newY

    setPositions([...positionsRef.current])
  }

  // Handle mouse up
  const handleMouseUp = () => {
    dragStateRef.current = {
      draggingId: null,
      offsetX: 0,
      offsetY: 0
    }
  }
  
  // Handle button click to show logo
  const handleButtonClick = (buttonId: number) => {
    // Clear existing timeout if any
    if (logoTimeoutRef.current) {
      clearTimeout(logoTimeoutRef.current)
    }
    
    // Show logo
    setShowLogoId(buttonId)
    
    // Set timeout to hide logo after 3 seconds
    logoTimeoutRef.current = setTimeout(() => {
      setShowLogoId(null)
      logoTimeoutRef.current = null
    }, 3000)
  }
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (logoTimeoutRef.current) {
        clearTimeout(logoTimeoutRef.current)
      }
    }
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {buttons.map((button, index) => {
        const pos = positions[index]
        const isDragging = dragStateRef.current.draggingId === index
        return pos ? (
          <div
            key={button.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transition: isDragging ? 'none' : 'none',
              transform: 'translate(0, 0)',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onMouseUp={handleMouseUp}
          >
            <Link
              href={button.href}
              onClick={(e) => {
                // Prevent navigation if dragging
                if (isDragging) {
                  e.preventDefault()
                } else {
                  // Show logo on click
                  handleButtonClick(button.id)
                }
              }}
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
                gap-0.5
                p-2.5
                w-20
                h-20
                group
                relative
                overflow-hidden
                block
                ${isDragging ? 'scale-105' : ''}
              `}
              style={{
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Icon and label */}
              <div className="relative z-10 text-center">
                {showLogoId === button.id ? (
                  <div className="flex items-center justify-center h-8">
                    <Image 
                      src="/logo.png" 
                      alt="Amebo Logo" 
                      width={32} 
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-2xl mb-0.5">{button.icon}</div>
                )}
                <div className="text-2xs font-bold whitespace-nowrap">{button.label}</div>
              </div>
            </Link>
          </div>
        ) : null
      })}
    </div>
  )
}
