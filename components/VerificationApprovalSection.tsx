"use client";
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'

interface PendingUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  bio?: string
  facialPhoto?: string
  verificationStatus: 'pending' | 'approved' | 'rejected'
  verificationSubmittedAt?: string
  accountStatus?: 'pending_verification' | 'approved' | 'rejected'
  adminNotes?: string
}

export default function VerificationApprovalSection() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load pending users
  useEffect(() => {
    loadUsers()
  }, [])

  // Reload users when filter changes
  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = () => {
    const usersData = localStorage.getItem('naijaAmeboUsers')
    const allUsers = usersData ? JSON.parse(usersData) : []

    console.log('Loading users for filter:', filter)
    console.log('All users from storage:', allUsers)
    console.log('Total users with facialPhoto:', allUsers.filter((u: any) => u.facialPhoto).length)
    
    // Filter by verification status
    const filteredUsers = allUsers.filter(
      (u: any) => u.facialPhoto && u.verificationStatus === filter
    )

    console.log(`Filtered users for '${filter}':`, filteredUsers)
    setUsers(filteredUsers)
  }

  // Force refresh data
  const forceRefresh = () => {
    console.log('Force refreshing verification data...')
    loadUsers()
  }

  const approveUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const usersData = localStorage.getItem('naijaAmeboUsers')
      const users = usersData ? JSON.parse(usersData) : []

      // Update user status
      const updatedUsers = users.map((u: any) =>
        u.id === userId
          ? {
              ...u,
              verificationStatus: 'approved',
              accountStatus: 'approved',
              verificationApprovedAt: new Date().toISOString(),
              verificationApprovedBy: localStorage.getItem('naijaAmeboCurrentAdmin')
                ? JSON.parse(localStorage.getItem('naijaAmeboCurrentAdmin') || '{}').id
                : 'system',
            }
          : u
      )

      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      // Update if user is currently logged in
      const currentUser = localStorage.getItem('naijaAmeboCurrentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        if (user.id === userId) {
          user.verificationStatus = 'approved'
          user.accountStatus = 'approved'
          localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(user))
        }
      }

      toast.success(`User approved successfully`, {
        position: 'bottom-right',
        autoClose: 3000,
      })

      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Failed to approve user', { position: 'bottom-right' })
    } finally {
      setIsLoading(false)
    }
  }

  const rejectUser = async () => {
    if (!rejectingUserId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason', {
        position: 'bottom-right',
      })
      return
    }

    setIsLoading(true)
    try {
      const usersData = localStorage.getItem('naijaAmeboUsers')
      const users = usersData ? JSON.parse(usersData) : []

      // Update user status
      const updatedUsers = users.map((u: any) =>
        u.id === rejectingUserId
          ? {
              ...u,
              verificationStatus: 'rejected',
              accountStatus: 'rejected',
              adminNotes: rejectReason,
              verificationRejectedAt: new Date().toISOString(),
              verificationRejectedBy: localStorage.getItem('naijaAmeboCurrentAdmin')
                ? JSON.parse(localStorage.getItem('naijaAmeboCurrentAdmin') || '{}').id
                : 'system',
            }
          : u
      )

      localStorage.setItem('naijaAmeboUsers', JSON.stringify(updatedUsers))

      toast.success(`User rejected. Reason has been recorded`, {
        position: 'bottom-right',
        autoClose: 3000,
      })

      // Reset reject form
      setRejectingUserId(null)
      setRejectReason('')

      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error('Failed to reject user', { position: 'bottom-right' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStats = () => {
    const usersData = localStorage.getItem('naijaAmeboUsers')
    const allUsers = usersData ? JSON.parse(usersData) : []
    console.log('getStats - all users:', allUsers)
    const verified = allUsers.filter(
      (u: any) => u.facialPhoto && u.verificationStatus === 'approved'
    ).length
    const pending = allUsers.filter(
      (u: any) => u.facialPhoto && u.verificationStatus === 'pending'
    ).length
    const rejected = allUsers.filter(
      (u: any) => u.facialPhoto && u.verificationStatus === 'rejected'
    ).length

    console.log('Stats - verified:', verified, 'pending:', pending, 'rejected:', rejected)
    return { verified, pending, rejected, total: verified + pending + rejected }
  }

  const stats = useMemo(() => getStats(), [users])

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Facial Verification Approvals
        </h2>
        <button
          type="button"
          onClick={() => {
            console.log('Refresh button clicked!')
            forceRefresh()
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-sm cursor-pointer z-10"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
        <details>
          <summary className="cursor-pointer font-semibold text-yellow-900 dark:text-yellow-300">
            📊 Debug Info (Click to expand)
          </summary>
          <div className="mt-2 space-y-4">
            <div className="text-xs bg-white dark:bg-gray-900 p-2 rounded">
              <p className="font-bold mb-2">Summary:</p>
              <pre>{JSON.stringify({
                totalUsers: (() => {
                  const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                  return users.length
                })(),
                usersWithFacialPhoto: (() => {
                  const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                  return users.filter((u: any) => u.facialPhoto).length
                })(),
                pendingVerifications: (() => {
                  const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                  return users.filter((u: any) => u.facialPhoto && u.verificationStatus === 'pending').length
                })(),
                stats
              }, null, 2)}</pre>
            </div>

            <div className="text-xs bg-white dark:bg-gray-900 p-2 rounded overflow-auto max-h-60">
              <p className="font-bold mb-2">All Users in localStorage:</p>
              <pre>{JSON.stringify((() => {
                const users = JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]')
                return users.map((u: any) => ({
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  email: u.email,
                  verificationStatus: u.verificationStatus || 'not_set',
                  facialPhoto: u.facialPhoto ? '✓ YES' : '✗ NO',
                  accountStatus: u.accountStatus || 'not_set',
                  personalDetailsCompletedAt: u.personalDetailsCompletedAt ? 'YES' : 'NO'
                }))
              })(), null, 2)}</pre>
            </div>

            <div className="text-xs bg-white dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
              <p className="font-bold mb-2">Currently Logged-in User (naijaAmeboCurrentUser):</p>
              <pre>{JSON.stringify((() => {
                const user = localStorage.getItem('naijaAmeboCurrentUser')
                if (!user) return 'No user logged in'
                const u = JSON.parse(user)
                return {
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  email: u.email,
                  verificationStatus: u.verificationStatus || 'not_set',
                  facialPhoto: u.facialPhoto ? '✓ YES' : '✗ NO',
                  accountStatus: u.accountStatus || 'not_set',
                  personalDetailsCompletedAt: u.personalDetailsCompletedAt ? 'YES' : 'NO'
                }
              })(), null, 2)}</pre>
            </div>
          </div>
        </details>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Submissions</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verified}</p>
        </div>
        <div className="bg-red-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status)
              setUsers(
                (JSON.parse(localStorage.getItem('naijaAmeboUsers') || '[]') as any[]).filter(
                  (u) => u.facialPhoto && u.verificationStatus === status
                )
              )
            }}
            className={`px-4 py-2 font-semibold capitalize transition ${
              filter === status
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            {status} ({stats[status === 'approved' ? 'verified' : status]})
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No {filter} verifications to show
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6"
            >
              <div className="flex gap-6">
                {/* Photo Preview */}
                {user.facialPhoto && (
                  <div className="flex-shrink-0">
                    <img
                      src={user.facialPhoto}
                      alt="Facial verification"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {user.firstName} {user.lastName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-gray-800 dark:text-white break-all">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-800 dark:text-white">{user.phone}</p>
                      </div>
                    )}
                    {user.location && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Location</p>
                        <p className="text-gray-800 dark:text-white">{user.location}</p>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Date of Birth</p>
                        <p className="text-gray-800 dark:text-white">
                          {new Date(user.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason Display */}
                  {user.verificationStatus === 'rejected' && user.adminNotes && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">{user.adminNotes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  {user.verificationSubmittedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted: {new Date(user.verificationSubmittedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {filter === 'pending' && (
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => approveUser(user.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setRejectingUserId(user.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Reject Verification
            </h3>

            <div className="bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Provide a clear reason for rejection. The user will be notified and can resubmit.
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g., 'Photo quality is poor', 'Face is not clearly visible')"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4 h-24"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectingUserId(null)
                  setRejectReason('')
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={rejectUser}
                disabled={isLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
              >
                {isLoading ? '⏳ Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
