'use client'

import { useState, useEffect } from 'react'

interface AlternatingLogoProps {
  className?: string
  alt?: string
  switchInterval?: number // in milliseconds
}

export default function AlternatingLogo({
  className = "h-10 w-auto",
  alt = "Naija Amebo Gist Logo",
  switchInterval = 3000
}: AlternatingLogoProps) {
  const [currentLogo, setCurrentLogo] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const logos = [
    "/WhatsApp Image 2026-01-02 at 5.51.31 PM.jpeg",
    "/WhatsApp Image 2026-01-02 at 5.51.31 PM (1).jpeg"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false) // Start fade out

      setTimeout(() => {
        setCurrentLogo((prev) => (prev + 1) % logos.length) // Switch logo
        setIsVisible(true) // Start fade in
      }, 500) // Half second for fade transition

    }, switchInterval)

    return () => clearInterval(interval)
  }, [switchInterval, logos.length])

  return (
    <img
      src={logos[currentLogo]}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}