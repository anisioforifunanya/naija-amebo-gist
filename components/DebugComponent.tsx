'use client'

/**
 * Debug Component - Add Sample Data for Testing
 * This helps populate localStorage with test users so search works
 */

export function debugAddSampleUsers() {
  const sampleUsers = [
    {
      id: 'user-prince-123',
      username: 'princeani',
      firstName: 'Prince',
      lastName: 'Anisiofor',
      email: 'prince@example.com',
      password: 'password123',
      phone: '+234-812-345-6789',
      dateOfBirth: '1990-05-15',
      gender: 'Male',
      location: 'Lagos, Nigeria',
      bio: 'Celebrity enthusiast and entertainment blogger',
      interests: ['Entertainment', 'Celebrity News', 'Music'],
      avatar: '',
      role: 'user',
      isVerified: false,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      likes: [],
      subscribers: []
    },
    {
      id: 'user-alex-456',
      username: 'siralexking',
      firstName: 'Alex',
      lastName: 'King',
      email: 'alex@example.com',
      password: 'password123',
      phone: '+234-812-345-6790',
      dateOfBirth: '1992-03-20',
      gender: 'Male',
      location: 'Abuja, Nigeria',
      bio: 'News journalist and entertainment critic',
      interests: ['News', 'Entertainment', 'Gossip'],
      avatar: '',
      role: 'user',
      isVerified: true,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      likes: [],
      subscribers: []
    },
    {
      id: 'user-test-789',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+234-812-345-6791',
      dateOfBirth: '1995-07-10',
      gender: 'Other',
      location: 'Portharcourt, Nigeria',
      bio: 'Test account for debugging',
      interests: ['Testing', 'Development'],
      avatar: '',
      role: 'user',
      isVerified: false,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      likes: [],
      subscribers: []
    }
  ]

  // Add to localStorage
  const existingUsers = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
  const mergedUsers = [...existingUsers]
  
  // Only add if not already there
  sampleUsers.forEach(sampleUser => {
    if (!mergedUsers.find(u => u.id === sampleUser.id)) {
      mergedUsers.push(sampleUser)
    }
  })
  
  localStorage.setItem('naijaAmeboUsers', JSON.stringify(mergedUsers))
  
  console.log('✓ Sample users added to localStorage')
  console.log('Users:', mergedUsers)
  return mergedUsers
}

export function debugAddSampleGroupChats() {
  const sampleGroups = [
    {
      id: 'group-1',
      name: 'Celebrity Gossip Central',
      description: 'Discuss the latest celebrity news and gossip',
      creatorId: 'user-prince-123',
      members: ['user-prince-123', 'user-alex-456'],
      messages: [],
      createdAt: new Date().toISOString(),
      avatar: ''
    },
    {
      id: 'group-2',
      name: 'Entertainment News',
      description: 'Breaking entertainment news discussion',
      creatorId: 'user-alex-456',
      members: ['user-alex-456', 'user-test-789'],
      messages: [],
      createdAt: new Date().toISOString(),
      avatar: ''
    }
  ]

  const existingGroups = JSON.parse(localStorage.getItem('naijaAmeboGroupChats') || '[]')
  const mergedGroups = [...existingGroups]
  
  sampleGroups.forEach(sampleGroup => {
    if (!mergedGroups.find(g => g.id === sampleGroup.id)) {
      mergedGroups.push(sampleGroup)
    }
  })
  
  localStorage.setItem('naijaAmeboGroupChats', JSON.stringify(mergedGroups))
  
  console.log('✓ Sample group chats added to localStorage')
  return mergedGroups
}

export function debugCheckAllData() {
  const data = {
    users: JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]'),
    admins: JSON.parse(localStorage.getItem('naijaAmeboAdmins') || '[]'),
    groupChats: JSON.parse(localStorage.getItem('naijaAmeboGroupChats') || '[]'),
    channels: JSON.parse(localStorage.getItem('naijaAmeboChannels') || '[]'),
  }
  
  console.log('=== localStorage Data Debug ===')
  console.log('Users:', data.users.length, data.users)
  console.log('Admins:', data.admins.length, data.admins)
  console.log('Group Chats:', data.groupChats.length, data.groupChats)
  console.log('Channels:', data.channels.length, data.channels)
  
  return data
}

export function debugClearAllData() {
  localStorage.removeItem('naijaAmeboUsers')
  localStorage.removeItem('naijaAmeboAdmins')
  localStorage.removeItem('naijaAmeboGroupChats')
  localStorage.removeItem('naijaAmeboChannels')
  localStorage.removeItem('naijaAmeboCurrentUser')
  localStorage.removeItem('naijaAmeboCurrentAdmin')
  
  console.log('✓ All data cleared from localStorage')
}

export default function DebugComponent() {
  return (
    <div className="hidden">
      <p>Debug utilities available:</p>
      <ul>
        <li>debugAddSampleUsers() - Add sample users for testing</li>
        <li>debugAddSampleGroupChats() - Add sample group chats</li>
        <li>debugCheckAllData() - Check what's in localStorage</li>
        <li>debugClearAllData() - Clear all localStorage data</li>
      </ul>
      <p>Open browser console (F12) and run these functions</p>
    </div>
  )
}
