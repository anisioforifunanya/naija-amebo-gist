/**
 * FIREBASE AUTH HANDLER
 * ======================
 * Replace all localStorage auth tokens with Firebase Authentication
 * Manages user sessions, admin authentication, and session persistence
 */

'use client'

import React from 'react'
import { 
  auth, 
  db 
} from '@/lib/firebase'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore'

export interface AdminUser {
  uid: string
  email: string
  username?: string
  isSuperAdmin?: boolean
  role?: 'admin' | 'super-admin'
  createdAt?: Date
  lastLogin?: Date
}

export interface SessionData {
  uid: string
  email: string
  username?: string
  isSuperAdmin?: boolean
  role?: string
  sessionToken?: string
  createdAt?: number
  expiresAt?: number
}

/**
 * Admin login with email/password
 * Creates Firebase session
 */
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Get admin data from Firestore
    const adminRef = doc(db, 'admins', email)
    const adminSnap = await getDoc(adminRef)

    if (!adminSnap.exists()) {
      throw new Error('Admin account not found in database')
    }

    const adminData = adminSnap.data()

    // Save session to Firestore
    const sessionRef = doc(db, 'sessions', user.uid)
    await setDoc(sessionRef, {
      uid: user.uid,
      email: user.email,
      username: adminData.username,
      isSuperAdmin: adminData.role === 'super-admin',
      role: adminData.role,
      sessionToken: user.refreshToken,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24h expiry
    })

    console.log('[Firebase Auth] Admin logged in:', email)

    return {
      uid: user.uid,
      email: user.email || '',
      username: adminData.username,
      isSuperAdmin: adminData.role === 'super-admin',
      role: adminData.role,
      lastLogin: new Date()
    }
  } catch (error) {
    console.error('[Firebase Auth] Login failed:', error)
    throw error
  }
}

/**
 * Regular user login
 */
export async function loginUser(email: string, password: string): Promise<SessionData> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Save user session to Firestore
    const sessionRef = doc(db, 'sessions', user.uid)
    await setDoc(sessionRef, {
      uid: user.uid,
      email: user.email,
      sessionToken: user.refreshToken,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
    })

    console.log('[Firebase Auth] User logged in:', email)

    return {
      uid: user.uid,
      email: user.email || '',
      sessionToken: user.refreshToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    }
  } catch (error) {
    console.error('[Firebase Auth] User login failed:', error)
    throw error
  }
}

/**
 * Logout and clear Firebase session
 */
export async function logoutUser(): Promise<void> {
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      // Delete session from Firestore
      const sessionRef = doc(db, 'sessions', currentUser.uid)
      await setDoc(sessionRef, { expiresAt: Timestamp.now() }, { merge: true })
    }

    // Sign out from Firebase Auth
    await signOut(auth)
    console.log('[Firebase Auth] User logged out')
  } catch (error) {
    console.error('[Firebase Auth] Logout failed:', error)
    throw error
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

/**
 * Listen for Firebase auth state changes
 * Use this in useEffect to track login/logout
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get admin session data from Firestore
 */
export async function getAdminSession(uid: string): Promise<AdminUser | null> {
  try {
    const sessionRef = doc(db, 'sessions', uid)
    const sessionSnap = await getDoc(sessionRef)

    if (!sessionSnap.exists()) return null

    const sessionData = sessionSnap.data()
    
    // Check if session expired
    const expiresAt = sessionData.expiresAt?.toDate?.() || new Date(0)
    if (expiresAt < new Date()) {
      console.log('[Firebase Auth] Session expired')
      return null
    }

    return {
      uid: sessionData.uid,
      email: sessionData.email,
      username: sessionData.username,
      isSuperAdmin: sessionData.isSuperAdmin,
      role: sessionData.role
    }
  } catch (error) {
    console.error('[Firebase Auth] Failed to get session:', error)
    return null
  }
}

/**
 * Hook to use current auth state in components
 */
export function useCurrentUser() {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}

/**
 * Hook to use current admin session
 */
export function useAdminSession() {
  const [admin, setAdmin] = React.useState<AdminUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { user } = useCurrentUser()

  React.useEffect(() => {
    const fetchAdminSession = async () => {
      if (user) {
        const adminData = await getAdminSession(user.uid)
        setAdmin(adminData)
      }
      setLoading(false)
    }

    fetchAdminSession()
  }, [user])

  return { admin, loading }
}

export default {
  loginAdmin,
  loginUser,
  logoutUser,
  getCurrentUser,
  onAuthChange,
  getAdminSession,
  useCurrentUser,
  useAdminSession
}
