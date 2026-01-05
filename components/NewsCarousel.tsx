'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface NewsCarouselItem {
  id: string
  title: string
  description: string
  image?: string
  category: string
}

interface NewsCarouselProps {
  items: NewsCarouselItem[]
  title?: string
}

export default function NewsCarousel({ items, title = "Featured Stories" }: NewsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Filter items with images and limit to 6
  const carouselItems = items.filter(item => item.image || item.description).slice(0, 6)

  useEffect(() => {
    if (carouselItems.length === 0) return

    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % carouselItems.length)
      }, 4000)
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlay, carouselItems.length])

  const handlePrev = () => {
    setIsAutoPlay(false)
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const handleNext = () => {
    setIsAutoPlay(false)
    setActiveIndex((prev) => (prev + 1) % carouselItems.length)
  }

  if (carouselItems.length === 0) return null

  return (
    <div className="mt-16 mb-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
        {title}
      </h2>

      <div className="relative w-full overflow-hidden">
        {/* Main carousel container with 3D perspective */}
        <div className="relative h-96 perspective">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Carousel slides wrapper */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
              {carouselItems.map((item, index) => {
                const angle = ((index - activeIndex) * 360) / carouselItems.length
                const isActive = index === activeIndex
                const distance = 300

                return (
                  <div
                    key={item.id}
                    className={`absolute transition-all duration-500 ease-out ${
                      isActive ? 'z-10 scale-100 opacity-100' : 'opacity-60 scale-75'
                    }`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${distance}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-48 h-80 flex flex-col">
                      {/* Image section */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                            📰
                          </div>
                        )}
                      </div>

                      {/* Text section */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                          {item.category?.replace(/-/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index)
                setIsAutoPlay(false)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-blue-600 dark:bg-blue-400 w-8'
                  : 'bg-gray-400 dark:bg-gray-600 w-2 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play toggle */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isAutoPlay ? '⏸ Pause' : '▶ Auto Play'}
          </button>
        </div>
      </div>
    </div>
  )
}
