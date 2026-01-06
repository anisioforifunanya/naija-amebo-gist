# Firebase Sync Troubleshooting Guide

## Quick Summary
You have **three ways** to manage user verification:

| Method | How It Works | When to Use |
|--------|-------------|------------|
| **Firebase Sync** | Pulls users from Firebase Firestore | When Firebase is properly configured |
| **Manual Addition** | Admin manually adds users via form | When Firebase isn't working |
| **Refresh Data** | Reloads users from localStorage | To see latest local changes |

---

## Step 1: Run Diagnostics

1. Go to **Admin Dashboard** → **Facial Verification** tab
2. Click **🔧 Diagnostics** button (orange button)
3. Read the report to understand what's happening

### Diagnostics Output Explained

```
✅ Firebase Config Loaded     - Firebase module found
✅ Firestore Initialized      - Database connection established
✅ Firestore Accessible       - Can read from database
✅ Users Collection Exists    - Collection "users" found with X users
```

---

## Troubleshooting by Error Type

### Error: "Firebase Config Loaded" is ❌

**Problem**: Firebase module cannot be imported

**Solutions**:
1. Check that `lib/firebase.ts` file exists
2. Verify Firebase config in that file has correct values
3. Check browser console (F12) for import errors

**Code to check** [lib/firebase.ts](lib/firebase.ts):
```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "naija-amebo-gist",
  // etc
}
```

---

### Error: "Firestore Initialized" is ❌

**Problem**: Database connection failed

**Solutions**:
1. Check internet connection
2. Verify Firebase project is active (not deleted)
3. Check Railway environment variables are set
4. Look at browser console for specific error

**Environment Variables to Add** (in Railway dashboard):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAzYQ2xM-Z1_VtVvXZqOK0jcEOI89DshT4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=naija-amebo-gist.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=naija-amebo-gist
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=naija-amebo-gist.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=749835043572
NEXT_PUBLIC_FIREBASE_APP_ID=1:749835043572:web:d3b784f2d1a69f369714a1
```

---

### Error: "Firestore Accessible" is ❌ with "permission-denied"

**Problem**: Firestore security rules don't allow reads

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **naija-amebo-gist** project
3. Go to **Firestore Database** → **Rules**
4. Replace rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads/writes for now
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**
6. Try syncing again

**Security Note**: This rule allows anyone to read/write. For production, use proper authentication.

---

### Error: "Users Collection Exists" is ❌ or shows "Found 0 users"

**Problem**: Firestore database is empty

**Solutions**:
1. Users haven't been saved to Firebase yet (normal during development)
2. Go to Firebase Console and check if "users" collection exists
3. If collection is empty, that's fine! Use **➕ Add User Manually** instead

**To populate Firestore** (future enhancement):
- Modify registration page to save users to Firestore
- Modify facial verification to save photo to Firestore
- See [FIREBASE_PRODUCTION_SETUP.md](FIREBASE_PRODUCTION_SETUP.md) for code examples

---

### Error: "Service Unavailable"

**Problem**: Firebase service is temporarily down

**Solution**:
- Wait a few minutes and try again
- Check [Firebase Status Page](https://status.firebase.google.com)
- Use **➕ Add User Manually** in the meantime

---

### Error: "Indexes not ready"

**Problem**: Firestore is building required database indexes

**Solution**:
- Wait 1-5 minutes for indexes to build
- Firebase will show progress in console
- Try again after waiting

---

## Step 2: Using Fallback Methods

If Firebase sync doesn't work, you have alternatives:

### Option A: Add User Manually (Recommended)

1. Click **➕ Add User Manually** button
2. Fill in user details:
   - First Name *
   - Last Name *
   - Email *
   - Phone (optional)
   - Location (optional)
   - Date of Birth (optional)
   - Gender (optional)
3. Click **➕ Add User**
4. User appears in pending list with placeholder photo
5. Click **✓ Approve** to approve them

**Pros**: Works offline, quick, no Firebase needed
**Cons**: Manual process for each user

---

### Option B: Sync Later

1. Fix Firebase issues following troubleshooting steps above
2. Come back and click **🔄 Sync Firebase**
3. Users will sync from Firestore

---

## Step 3: Testing the Workflow

Once users are in the system (from Firebase or manual add):

### Test Approval Flow
1. User appears with **⏳ Pending** status
2. Check their placeholder photo
3. Click **✓ Approve** button
4. Select approval date
5. User status changes to **✅ Approved**
6. User can now access all features

### Verify User Access
1. Switch to approved user account
2. Go to **Community** → Should see "No messages yet"
3. Go to **Private Messages** → Should see message options
4. Go to **Dashboard** → Should see dashboard

If user still gets blocked, check:
- User has `verificationStatus: 'approved'`
- User has `accountStatus: 'approved'`
- Browser localStorage has latest user data
- No caching issues (Ctrl+Shift+Delete to clear cache)

---

## Step 4: Check Browser Logs

For debugging, always check browser console:

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for messages starting with:
   - ✅ (success)
   - ❌ (errors)
   - 📊 (info)

**Common useful logs**:
```
✅ Firestore query successful
📊 Number of documents: 3
👥 Firebase users fetched: [...]
❌ Firebase sync error: permission-denied
```

Copy these messages and use them to troubleshoot.

---

## Permanent Fix: Enable Firebase Sync

To make Firebase sync work permanently in production:

### 1. Update User Registration
[app/register/page.tsx](app/register/page.tsx) - Add to registration flow:
```typescript
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// After user is created
await setDoc(doc(db, 'users', newUser.id), {
  id: newUser.id,
  firstName: newUser.firstName,
  lastName: newUser.lastName,
  email: newUser.email,
  verificationStatus: 'not_started',
  accountStatus: 'pending_verification',
  // ... other fields
})
```

### 2. Update Facial Verification
[app/facial-verification/page.tsx](app/facial-verification/page.tsx) - Add:
```typescript
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// After photo is captured
await updateDoc(doc(db, 'users', currentUser.id), {
  facialPhoto: photoUrl,
  verificationStatus: 'pending',
  verificationSubmittedAt: new Date().toISOString()
})
```

### 3. Fix Firestore Security Rules
Go to Firebase Console → Firestore → Rules → Set proper authentication checks

### 4. Test in Development
```bash
npm run dev
# Go to http://localhost:3001/register
# Complete registration flow
# Check Firestore Console to see if user was saved
```

---

## Quick Reference

### Admin Buttons
- **🔄 Sync Firebase** - Pull all users from Firestore
- **➕ Add User Manually** - Manually create pending user
- **🔄 Refresh Data** - Reload data from localStorage
- **🔧 Diagnostics** - Run diagnostic checks

### User Statuses
- **⏳ Pending** - Waiting for facial verification
- **✅ Approved** - Can access all features
- **❌ Rejected** - Cannot use platform

### Features Protected by Verification
- ✅ Community (group chat)
- ✅ Dashboard (user home)
- ✅ Private Messages
- ❌ NOT protected: Login, Register, Facial Verification, Admin Panel

---

## Still Having Issues?

1. **Check console**: F12 → Console tab → Look for red errors
2. **Run diagnostics**: Click 🔧 button and read report
3. **Use manual add**: ➕ button works without Firebase
4. **Check Firebase Console**: https://console.firebase.google.com
5. **Check Railway Logs**: Production deployment logs
6. **Verify rules**: Firebase Console → Firestore → Rules

For persistent issues, the system will keep working with manual user management while you investigate Firebase configuration.
