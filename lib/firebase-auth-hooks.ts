/**
 * FIREBASE AUTH HOOKS
 * ====================
 * React hooks for Firebase authentication in components
 * Replaces localStorage auth checks
 */

'use client'

import React, { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

/**
 * Hook: Get current authenticated user
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}

/**
 * Hook: Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useUser()
  return !loading && user !== null
}

/**
 * Hook: Get admin data for current user
 */
export function useAdminData() {
  const { user, loading: userLoading } = useUser()
  const [admin, setAdmin] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.email) {
        setAdmin(null)
        setLoading(false)
        return
      }

      try {
        const adminRef = doc(db, 'admins', user.email)
        const adminSnap = await getDoc(adminRef)

        if (adminSnap.exists()) {
          setAdmin(adminSnap.data())
        } else {
          setAdmin(null)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data')
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading) {
      fetchAdminData()
    }
  }, [user, userLoading])

  return { admin, loading: userLoading || loading, error }
}

/**
 * Hook: Check if user is admin
 */
export function useIsAdmin(): boolean {
  const { admin, loading } = useAdminData()
  return !loading && admin !== null
}

/**
 * Hook: Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const { admin, loading } = useAdminData()
  return !loading && admin?.role === 'super-admin'
}

/**
 * Hook: Redirect if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading } = useUser()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
      setCanAccess(false)
    } else {
      setCanAccess(true)
    }
  }, [user, loading, redirectTo])

  return { canAccess, loading }
}

/**
 * Hook: Redirect if not admin
 */
export function useRequireAdmin(redirectTo: string = '/') {
  const { user, loading: userLoading } = useUser()
  const { admin, loading: adminLoading } = useAdminData()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (userLoading || adminLoading) return

    if (!user || !admin) {
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
      setCanAccess(false)
    } else {
      setCanAccess(true)
    }
  }, [user, admin, userLoading, adminLoading, redirectTo])

  return { canAccess, loading: userLoading || adminLoading }
}

/**
 * Hook: Redirect if not super admin
 */
export function useRequireSuperAdmin(redirectTo: string = '/') {
  const { user, loading: userLoading } = useUser()
  const { admin, loading: adminLoading } = useAdminData()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (userLoading || adminLoading) return

    if (!user || admin?.role !== 'super-admin') {
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
      setCanAccess(false)
    } else {
      setCanAccess(true)
    }
  }, [user, admin, userLoading, adminLoading, redirectTo])

  return { canAccess, loading: userLoading || adminLoading }
}

export default {
  useUser,
  useIsAuthenticated,
  useAdminData,
  useIsAdmin,
  useIsSuperAdmin,
  useRequireAuth,
  useRequireAdmin,
  useRequireSuperAdmin
}
