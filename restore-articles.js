/**
 * RESTORATION SCRIPT
 * Restores lost articles to Firebase Firestore using Node.js
 * Run with: node restore-articles.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with credentials from environment or file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || 
  require('path').join(__dirname, 'firebase-admin-key.json');

let admin;
try {
  admin = initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
} catch (e) {
  console.error('Firebase service account file not found. Trying inline credentials...');
  // Fallback: try to get from env vars
  const serviceAccount = {
    "type": "service_account",
    "project_id": "naija-amebo-gist",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  };
  
  admin = initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const articlesToRestore = [
  {
    title: "Single Nigerian mom of 10 kids shares how she survives with her children!!!",
    description: "Just in: A remarkable story of a single Nigerian mother who shares her inspiring journey of raising 10 children.",
    excerpt: "Just in: A remarkable story of a single Nigerian mother who shares her inspiring journey of raising 10 children.",
    category: "entertainment",
    status: "approved",
    date: "1/12/2026, 2:51:25 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
    hashtags: ["nigerian", "mother", "children", "story", "inspiring"],
    image: "",
    video: "",
  },
  {
    title: "Teyana Taylor's emotional acceptance speech after winning her first Golden Globe award last night",
    description: "The Grammy-nominated singer and dancer took home the award for Best Supporting Female Actor in a Motion Picture for her performance in One Battle After Another.",
    excerpt: "The Grammy-nominated singer and dancer took home the award for Best Supporting Female Actor in a Motion Picture for her performance in One Battle After Another.",
    category: "celebrity-news",
    status: "approved",
    date: "1/12/2026, 2:58:41 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
    hashtags: ["teyana-taylor", "golden-globe", "award", "actress", "music"],
    image: "",
    video: "",
  },
  {
    title: "Nigerian doctor based in Germany lists benefits of paying his taxes",
    description: "If I loose my job, the govt pays me 60% of my salary and help to find a new one- Nigerian doctor based in Germany lists benefits of paying his taxes as he asks Nigerians what benefits they derive after tax payment",
    excerpt: "If I loose my job, the govt pays me 60% of my salary and help to find a new one- Nigerian doctor based in Germany lists benefits of paying his taxes as he asks Nigerians what benefits they derive after tax payment",
    category: "viral-content",
    status: "approved",
    date: "1/12/2026, 3:09:07 PM",
    submittedBy: "IFUNANYA ANISIOFOR",
    submitterEmail: "ifunanya.anisiofor@gmail.com",
    hashtags: ["doctor", "germany", "taxes", "benefits", "nigeria"],
    image: "",
    video: "",
  },
];

async function restoreArticles() {
  try {
    console.log("🔄 Starting article restoration...");
    
    for (const article of articlesToRestore) {
      const docRef = await db.collection('articles').add({
        ...article,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✓ Restored: ${article.title.substring(0, 50)}... (${article.category})`);
    }
    
    console.log("\n✅ All 3 articles restored successfully!");
    console.log("📢 Articles will appear on the website within 10 seconds.");
    console.log("\nVerify at:");
    console.log("  - Entertainment: https://amebo.org/entertainment");
    console.log("  - Celebrity-News: https://amebo.org/celebrity-news");
    console.log("  - Viral-Content: https://amebo.org/viral-content");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error restoring articles:", error);
    process.exit(1);
  }
}

restoreArticles();
