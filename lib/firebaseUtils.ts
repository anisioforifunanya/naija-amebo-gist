import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  Timestamp,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import { db, auth } from './firebase';

// ===== USERS COLLECTION =====
export async function addUser(user: any) {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...user };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

export async function getUser(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ===== ADMINS COLLECTION =====
export async function addAdmin(admin: any) {
  try {
    const docRef = await addDoc(collection(db, 'admins'), {
      ...admin,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...admin };
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
}

export async function getAllAdmins() {
  try {
    const snapshot = await getDocs(collection(db, 'admins'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all admins:', error);
    throw error;
  }
}

export async function updateAdmin(adminId: string, updates: any) {
  try {
    const docRef = doc(db, 'admins', adminId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
}

// ===== MESSAGES COLLECTION =====
export async function addMessage(message: any, collectionName = 'messages') {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...message,
      timestamp: Timestamp.now(),
    });
    return { id: docRef.id, ...message };
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

export async function getMessages(collectionName = 'messages') {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export async function updateMessage(messageId: string, updates: any, collectionName = 'messages') {
  try {
    const docRef = doc(db, collectionName, messageId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

export async function deleteMessage(messageId: string, collectionName = 'messages') {
  try {
    await deleteDoc(doc(db, collectionName, messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// ===== CONVERSATIONS COLLECTION =====
export async function addConversation(conversation: any) {
  try {
    const docRef = await addDoc(collection(db, 'conversations'), {
      ...conversation,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...conversation };
  } catch (error) {
    console.error('Error adding conversation:', error);
    throw error;
  }
}

export async function getConversations() {
  try {
    const snapshot = await getDocs(collection(db, 'conversations'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

export async function updateConversation(conversationId: string, updates: any) {
  try {
    const docRef = doc(db, 'conversations', conversationId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

// ===== ADMIN REQUESTS COLLECTION =====
export async function addAdminRequest(request: any) {
  try {
    const docRef = await addDoc(collection(db, 'adminRequests'), {
      ...request,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...request };
  } catch (error) {
    console.error('Error adding admin request:', error);
    throw error;
  }
}

export async function getAdminRequests() {
  try {
    const snapshot = await getDocs(collection(db, 'adminRequests'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting admin requests:', error);
    throw error;
  }
}

export async function updateAdminRequest(requestId: string, updates: any) {
  try {
    const docRef = doc(db, 'adminRequests', requestId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating admin request:', error);
    throw error;
  }
}

export async function deleteAdminRequest(requestId: string) {
  try {
    await deleteDoc(doc(db, 'adminRequests', requestId));
  } catch (error) {
    console.error('Error deleting admin request:', error);
    throw error;
  }
}

// ===== SESSION/CURRENT USER =====
export async function setCurrentUser(user: any) {
  try {
    // Store in a special document
    const docRef = doc(db, 'sessions', 'currentUser');
    await setDoc(docRef, {
      user,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error setting current user:', error);
    // Fallback to localStorage if Firebase fails
    if (typeof window !== 'undefined') {
      localStorage.setItem('naijaAmeboCurrentUser', JSON.stringify(user));
    }
  }
}

export async function getCurrentUser() {
  try {
    const docRef = doc(db, 'sessions', 'currentUser');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().user;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('naijaAmeboCurrentUser');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }
}

// ===== FIREBASE AUTHENTICATION =====
export async function registerUserWithEmail(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use. Please use a different email or login.');
    } else if (authError.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error(authError.message);
  }
}

export async function loginUserWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error(authError.message);
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('naijaAmeboCurrentUser');
      localStorage.removeItem('naijaAmeboCurrentAdmin');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}
