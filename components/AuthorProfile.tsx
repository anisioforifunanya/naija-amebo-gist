'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Author {
  id: number
  name: string
  bio: string
  avatar: string
  verified: boolean
  credibilityScore: number
  articlesCount: number
  followersCount: number
  specializations: string[]
  socialProfiles: {
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
  joinedAt: string
}

export default function AuthorProfile({ author, compact = false }: { author: Author; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base truncate">{author.name}</span>
            {author.verified && (
              <span title="Verified author" className="text-blue-500">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {author.specializations.slice(0, 2).join(', ')}
          </p>
        </div>
      </div>
    )
  }

  const joinDate = new Date(author.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-6 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="rounded-full object-cover border-4 border-white dark:border-gray-800"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl sm:text-3xl font-bold">{author.name}</h3>
            {author.verified && (
              <span title="Verified author" className="text-xl text-blue-500">
                ✓
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3">{author.bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-2xl font-bold text-blue-600">{author.articlesCount}</p>
              <p className="text-gray-600 dark:text-gray-400">Articles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{(author.followersCount / 1000).toFixed(1)}K</p>
              <p className="text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{author.credibilityScore}%</p>
              <p className="text-gray-600 dark:text-gray-400">Credibility</p>
            </div>
          </div>

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {author.specializations.map((spec) => (
              <span
                key={spec}
                className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">Joined {joinDate}</p>
        </div>
      </div>

      {/* Social Links */}
      {Object.keys(author.socialProfiles).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm font-semibold mb-3">Follow</p>
          <div className="flex flex-wrap gap-3">
            {author.socialProfiles.twitter && (
              <a
                href={author.socialProfiles.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Twitter
              </a>
            )}
            {author.socialProfiles.instagram && (
              <a
                href={author.socialProfiles.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Instagram
              </a>
            )}
            {author.socialProfiles.youtube && (
              <a
                href={author.socialProfiles.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                YouTube
              </a>
            )}
            {author.socialProfiles.tiktok && (
              <a
                href={author.socialProfiles.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                TikTok
              </a>
            )}
            {author.socialProfiles.linkedin && (
              <a
                href={author.socialProfiles.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
