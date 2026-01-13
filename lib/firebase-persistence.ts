/**
 * CORE FIREBASE PERSISTENCE LAYER
 * ================================
 * All data storage MUST go through this layer.
 * NO localStorage usage anywhere in the app.
 * 
 * Articles, users, sessions, messages, preferences - ALL in Firebase/Firestore
 */

import { 
  db,
  auth
} from '@/lib/firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  Query,
  QueryConstraint,
  addDoc,
  writeBatch
} from 'firebase/firestore'

// ============ ARTICLE OPERATIONS ============

export interface Article {
  id?: string
  title: string
  description: string
  excerpt?: string
  category: 'entertainment' | 'celebrity-news' | 'viral-content' | 'trending-stories'
  status: 'approved' | 'pending' | 'rejected'
  author?: string
  image?: string
  video?: string
  hashtags?: string[]
  date?: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Save article to Firebase (CREATE or UPDATE)
 */
export async function saveArticle(article: Article): Promise<string> {
  try {
    if (article.id) {
      // Update existing
      const docRef = doc(db, 'articles', article.id)
      await updateDoc(docRef, {
        ...article,
        updatedAt: Timestamp.now()
      })
      return article.id
    } else {
      // Create new
      const docRef = await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Firebase: Error saving article', error)
    throw error
  }
}

/**
 * Get single article by ID
 */
export async function getArticle(id: string): Promise<Article | null> {
  try {
    const docRef = doc(db, 'articles', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Article
  } catch (error) {
    console.error('Firebase: Error getting article', error)
    return null
  }
}

/**
 * Get articles by category and status
 */
export async function getArticlesByCategory(
  category: string,
  status: string = 'approved'
): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', category),
      where('status', '==', status)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[]
  } catch (error) {
    console.error('Firebase: Error getting articles', error)
    return []
  }
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'articles', id))
  } catch (error) {
    console.error('Firebase: Error deleting article', error)
    throw error
  }
}

/**
 * Update article status (approved, rejected, pending)
 */
export async function updateArticleStatus(
  id: string,
  status: 'approved' | 'pending' | 'rejected'
): Promise<void> {
  try {
    const docRef = doc(db, 'articles', id)
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Firebase: Error updating article status', error)
    throw error
  }
}

// ============ USER SESSION OPERATIONS ============

export interface UserSession {
  id?: string
  userId: string
  email?: string
  name?: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
  sessionToken: string
  createdAt?: Date
  expiresAt?: Date
}

/**
 * Create/update user session in Firebase (replaces localStorage)
 */
export async function saveUserSession(session: UserSession): Promise<string> {
  try {
    const docRef = doc(db, 'sessions', session.userId)
    await setDoc(docRef, {
      ...session,
      createdAt: Timestamp.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
    return session.userId
  } catch (error) {
    console.error('Firebase: Error saving session', error)
    throw error
  }
}

/**
 * Get user session
 */
export async function getUserSession(userId: string): Promise<UserSession | null> {
  try {
    const docRef = doc(db, 'sessions', userId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as UserSession
  } catch (error) {
    console.error('Firebase: Error getting session', error)
    return null
  }
}

/**
 * Delete user session (logout)
 */
export async function deleteUserSession(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sessions', userId))
  } catch (error) {
    console.error('Firebase: Error deleting session', error)
    throw error
  }
}

// ============ USER PREFERENCES ============

export interface UserPreferences {
  id?: string
  userId: string
  analyticsConsent?: boolean
  theme?: 'light' | 'dark'
  notifications?: boolean
  language?: string
  updatedAt?: Date
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    await setDoc(docRef, {
      userId,
      ...preferences,
      updatedAt: Timestamp.now()
    }, { merge: true })
  } catch (error) {
    console.error('Firebase: Error saving preferences', error)
    throw error
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as UserPreferences
  } catch (error) {
    console.error('Firebase: Error getting preferences', error)
    return null
  }
}

// ============ MESSAGE/CHAT OPERATIONS ============

export interface Message {
  id?: string
  senderId: string
  recipientId?: string
  groupId?: string
  content: string
  type?: 'text' | 'image' | 'video'
  mediaUrl?: string
  createdAt?: Date
  read?: boolean
}

/**
 * Save message to Firestore (replaces localStorage for chat)
 */
export async function saveMessage(message: Message): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: Timestamp.now(),
      read: false
    })
    return docRef.id
  } catch (error) {
    console.error('Firebase: Error saving message', error)
    throw error
  }
}

/**
 * Get messages for a user or group
 */
export async function getMessages(
  recipientId?: string,
  groupId?: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    let q: Query
    
    if (groupId) {
      q = query(
        collection(db, 'messages'),
        where('groupId', '==', groupId)
      )
    } else if (recipientId) {
      q = query(
        collection(db, 'messages'),
        where('recipientId', '==', recipientId)
      )
    } else {
      return []
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
  } catch (error) {
    console.error('Firebase: Error getting messages', error)
    return []
  }
}

// ============ ADMIN OPERATIONS ============

export interface AdminData {
  id?: string
  email: string
  username: string
  role: 'admin' | 'super-admin'
  permissions?: string[]
  createdAt?: Date
}

/**
 * Save admin profile
 */
export async function saveAdmin(admin: AdminData): Promise<string> {
  try {
    const docRef = doc(db, 'admins', admin.email)
    await setDoc(docRef, {
      ...admin,
      createdAt: Timestamp.now()
    })
    return admin.email
  } catch (error) {
    console.error('Firebase: Error saving admin', error)
    throw error
  }
}

/**
 * Get admin by email
 */
export async function getAdmin(email: string): Promise<AdminData | null> {
  try {
    const docRef = doc(db, 'admins', email)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as AdminData
  } catch (error) {
    console.error('Firebase: Error getting admin', error)
    return null
  }
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<AdminData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'admins'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminData[]
  } catch (error) {
    console.error('Firebase: Error getting admins', error)
    return []
  }
}

// ============ BATCH OPERATIONS ============

/**
 * Batch delete articles (for cleanup)
 */
export async function deleteArticlesBatch(ids: string[]): Promise<void> {
  try {
    const batch = writeBatch(db)
    
    ids.forEach(id => {
      const docRef = doc(db, 'articles', id)
      batch.delete(docRef)
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Firebase: Error batch deleting articles', error)
    throw error
  }
}

export default {
  // Articles
  saveArticle,
  getArticle,
  getArticlesByCategory,
  deleteArticle,
  updateArticleStatus,
  deleteArticlesBatch,
  
  // Sessions
  saveUserSession,
  getUserSession,
  deleteUserSession,
  
  // Preferences
  saveUserPreferences,
  getUserPreferences,
  
  // Messages
  saveMessage,
  getMessages,
  
  // Admins
  saveAdmin,
  getAdmin,
  getAllAdmins
}
