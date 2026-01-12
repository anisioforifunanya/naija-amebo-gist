#!/usr/bin/env node

/**
 * Quick script to restore articles to Firebase
 * Run: node scripts/restore-articles.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Articles to restore
const articlesToRestore = [
  {
    title: "Single Nigerian mom of 10 kids shares how she survives with her children!!!",
    description: "Just in: A courageous Nigerian mother shares her inspiring story of how she manages to care for 10 children with resilience and determination.",
    category: "entertainment",
    status: "approved",
    date: "1/12/2026, 2:51:25 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
  },
  {
    title: "Teyana Taylor's emotional acceptance speech after winning her first Golden Globe award last night",
    description: "The Grammy-nominated singer and dancer took home the award for Best Supporting Female Actor in a Motion Picture for her performance in One Battle After Another.",
    category: "celebrity-news",
    status: "approved",
    date: "1/12/2026, 2:58:41 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
  },
  {
    title: "Nigerian doctor based in Germany lists benefits of paying his taxes",
    description: "If I loose my job, the govt pays me 60% of my salary and help to find a new one- Nigerian doctor based in Germany lists benefits of paying his taxes as he asks Nigerians what benefits they derive after tax payment",
    category: "viral-content",
    status: "approved",
    date: "1/12/2026, 3:09:07 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
  },
];

async function restoreArticles() {
  try {
    console.log('🔄 Starting article restoration...');
    
    for (const article of articlesToRestore) {
      const firebaseArticle = {
        ...article,
        excerpt: article.description.substring(0, 200),
        hashtags: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'articles'), firebaseArticle);
      console.log(`✅ Restored: ${article.title} (${article.category}) - ID: ${docRef.id}`);
    }

    console.log('✨ All articles restored successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
}

restoreArticles();
