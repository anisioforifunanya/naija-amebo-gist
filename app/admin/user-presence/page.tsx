'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import UserStatusCard from '@/components/UserStatusCard'
import Link from 'next/link'

export default function UserPresenceMonitor() {
  const [users, setUsers] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Get all users
        const usersSnapshot = await getDocs(query(collection(db, 'users')))
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Separate users and admins
        const regularUsers = usersData.filter((u: any) => !u.role || u.role === 'user')
        const adminsData = usersData.filter((u: any) => u.role === 'admin' || u.role === 'super-admin')

        setUsers(regularUsers)
        setAdmins(adminsData)
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
    
    // Refresh every 10 seconds
    const interval = setInterval(loadUsers, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="p-8">Loading users...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
          <span className="mr-2">← Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Main Content with Top Padding */}
      <div className="pt-12">
      <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Admin
      </Link>

      <h1 className="text-3xl font-bold mb-8">👥 User Presence Monitor</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-xs text-green-600 mt-1">
            {users.filter((u: any) => u.status === 'online').length} online
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold">{admins.filter((a: any) => a.role === 'admin').length}</div>
          <div className="text-xs text-green-600 mt-1">
            {admins.filter((a: any) => a.role === 'admin' && a.status === 'online').length} online
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Super Admins</div>
          <div className="text-2xl font-bold">{admins.filter((a: any) => a.role === 'super-admin').length}</div>
          <div className="text-xs text-green-600 mt-1">
            {admins.filter((a: any) => a.role === 'super-admin' && a.status === 'online').length} online
          </div>
        </div>
      </div>

      {/* Admins & Super Admins */}
      {admins.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔑 Admins & Super Admins</h2>
          <div className="space-y-3">
            {admins.map((admin: any) => (
              <UserStatusCard
                key={admin.id}
                userId={admin.id}
                userName={admin.displayName || admin.email?.split('@')[0] || 'Unknown'}
                userRole={admin.role || 'admin'}
                avatar={admin.photoURL}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Users */}
      {users.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">👤 Regular Users ({users.length})</h2>
          <div className="space-y-3">
            {users.map((user: any) => (
              <UserStatusCard
                key={user.id}
                userId={user.id}
                userName={user.displayName || user.email?.split('@')[0] || 'Unknown'}
                userRole="user"
                avatar={user.photoURL}
              />
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && admins.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No users found
        </div>
      )}
    </div>
  )
}
