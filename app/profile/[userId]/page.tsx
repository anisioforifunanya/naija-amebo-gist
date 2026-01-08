'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  username?: string
  firstName: string
  lastName: string
  phone: string
  phoneVisibility?: 'visible' | 'hidden' | 'friends-only'
  bio?: string
  avatar?: string
  role: 'user' | 'admin'
  autoDeleteMessages?: 'off' | '1day' | '1week' | '1month' | 'custom'
  customDeleteHours?: number
  notificationsEnabled?: boolean
  friends?: string[] // Array of user IDs
  blockedUsers?: string[] // Array of user IDs
  followers?: string[] // Array of user IDs following this user
  following?: string[] // Array of user IDs this user follows
  likes?: number // Total likes count
  subscribers?: string[] // Array of user IDs subscribed to this user
  likedBy?: string[] // Array of user IDs that liked this user's profile
  sharedMedia?: {
    images: string[]
    videos: string[]
    voiceNotes: string[]
    links: string[]
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'voice' | 'links' | 'groups'>('posts')
  const [isFriend, setIsFriend] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [showPhoneSettings, setShowPhoneSettings] = useState(false)
  const [showDeleteSettings, setShowDeleteSettings] = useState(false)

  useEffect(() => {
    console.log('[ProfilePage] Loading profile for userId:', userId)
    
    // Load current user from localStorage FIRST (check both user and admin sessions)
    const userSession = localStorage.getItem('naijaAmeboCurrentUser')
    const adminSession = localStorage.getItem('naijaAmeboCurrentAdmin')
    let currentUserData: UserProfile | null = null
    
    if (userSession) {
      try {
        currentUserData = JSON.parse(userSession)
        setCurrentUser(currentUserData)
        console.log('[ProfilePage] Loaded current user:', currentUserData?.id)
      } catch (e) {
        console.error('[ProfilePage] Error parsing currentUser:', e)
      }
    } else if (adminSession) {
      try {
        currentUserData = JSON.parse(adminSession)
        setCurrentUser(currentUserData)
        console.log('[ProfilePage] Loaded current admin:', currentUserData?.id)
      } catch (e) {
        console.error('[ProfilePage] Error parsing currentAdmin:', e)
      }
    } else {
      console.log('[ProfilePage] No current user or admin session found')
    }

    // Load profile user
    const loadProfileUser = async () => {
      try {
        // Load admins from API first if not in localStorage
        const existingAdmins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
        if (existingAdmins.length === 0) {
          console.log('[ProfilePage] Loading admins from API...')
          try {
            const adminResponse = await fetch('/api/admins')
            if (adminResponse.ok) {
              const adminData = await adminResponse.json()
              if (adminData.admins && Array.isArray(adminData.admins)) {
                localStorage.setItem('naijaAmeboAdmins', JSON.stringify(adminData.admins))
                console.log('[ProfilePage] Admins loaded:', adminData.admins.length)
              }
            }
          } catch (err) {
            console.error('[ProfilePage] Failed to load admins:', err)
          }
        }

        // Check localStorage FIRST (for dynamically created users)
        console.log('[ProfilePage] Checking localStorage for user:', userId)
        const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
        const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
        const allUsers = [...users, ...admins]
        
        let foundUser = allUsers.find(u => u.id === userId)
        if (foundUser) {
          console.log('[ProfilePage] Found in localStorage:', foundUser.id, foundUser.firstName)
          setProfileUser(foundUser)
          setRelationships(currentUserData, foundUser, userId)
          setIsLoading(false)
          return
        }

        // Try API as fallback with short timeout
        console.log('[ProfilePage] Not in localStorage, fetching from API:', userId)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        try {
          const response = await fetch(`/api/users/${userId}`, { signal: controller.signal })
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              console.log('[ProfilePage] Got user from API:', data.user.id)
              setProfileUser(data.user)
              setRelationships(currentUserData, data.user, userId)
              setIsLoading(false)
              return
            }
          } else {
            console.log('[ProfilePage] API returned not found (404), user likely created on client')
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.log('[ProfilePage] API timeout/failed, user likely created on client')
        }

        console.error('[ProfilePage] User not found in localStorage or API:', userId)
      } catch (error) {
        console.error('[ProfilePage] Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Helper function to set relationships
    const setRelationships = (currentUser: UserProfile | null, profileUser: UserProfile, userId: string) => {
      if (!currentUser) return
      setIsFriend(currentUser.friends?.includes(userId) || false)
      setIsBlocked(currentUser.blockedUsers?.includes(userId) || false)
      setIsFollowing(currentUser.following?.includes(userId) || false)
      setIsSubscribed(currentUser.subscribers?.includes(userId) || false)
      setHasLiked(profileUser.likedBy?.includes(currentUser.id) || false)
    }

    loadProfileUser()
  }, [userId])

  const reloadProfileUser = () => {
    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    const allUsers = [...users, ...admins]
    const foundUser = allUsers.find(u => u.id === userId)
    if (foundUser) {
      setProfileUser(foundUser)
    }
  }

  const handleAddFriend = () => {
    console.log('[AddFriend] Current user:', currentUser?.id, 'Profile user:', profileUser?.id)
    
    // Check if user is logged in
    if (!currentUser) {
      alert('You must be logged in to add friends')
      return
    }
    
    if (!profileUser) {
      console.error('[AddFriend] Missing profileUser')
      return
    }

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const friends = u.friends || []
        if (!friends.includes(userId)) {
          friends.push(userId)
        }
        return { ...u, friends }
      }
      return u
    })

    // Find the updated current user
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsFriend(true)
    alert('Friend added successfully!')
  }

  const handleRemoveFriend = () => {
    if (!currentUser || !profileUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const friends = (u.friends || []).filter(id => id !== userId)
        return { ...u, friends }
      }
      return u
    })

    // Find the updated current user
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsFriend(false)
    alert('Friend removed!')
  }

  const handleBlockUser = () => {
    if (!currentUser || !profileUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const blockedUsers = u.blockedUsers || []
        if (!blockedUsers.includes(userId)) {
          blockedUsers.push(userId)
        }
        return { ...u, blockedUsers }
      }
      return u
    })

    // Find the updated current user
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsBlocked(true)
    alert('User blocked!')
  }

  const handleUnblockUser = () => {
    if (!currentUser || !profileUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const blockedUsers = (u.blockedUsers || []).filter(id => id !== userId)
        return { ...u, blockedUsers }
      }
      return u
    })

    // Find the updated current user
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsBlocked(false)
    alert('User unblocked!')
  }

  const handleFollowUser = () => {
    console.log('[Follow] Current user:', currentUser?.id, 'Profile user:', profileUser?.id)
    
    // Check if user is logged in
    if (!currentUser) {
      alert('You must be logged in to follow users')
      return
    }
    
    if (!profileUser) {
      console.error('[Follow] Missing profileUser')
      return
    }
    
    // Prevent self-following
    if (currentUser.id === userId) {
      alert('You cannot follow yourself!')
      return
    }

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    // Update current user's following list
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const following = u.following || []
        if (!following.includes(userId)) {
          following.push(userId)
        }
        return { ...u, following }
      }
      return u
    })
    
    // Update profile user's followers list
    const updatedProfileUsers = [...updatedUsers].map((u: UserProfile) => {
      if (u.id === userId) {
        const followers = u.followers || []
        if (!followers.includes(currentUser.id)) {
          followers.push(currentUser.id)
        }
        return { ...u, followers }
      }
      return u
    })

    // Also check if profile user is admin
    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const followers = a.followers || []
        if (!followers.includes(currentUser.id)) {
          followers.push(currentUser.id)
        }
        return { ...a, followers }
      }
      return a
    })

    // Find the updated current user in the array
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)
    
    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsFollowing(true)
    reloadProfileUser()
    alert('You are now following this user!')
  }

  const handleUnfollowUser = () => {
    if (!currentUser || !profileUser) return
    
    // Prevent self-unfollowing (redundant but safe)
    if (currentUser.id === userId) {
      alert('You cannot unfollow yourself!')
      return
    }

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const following = (u.following || []).filter(id => id !== userId)
        return { ...u, following }
      }
      return u
    })
    
    const updatedProfileUsers = [...updatedUsers].map((u: UserProfile) => {
      if (u.id === userId) {
        const followers = (u.followers || []).filter(id => id !== currentUser.id)
        return { ...u, followers }
      }
      return u
    })

    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const followers = (a.followers || []).filter(id => id !== currentUser.id)
        return { ...a, followers }
      }
      return a
    })

    // Find the updated current user in the array
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsFollowing(false)
    reloadProfileUser()
    alert('You unfollowed this user!')
  }

  const handleSubscribeUser = () => {
    console.log('[Subscribe] Current user:', currentUser?.id, 'Profile user:', profileUser?.id)
    
    // Check if user is logged in
    if (!currentUser) {
      alert('You must be logged in to subscribe')
      return
    }
    
    if (!profileUser) {
      console.error('[Subscribe] Missing profileUser')
      return
    }
    
    // Prevent self-subscribing
    if (currentUser.id === userId) {
      alert('You cannot subscribe to yourself!')
      return
    }

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const subscribers = u.subscribers || []
        if (!subscribers.includes(userId)) {
          subscribers.push(userId)
        }
        return { ...u, subscribers }
      }
      return u
    })
    
    const updatedProfileUsers = [...updatedUsers].map((u: UserProfile) => {
      if (u.id === userId) {
        const subscribers = u.subscribers || []
        if (!subscribers.includes(currentUser.id)) {
          subscribers.push(currentUser.id)
        }
        return { ...u, subscribers }
      }
      return u
    })

    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const subscribers = a.subscribers || []
        if (!subscribers.includes(currentUser.id)) {
          subscribers.push(currentUser.id)
        }
        return { ...a, subscribers }
      }
      return a
    })

    // Find the updated current user in the array
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsSubscribed(true)
    reloadProfileUser()
    alert('You subscribed to this user!')
  }

  const handleUnsubscribeUser = () => {
    if (!currentUser || !profileUser) return
    
    // Prevent self-unsubscribing (redundant but safe)
    if (currentUser.id === userId) {
      alert('You cannot unsubscribe from yourself!')
      return
    }

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    // Update current user's subscribers list (remove the profile user)
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        const subscribers = (u.subscribers || []).filter(id => id !== userId)
        return { ...u, subscribers }
      }
      return u
    })
    
    const updatedProfileUsers = [...updatedUsers].map((u: UserProfile) => {
      if (u.id === userId) {
        const subscribers = (u.subscribers || []).filter(id => id !== currentUser.id)
        return { ...u, subscribers }
      }
      return u
    })

    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const subscribers = (a.subscribers || []).filter(id => id !== currentUser.id)
        return { ...a, subscribers }
      }
      return a
    })

    // Find the updated current user in the array
    const updatedCurrentUser = updatedUsers.find((u: UserProfile) => u.id === currentUser.id)

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(updatedCurrentUser || currentUser))
    setCurrentUser(updatedCurrentUser || currentUser)
    setIsSubscribed(false)
    reloadProfileUser()
    alert('You unsubscribed from this user!')
  }

  const handleLikeProfile = () => {
    if (!currentUser || !profileUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    const updatedProfileUsers = users.map((u: UserProfile) => {
      if (u.id === userId) {
        const likedBy = u.likedBy || []
        if (!likedBy.includes(currentUser.id)) {
          likedBy.push(currentUser.id)
        }
        const likes = (u.likes || 0) + 1
        return { ...u, likedBy, likes }
      }
      return u
    })

    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const likedBy = a.likedBy || []
        if (!likedBy.includes(currentUser.id)) {
          likedBy.push(currentUser.id)
        }
        const likes = (a.likes || 0) + 1
        return { ...a, likedBy, likes }
      }
      return a
    })

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    setHasLiked(true)
    reloadProfileUser()
    alert('You liked this profile!')
  }

  const handleUnlikeProfile = () => {
    if (!currentUser || !profileUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const admins = JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]')
    
    const updatedProfileUsers = users.map((u: UserProfile) => {
      if (u.id === userId) {
        const likedBy = (u.likedBy || []).filter(id => id !== currentUser.id)
        const likes = Math.max(0, (u.likes || 1) - 1)
        return { ...u, likedBy, likes }
      }
      return u
    })

    const updatedAdmins = admins.map((a: UserProfile) => {
      if (a.id === userId) {
        const likedBy = (a.likedBy || []).filter(id => id !== currentUser.id)
        const likes = Math.max(0, (a.likes || 1) - 1)
        return { ...a, likedBy, likes }
      }
      return a
    })

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedProfileUsers))
    localStorage.setItem('naijaAmeboAdmins', JSON.stringify(updatedAdmins))
    setHasLiked(false)
    reloadProfileUser()
    alert('You unliked this profile!')
  }

  const handleVoiceCall = () => {
    if (!profileUser) return
    alert(`📞 Initiating voice call with ${profileUser.firstName} ${profileUser.lastName}...\n\nNote: This is a demo. Real voice call would require WebRTC implementation.`);
  }

  const handleVideoCall = () => {
    if (!profileUser) return
    alert(`📹 Initiating video call with ${profileUser.firstName} ${profileUser.lastName}...\n\nNote: This is a demo. Real video call would require WebRTC implementation.`);
  }

  const handleSendMessage = () => {
    if (!currentUser || !profileUser) {
      alert('You must be logged in to send messages')
      return
    }

    // Create or get conversation data
    const conversations = JSON.parse(localStorage.getItem('naijaAmeboConversations') || '[]')
    
    // Check if conversation already exists between these two users
    let conversationId = conversations.find((conv: any) => {
      const participantIds = [conv.participantId1, conv.participantId2].sort()
      const currentIds = [currentUser.id, profileUser.id].sort()
      return participantIds[0] === currentIds[0] && participantIds[1] === currentIds[1]
    })?.id

    // If no conversation exists, create one
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      conversations.push({
        id: conversationId,
        participantId1: currentUser.id,
        participantId2: profileUser.id,
        participant1Name: `${currentUser.firstName} ${currentUser.lastName}`,
        participant2Name: `${profileUser.firstName} ${profileUser.lastName}`,
        createdAt: new Date().toISOString(),
        messages: []
      })
      localStorage.setItem('naijaAmeboConversations', JSON.stringify(conversations))
    }

    // Store the conversation ID in session and redirect to private messages
    localStorage.setItem('naijaAmeboActiveConversation', conversationId)
    router.push(`/private-messages?conversationId=${conversationId}`)
  }

  const toggleNotifications = () => {
    if (!currentUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        return { ...u, notificationsEnabled: !u.notificationsEnabled }
      }
      return u
    })

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    setCurrentUser({ ...currentUser, notificationsEnabled: !currentUser.notificationsEnabled })
  }

  const updatePhoneVisibility = (visibility: 'visible' | 'hidden' | 'friends-only') => {
    if (!currentUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        return { ...u, phoneVisibility: visibility }
      }
      return u
    })

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    setCurrentUser({ ...currentUser, phoneVisibility: visibility })
    setShowPhoneSettings(false)
  }

  const updateAutoDelete = (setting: string, customHours?: number) => {
    if (!currentUser) return

    const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
    const updatedUsers = users.map((u: UserProfile) => {
      if (u.id === currentUser.id) {
        return { 
          ...u, 
          autoDeleteMessages: setting,
          customDeleteHours: customHours || u.customDeleteHours
        }
      }
      return u
    })

    localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))
    setCurrentUser({ 
      ...currentUser, 
      autoDeleteMessages: setting as any,
      customDeleteHours: customHours || currentUser.customDeleteHours
    })
    setShowDeleteSettings(false)
  }

  const getPhoneDisplay = () => {
    if (!profileUser) return 'Not available'
    
    if (profileUser.id === currentUser?.id) {
      return profileUser.phone
    }

    const visibility = profileUser.phoneVisibility || 'visible'
    
    if (visibility === 'visible') return profileUser.phone
    if (visibility === 'hidden') return 'Hidden'
    if (visibility === 'friends-only') {
      return isFriend ? profileUser.phone : 'Friends only'
    }
    
    return profileUser.phone
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Messages
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold shadow-xl">
                  {profileUser.avatar ? (
                    <img src={profileUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    `${profileUser.firstName[0]}${profileUser.lastName[0]}`
                  )}
                </div>
                {profileUser.role === 'admin' && (
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xl">👑</span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 text-center sm:text-left mt-0 sm:mt-16 w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {profileUser.firstName} {profileUser.lastName}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  {(profileUser as any).displayName && (
                    <p className="text-gray-600 dark:text-gray-400">
                      @{(profileUser as any).displayName}
                    </p>
                  )}
                  {!(profileUser as any).displayName && (
                    <p className="text-gray-600 dark:text-gray-400">
                      @{profileUser.username || profileUser.email.split('@')[0]}
                    </p>
                  )}
                  {profileUser.email && (
                    <p className="text-gray-600 dark:text-gray-400">
                      • {profileUser.email}
                    </p>
                  )}
                </div>
                {(profileUser as any).joinedDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                    Joined: {new Date((profileUser as any).joinedDate).toLocaleDateString()}
                    {(profileUser as any).lastLogin && ` • Last Login: ${new Date((profileUser as any).lastLogin).toLocaleDateString()} on ${new Date((profileUser as any).lastLogin).toLocaleTimeString()}`}
                  </p>
                )}
                {profileUser.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{profileUser.bio}</p>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {profileUser.followers?.length || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Followers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {profileUser.following?.length || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Following</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                      {profileUser.likes || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                      {profileUser.subscribers?.length || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                  </div>
                </div>
                
                {/* Follow and Subscribe Buttons (Under Stats) */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    <button
                      onClick={isFollowing ? handleUnfollowUser : handleFollowUser}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                        isFollowing
                          ? 'bg-purple-200 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-300'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      } ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill={isFollowing ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>{isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}</span>
                    </button>

                    <button
                      onClick={isSubscribed ? handleUnsubscribeUser : handleSubscribeUser}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                        isSubscribed
                          ? 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill={isSubscribed ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span>{isLoading ? 'Loading...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}</span>
                    </button>
                  </div>
                )}
                
                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={isFriend ? handleRemoveFriend : handleAddFriend}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                        isFriend
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>{isFriend ? 'Remove Friend' : 'Add Friend'}</span>
                    </button>

                    <button
                      onClick={hasLiked ? handleUnlikeProfile : handleLikeProfile}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                        hasLiked
                          ? 'bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-300'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      } ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{hasLiked ? '❤️ Liked' : '🤍 Like'}</span>
                    </button>

                    <button
                      onClick={isBlocked ? handleUnblockUser : handleBlockUser}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                        isBlocked
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      } ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                    </button>

                    <button
                      onClick={handleVoiceCall}
                      disabled={isLoading}
                      className={`inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Voice Call</span>
                    </button>

                    <button
                      onClick={handleVideoCall}
                      disabled={isLoading}
                      className={`inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Video Call</span>
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !profileUser}
                      className={`inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all text-sm ${isLoading || !profileUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>💬 Message</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Settings (Only for own profile) */}
            {isOwnProfile && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
                
                <div className="space-y-4">
                  {/* Notifications */}
                  <button
                    onClick={toggleNotifications}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="text-gray-900 dark:text-white font-medium">Notifications</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentUser?.notificationsEnabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {currentUser?.notificationsEnabled ? 'On' : 'Off'}
                    </span>
                  </button>

                  {/* Phone Visibility */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPhoneSettings(!showPhoneSettings)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-900 dark:text-white font-medium">Phone Visibility</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {currentUser?.phoneVisibility || 'visible'}
                      </span>
                    </button>

                    {showPhoneSettings && (
                      <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-[200px]">
                        <button
                          onClick={() => updatePhoneVisibility('visible')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Visible to All
                        </button>
                        <button
                          onClick={() => updatePhoneVisibility('friends-only')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Friends Only
                        </button>
                        <button
                          onClick={() => updatePhoneVisibility('hidden')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Hidden
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Display */}
                  <div className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-900 dark:text-white font-medium">Phone</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getPhoneDisplay()}
                    </span>
                  </div>

                  {/* Auto Delete Messages */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteSettings(!showDeleteSettings)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-900 dark:text-white font-medium">Auto Delete Messages</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {currentUser?.autoDeleteMessages || 'off'}
                      </span>
                    </button>

                    {showDeleteSettings && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50">
                        <button
                          onClick={() => updateAutoDelete('off')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          Off
                        </button>
                        <button
                          onClick={() => updateAutoDelete('1day')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          1 Day
                        </button>
                        <button
                          onClick={() => updateAutoDelete('1week')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          1 Week
                        </button>
                        <button
                          onClick={() => updateAutoDelete('1month')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          1 Month
                        </button>
                        <button
                          onClick={() => updateAutoDelete('custom', 6)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          6 Hours
                        </button>
                        <button
                          onClick={() => updateAutoDelete('custom', 12)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                        >
                          12 Hours
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-2 p-4 overflow-x-auto">
              {[
                { id: 'posts', label: 'Posts', icon: '📝' },
                { id: 'media', label: 'Media', icon: '🖼️' },
                { id: 'voice', label: 'Voice Notes', icon: '🎵' },
                { id: 'links', label: 'Links', icon: '🔗' },
                { id: 'groups', label: 'Groups', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">📝</p>
                <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Status posts will appear here</p>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">🖼️</p>
                <p className="text-gray-600 dark:text-gray-400">No shared media</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Photos and videos shared will appear here</p>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">🎵</p>
                <p className="text-gray-600 dark:text-gray-400">No voice notes</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Voice notes shared will appear here</p>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">🔗</p>
                <p className="text-gray-600 dark:text-gray-400">No links shared</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Links shared in conversations will appear here</p>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">👥</p>
                <p className="text-gray-600 dark:text-gray-400">No groups in common</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Common groups will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
