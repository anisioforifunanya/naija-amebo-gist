'use client'

import { useGetUserPresence, formatLastSeen } from '@/lib/useUserPresence'

interface OnlineIndicatorProps {
  userId: string
  showLastSeen?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function OnlineIndicator({
  userId,
  showLastSeen = true,
  size = 'md',
  className = ''
}: OnlineIndicatorProps) {
  const { presence, isOnline, lastSeen } = useGetUserPresence(userId)

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const dotSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Online/Offline Dot */}
      <div className="relative">
        <div
          className={`${dotSize} rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <div className={`${dotSize} rounded-full bg-green-500 absolute top-0 left-0 animate-pulse`} />
        )}
      </div>

      {/* Status Text */}
      <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>

      {/* Last Seen */}
      {showLastSeen && !isOnline && lastSeen && (
        <span className="text-xs text-gray-500">
          ({formatLastSeen(lastSeen)})
        </span>
      )}
    </div>
  )
}
