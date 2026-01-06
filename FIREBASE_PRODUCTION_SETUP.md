# Firebase Production Setup Guide

## Overview
This guide explains how to properly configure Firebase for production deployment on Railway.

## Current Firebase Configuration
- **Project ID**: naija-amebo-gist
- **API Key**: AIzaSyAzYQ2xM-Z1_VtVvXZqOK0jcEOI89DshT4
- **Database**: Firestore
- **Auth Domain**: naija-amebo-gist.firebaseapp.com

## Production Sync Issues & Solutions

### Issue: Firebase sync fails on Railway production
**Symptoms**: 
- "Failed to sync from Firebase" error
- Users collection is empty
- Permission denied errors

### Solution Checklist

#### 1. **Verify Firestore Database is Populated**
```
Go to: Firebase Console → Firestore Database
Check if "users" collection exists and has documents
```

#### 2. **Check Firestore Security Rules**
```
Go to: Firebase Console → Firestore → Rules
Use these rules for development (update for production):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // For testing only - remove in production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 3. **Ensure Users are Saved to Firestore**
Currently, users are only saved to localStorage. To enable Firebase sync:

**In user registration** (`/app/register/page.tsx`):
```typescript
// Add this after user creation:
import { addUser } from '@/lib/firebaseUtils'

await addUser({
  id: newUser.id,
  firstName: newUser.firstName,
  lastName: newUser.lastName,
  email: newUser.email,
  // ... other fields
})
```

**In facial verification** (`/app/facial-verification/page.tsx`):
```typescript
// Update user in Firestore when saving photo
await updateUserVerification({
  userId: currentUser.id,
  facialPhoto: photoUrl,
  verificationStatus: 'pending'
})
```

#### 4. **Railway Environment Setup**
No additional env vars needed if using hardcoded Firebase config.
However, for security, use environment variables:

```bash
# In Railway dashboard, add these Variables:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAzYQ2xM-Z1_VtVvXZqOK0jcEOI89DshT4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=naija-amebo-gist.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=naija-amebo-gist
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=naija-amebo-gist.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=749835043572
NEXT_PUBLIC_FIREBASE_APP_ID=1:749835043572:web:d3b784f2d1a69f369714a1
```

Then update `lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

#### 5. **Test Firebase Connection**
Click **🔄 Sync Firebase** in the admin panel.
- Check browser console (F12) for detailed error messages
- If it fails, it will show specific error type:
  - `permission-denied`: Fix Firestore rules
  - `unavailable`: Firebase service issue
  - `failed-precondition`: Indexes building

#### 6. **Fallback Option**
If Firebase cannot be fixed quickly, continue using:
- ✅ **➕ Add User Manually** - Admin manually adds users
- ✅ **🔄 Refresh Data** - View locally stored users
- ✅ **Approve/Reject** - Works with localStorage

## Quick Start for Production

1. **Go to Admin Dashboard** → **Facial Verification** tab
2. Click **🔄 Sync Firebase** to pull from production database
3. If it fails, click **➕ Add User Manually** to add users
4. Once users appear, click **✓ Approve** to approve them
5. Users can then access all features

## Testing Firebase Sync Locally

```bash
# In your terminal:
npm run dev

# Go to: http://localhost:3001/admin
# Click "Facial Verification" tab
# Click "🔄 Sync Firebase"
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Firebase not initialized" | Config missing | Add `lib/firebase.ts` config |
| "Permission denied" | Firestore rules | Update security rules |
| "Collection not found" | Empty collection | Create "users" collection in Firestore |
| "Service unavailable" | Firebase down | Try again later |
| "Invalid API key" | Wrong config | Check Firebase credentials |

## Contact
If Firebase sync still doesn't work, use the manual admin tools in the verification panel.
