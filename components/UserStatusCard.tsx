'use client'

import { useGetUserPresence, formatLastSeen } from '@/lib/useUserPresence'

interface UserStatusCardProps {
  userId: string
  userName: string
  userRole: 'user' | 'admin' | 'super-admin'
  avatar?: string
  className?: string
}

export default function UserStatusCard({
  userId,
  userName,
  userRole,
  avatar,
  className = ''
}: UserStatusCardProps) {
  const { isOnline, lastSeen } = useGetUserPresence(userId)

  const roleColors = {
    'user': 'bg-blue-50 border-blue-200',
    'admin': 'bg-yellow-50 border-yellow-200',
    'super-admin': 'bg-purple-50 border-purple-200'
  }

  const roleBadgeColors = {
    'user': 'bg-blue-100 text-blue-800',
    'admin': 'bg-yellow-100 text-yellow-800',
    'super-admin': 'bg-purple-100 text-purple-800'
  }

  return (
    <div className={`border rounded-lg p-4 ${roleColors[userRole]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {avatar && (
            <img
              src={avatar}
              alt={userName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="font-bold text-sm">{userName}</h3>
            <span className={`text-xs px-2 py-1 rounded ${roleBadgeColors[userRole]}`}>
              {userRole === 'super-admin' ? 'Super Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {lastSeen && (
            <span className="text-xs text-gray-500">
              Last seen: {formatLastSeen(lastSeen)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
