'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  url: string
  caption: string
  credit?: string
}

interface PhotoGalleryProps {
  images: GalleryImage[]
  title: string
  description?: string
}

export default function PhotoGallery({ images, title, description }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  return (
    <>
      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl w-full max-h-screen flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="relative w-full h-full max-h-96 sm:max-h-screen">
                <Image
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].caption}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 90vw"
                  priority
                />
              </div>
            </div>

            {/* Caption */}
            <div className="bg-black/80 p-4 text-center">
              <p className="text-white text-lg font-semibold mb-1">
                {images[selectedIndex].caption}
              </p>
              {images[selectedIndex].credit && (
                <p className="text-gray-400 text-sm">Credit: {images[selectedIndex].credit}</p>
              )}
              <p className="text-gray-400 text-sm mt-2">
                {selectedIndex + 1} of {images.length}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 p-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                ← Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev! + 1) % images.length)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="my-8">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            >
              <Image
                src={image.url}
                alt={image.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end justify-start p-3">
                <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {image.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Thumbnails */}
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-400'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.caption}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
