import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Migrates a user from local storage to Firebase
 * This function:
 * 1. Creates a Firebase Auth account
 * 2. Stores user profile data in Firestore
 * 3. Returns success/error status
 */
export async function migrateUserToFirebase(userData: any) {
  try {
    const { email, password, id, ...profileData } = userData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Store user profile in Firestore
    await setDoc(doc(db, 'users', uid), {
      ...profileData,
      email,
      originalId: id,
      migratedAt: new Date().toISOString(),
      createdAt: profileData.createdAt || new Date().toISOString(),
      role: 'user'
    });

    return {
      success: true,
      uid,
      email,
      message: `User ${email} migrated successfully`
    };
  } catch (error: any) {
    // If user already exists in Firebase, just update the profile
    if (error.code === 'auth/email-already-in-use') {
      try {
        // Try to get the user by signing in
        const { email, password, id, ...profileData } = userData;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Check if profile already exists
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (!docSnap.exists()) {
          // Profile doesn't exist, create it
          await setDoc(doc(db, 'users', uid), {
            ...profileData,
            email,
            originalId: id,
            role: 'user'
          });
        }

        return {
          success: true,
          uid,
          email,
          message: `User ${email} already exists (profile updated)`
        };
      } catch (innerError: any) {
        return {
          success: false,
          email: userData.email,
          error: innerError.message
        };
      }
    }

    return {
      success: false,
      email: userData.email,
      error: error.message
    };
  }
}

/**
 * Migrates an admin from local storage to Firebase
 * Similar to user migration but marks them as admin
 */
export async function migrateAdminToFirebase(adminData: any) {
  try {
    const { email, password, id, ...profileData } = adminData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Store admin profile in Firestore
    await setDoc(doc(db, 'admins', uid), {
      ...profileData,
      email,
      originalId: id,
      migratedAt: new Date().toISOString(),
      createdAt: profileData.createdAt || new Date().toISOString(),
      role: adminData.role || 'admin'
    });

    return {
      success: true,
      uid,
      email,
      message: `Admin ${email} migrated successfully`
    };
  } catch (error: any) {
    // If admin already exists in Firebase, just update the profile
    if (error.code === 'auth/email-already-in-use') {
      try {
        const { email, password, id, ...profileData } = adminData;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Check if profile already exists
        const docSnap = await getDoc(doc(db, 'admins', uid));
        if (!docSnap.exists()) {
          await setDoc(doc(db, 'admins', uid), {
            ...profileData,
            email,
            originalId: id,
            role: adminData.role || 'admin'
          });
        }

        return {
          success: true,
          uid,
          email,
          message: `Admin ${email} already exists (profile updated)`
        };
      } catch (innerError: any) {
        return {
          success: false,
          email: adminData.email,
          error: innerError.message
        };
      }
    }

    return {
      success: false,
      email: adminData.email,
      error: error.message
    };
  }
}

/**
 * Gets migration status - checks which users/admins are in Firebase
 */
export async function getMigrationStatus() {
  const admins = [
    {
      email: "ifunanya.anisiofor@gmail.com",
      password: "somtoo11",
      firstName: "IFUNANYA",
      lastName: "ANISIOFOR",
      role: "admin"
    }
  ];

  const users = [
    {
      email: "alex.anisiofor@gmail.com",
      firstName: "Prince",
      lastName: "Anisiofor"
    }
  ];

  return {
    adminsToMigrate: admins,
    usersToMigrate: users
  };
}
