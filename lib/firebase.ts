import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzYQ2xM-Z1_VtVvXZqOK0jcEOI89DshT4",
  authDomain: "naija-amebo-gist.firebaseapp.com",
  projectId: "naija-amebo-gist",
  storageBucket: "naija-amebo-gist.firebasestorage.app",
  messagingSenderId: "749835043572",
  appId: "1:749835043572:web:d3b784f2d1a69f369714a1",
  measurementId: "G-72SS14BB53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
