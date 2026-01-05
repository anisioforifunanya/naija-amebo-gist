'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Headline {
  id: number
  title: string
  slug: string
  excerpt: string
  image: string
  category: string
  isBreakinNews: boolean
  publishedAt: string
}

export default function HeadlineBanner({ headlines }: { headlines: Headline[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [autoPlay, headlines.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % headlines.length)
    setAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length)
    setAutoPlay(false)
  }

  if (headlines.length === 0) return null

  const current = headlines[currentIndex]

  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      {/* Main Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full group">
        <div className="relative h-full w-full">
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <Link href={`/news/${current.slug}`}>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 cursor-pointer hover:bg-black/20 transition-all duration-200">
            {current.isBreakinNews && (
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 animate-pulse">
                🔴 BREAKING NEWS
              </span>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
              {current.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 line-clamp-2">
              {current.excerpt}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span className="bg-blue-600 px-2 py-1 rounded">{current.category}</span>
              <span>{new Date(current.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-10 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          →
        </button>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-black">
        {headlines.map((headline, index) => (
          <button
            key={headline.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 relative w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-blue-500 ring-2 ring-blue-400'
                : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <Image
              src={headline.image}
              alt={headline.title}
              fill
              className="object-cover"
            />
            {headline.isBreakinNews && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 rounded">
                BRK
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 py-3 bg-black">
        {headlines.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-blue-500 w-8' : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
