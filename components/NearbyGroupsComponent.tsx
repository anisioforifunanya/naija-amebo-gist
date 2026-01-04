'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NearbyGroup {
  id: string
  name: string
  description: string
  creatorId: string
  creatorName: string
  latitude: number
  longitude: number
  radius: number // in km
  members: string[]
  avatar?: string
  createdAt: string
  category?: string
}

interface UserLocation {
  latitude: number
  longitude: number
  address?: string
}

export default function NearbyGroupsComponent() {
  const [nearbyGroups, setNearbyGroups] = useState<NearbyGroup[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    radius: 5
  })
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Get user's current location
  useEffect(() => {
    const user = localStorage.getItem('naijaAmeboCurrentUser')
    const admin = localStorage.getItem('naijaAmeboCurrentAdmin')
    const userData = user ? JSON.parse(user) : (admin ? JSON.parse(admin) : null)
    setCurrentUser(userData)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          localStorage.setItem('naijaAmeboUserLocation', JSON.stringify({ latitude, longitude }))
          loadNearbyGroups(latitude, longitude)
        },
        (err) => {
          setError('Unable to access your location. Please enable location services.')
          console.error('Geolocation error:', err)
          // Load all groups if location not available
          loadNearbyGroups(null, null)
        }
      )
    } else {
      setError('Geolocation not supported by your browser')
      loadNearbyGroups(null, null)
    }
  }, [])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const loadNearbyGroups = (userLat: number | null, userLon: number | null) => {
    const allGroups = JSON.parse(localStorage.getItem('naijaAmeboNearbyGroups') || '[]') as NearbyGroup[]

    let filtered = allGroups
    if (userLat !== null && userLon !== null) {
      // Filter groups within reasonable distance
      filtered = allGroups.filter((group) => {
        const distance = calculateDistance(userLat, userLon, group.latitude, group.longitude)
        return distance <= group.radius
      })

      // Sort by distance
      filtered.sort((a, b) => {
        const distA = calculateDistance(userLat, userLon, a.latitude, a.longitude)
        const distB = calculateDistance(userLat, userLon, b.latitude, b.longitude)
        return distA - distB
      })
    }

    setNearbyGroups(filtered)
    setIsLoading(false)
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userLocation) {
      alert('Please enable location services to create a group')
      return
    }

    if (!formData.name.trim()) {
      alert('Please enter a group name')
      return
    }

    const newGroup: NearbyGroup = {
      id: `nearby-group-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      creatorId: currentUser?.id || 'unknown',
      creatorName: currentUser?.username || currentUser?.email || 'Anonymous',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: formData.radius,
      members: [currentUser?.id || 'unknown'],
      createdAt: new Date().toISOString(),
      category: formData.category
    }

    const allGroups = JSON.parse(localStorage.getItem('naijaAmeboNearbyGroups') || '[]')
    allGroups.push(newGroup)
    localStorage.setItem('naijaAmeboNearbyGroups', JSON.stringify(allGroups))

    setNearbyGroups([newGroup, ...nearbyGroups])
    setFormData({ name: '', description: '', category: 'general', radius: 5 })
    setShowCreateForm(false)
    alert('Nearby group created successfully!')
  }

  const handleJoinGroup = (groupId: string) => {
    if (!currentUser) {
      alert('Please login to join groups')
      return
    }

    const allGroups = JSON.parse(localStorage.getItem('naijaAmeboNearbyGroups') || '[]') as NearbyGroup[]
    const groupIndex = allGroups.findIndex((g) => g.id === groupId)

    if (groupIndex !== -1) {
      if (!allGroups[groupIndex].members.includes(currentUser.id)) {
        allGroups[groupIndex].members.push(currentUser.id)
        localStorage.setItem('naijaAmeboNearbyGroups', JSON.stringify(allGroups))

        setNearbyGroups(
          nearbyGroups.map((g) =>
            g.id === groupId
              ? { ...g, members: allGroups[groupIndex].members }
              : g
          )
        )
        alert('Joined group successfully!')
      } else {
        alert('You are already a member of this group')
      }
    }
  }

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUser) return

    const allGroups = JSON.parse(localStorage.getItem('naijaAmeboNearbyGroups') || '[]') as NearbyGroup[]
    const groupIndex = allGroups.findIndex((g) => g.id === groupId)

    if (groupIndex !== -1) {
      allGroups[groupIndex].members = allGroups[groupIndex].members.filter(
        (m) => m !== currentUser.id
      )
      localStorage.setItem('naijaAmeboNearbyGroups', JSON.stringify(allGroups))

      setNearbyGroups(
        nearbyGroups.map((g) =>
          g.id === groupId
            ? { ...g, members: allGroups[groupIndex].members }
            : g
        )
      )
      alert('Left group successfully!')
    }
  }

  const getDistanceFromUser = (groupLat: number, groupLon: number): number => {
    if (!userLocation) return 0
    return calculateDistance(userLocation.latitude, userLocation.longitude, groupLat, groupLon)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📍 Nearby Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover and create groups in your location
            </p>
            {userLocation && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                📌 Location detected: ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
              </p>
            )}
          </div>

          {currentUser && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {showCreateForm ? '✕ Cancel' : '+ Create Group'}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
          </div>
        )}

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create a Nearby Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Coffee Meetup at Victoria Island"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">General Meetup</option>
                    <option value="sports">Sports</option>
                    <option value="business">Business</option>
                    <option value="social">Social</option>
                    <option value="gaming">Gaming</option>
                    <option value="food">Food & Dining</option>
                    <option value="cultural">Cultural</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Visibility Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.radius}
                    onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {/* Groups List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading nearby groups...</p>
          </div>
        ) : nearbyGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyGroups.map((group) => {
              const distance = getDistanceFromUser(group.latitude, group.longitude)
              const isMember = currentUser && group.members.includes(currentUser.id)

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                        {group.name}
                      </h3>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-full whitespace-nowrap">
                        {group.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {group.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{distance.toFixed(2)} km away</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m7.753 7.354a4 4 0 01-5.292 0M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{group.members.length} members</span>
                      </span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Created by <span className="font-semibold text-gray-900 dark:text-white">{group.creatorName}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 flex gap-3">
                    {currentUser ? (
                      <>
                        {isMember ? (
                          <>
                            <button
                              onClick={() => handleLeaveGroup(group.id)}
                              className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              Leave
                            </button>
                            <Link
                              href={`/group-chats?view=${group.id}`}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
                            >
                              View
                            </Link>
                          </>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group.id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                          >
                            Join Group
                          </button>
                        )}
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
                      >
                        Login to Join
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No nearby groups found</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {userLocation ? 'Be the first to create a group in your area!' : 'Enable location to see nearby groups'}
            </p>
            {userLocation && currentUser && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Create First Group
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
