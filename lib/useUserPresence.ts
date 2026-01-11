import { useEffect, useState, useCallback } from 'react'

export interface UserPresence {
  userId: string
  status: 'online' | 'offline'
  isOnline: boolean
  lastSeen: string | null
  lastStatusChange: string | null
}

/**
 * Hook to track and update user presence
 * Automatically sets user to online when component mounts
 * Sets to offline when component unmounts
 */
export function useUserPresence(userId: string | null) {
  const [presence, setPresence] = useState<UserPresence | null>(null)
  const [loading, setLoading] = useState(false)

  // Update user presence
  const updatePresence = useCallback(async (status: 'online' | 'offline') => {
    if (!userId) return

    try {
      const response = await fetch('/api/users/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      })

      if (response.ok) {
        setPresence(prev => prev ? { ...prev, status, isOnline: status === 'online' } : null)
      }
    } catch (error) {
      console.error('Failed to update presence:', error)
    }
  }, [userId])

  // Get user presence
  const getPresence = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/presence?userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPresence(data)
      }
    } catch (error) {
      console.error('Failed to get presence:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Set user online on mount
  useEffect(() => {
    if (!userId) return

    // Update to online
    updatePresence('online')

    // Fetch current presence
    getPresence()

    // Set interval to keep user marked as online
    const interval = setInterval(() => {
      updatePresence('online')
    }, 30000) // Update every 30 seconds

    // Set user offline on unmount or when userId changes
    return () => {
      clearInterval(interval)
      updatePresence('offline')
    }
  }, [userId, updatePresence, getPresence])

  return {
    presence,
    loading,
    updatePresence,
    getPresence,
    isOnline: presence?.isOnline ?? false,
    lastSeen: presence?.lastSeen
  }
}

/**
 * Hook to get presence of a specific user
 */
export function useGetUserPresence(userId: string | null) {
  const [presence, setPresence] = useState<UserPresence | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchPresence = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/presence?userId=${userId}`)
        if (response.ok) {
          setPresence(await response.json())
        }
      } catch (error) {
        console.error('Failed to fetch presence:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPresence()

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchPresence, 5000)

    return () => clearInterval(interval)
  }, [userId])

  return { presence, loading, isOnline: presence?.isOnline ?? false, lastSeen: presence?.lastSeen }
}

/**
 * Formats last seen time in human-readable format
 */
export function formatLastSeen(lastSeenDate: string | null): string {
  if (!lastSeenDate) return 'Never'

  const now = new Date()
  const lastSeen = new Date(lastSeenDate)
  const diffMs = now.getTime() - lastSeen.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return lastSeen.toLocaleDateString()
}
