# Firebase Sync Testing Checklist

## Pre-Testing Setup
- [ ] Development server running (`npm run dev`)
- [ ] Browser open to `http://localhost:3001` or production URL
- [ ] Admin account created/logged in
- [ ] Navigated to `/admin` → **Facial Verification** tab
- [ ] Browser DevTools open (`F12` → Console tab)

---

## Test 1: Run Diagnostics

### Steps
1. Click **🔧 Diagnostics** button (orange)
2. Read the report

### Expected Results
- [x] Firebase Config Loaded: **✅**
- [x] Firestore Initialized: **✅**
- [x] Firestore Accessible: **✅**
- [x] Users Collection Exists: **✅**
- [x] Users found: **> 0**

### If Failed
Follow troubleshooting in [FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)

---

## Test 2: Sync Firebase Users

### Prerequisites
- [ ] Diagnostics shows **✅ Firestore Accessible**
- [ ] Firestore database has at least 1 user

### Steps
1. Click **🔄 Sync Firebase** button (purple)
2. Wait for alert message
3. Check browser console for logs

### Expected Results
- [x] Alert shows: "✅ Successfully synced X users from Firebase!"
- [x] Users appear in the list below
- [x] Each user shows with photo and details
- [x] Console shows: "✅ Successfully synced X users"

### If Failed
- [ ] Check error message in alert
- [ ] Look at console (F12) for detailed error
- [ ] Follow specific error troubleshooting in guide

**Common Errors**:
- "Firestore is empty" → Use manual add instead
- "Permission denied" → Fix Firestore rules
- "Service unavailable" → Try again later

---

## Test 3: Add User Manually

### Steps
1. Click **➕ Add User Manually** button (green)
2. Fill in form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Phone: "08012345678" (optional)
   - Location: "Lagos" (optional)
   - DOB: any date (optional)
   - Gender: "Male" (optional)
3. Click **➕ Add User**
4. Check alert message

### Expected Results
- [x] Alert shows: "✅ User John Doe added for verification"
- [x] Modal closes
- [x] New user appears in list with **⏳ Pending** status
- [x] User has placeholder photo
- [x] User details match what was entered

### If Failed
- [ ] Check all required fields filled
- [ ] Look at browser console for errors
- [ ] Check localStorage: `localStorage.getItem('naijaAmeboUsers')`

---

## Test 4: Approve User

### Prerequisites
- [ ] At least one user in **Pending** status (from manual add or Firebase sync)
- [ ] Filter set to **Pending**

### Steps
1. Find user with **⏳ Pending** status
2. Click **✓ Approve** button
3. In modal:
   - Verify user details correct
   - Select approval date
   - Click **Approve**
4. Check result

### Expected Results
- [x] User status changes from **⏳ Pending** to **✅ Approved**
- [x] User removed from pending list
3. [x] Filter shows updated count
- [x] Toast shows: "✅ User approved successfully"

### If Failed
- [ ] Check for errors in console
- [ ] Try refreshing with **🔄 Refresh Data**
- [ ] Check localStorage corruption

---

## Test 5: Access Control

### Prerequisites
- [ ] At least one approved user from Test 4
- [ ] At least one unapproved user (pending or rejected)

### Steps

#### For Approved User
1. Log in as approved user
2. Try to access: `/community`
3. Try to access: `/dashboard`
4. Try to access: `/private-messages`

**Expected**: ✅ All pages load normally

#### For Unapproved User
1. Log in as unapproved user
2. Try to access: `/community`
3. Try to access: `/dashboard`
4. Try to access: `/private-messages`

**Expected**: Redirect to `/verification-pending` with message

### If Failed
- [ ] Check that user's `verificationStatus` is correct
- [ ] Check that user's `accountStatus` is correct
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check console for JavaScript errors

---

## Test 6: Reject User

### Prerequisites
- [ ] At least one user in **Pending** status

### Steps
1. Click **✗ Reject** button for pending user
2. Enter rejection reason: "Photo not clear"
3. Click **Reject**

### Expected Results
- [x] User status changes to **❌ Rejected**
- [x] Rejection reason shows
- [x] User removed from pending list
- [x] Toast shows: "✅ User rejected"

### If Failed
- [ ] Check console for errors
- [ ] Verify rejection data in localStorage

---

## Test 7: Refresh Data

### Steps
1. Manually modify localStorage directly (optional)
2. Click **🔄 Refresh Data** button (blue)
3. Check if data updates

### Expected Results
- [x] Users list reloads
- [x] Stats update
- [x] Any changes reflected immediately

---

## Test 8: Data Persistence

### Steps
1. Refresh the page (F5)
2. Navigate back to `/admin` → **Facial Verification**
3. Check if users still visible

### Expected Results
- [x] All users appear exactly as before
- [x] Approval status unchanged
- [x] No data lost

### If Failed
- [ ] Check localStorage: `localStorage.getItem('naijaAmeboUsers')`
- [ ] Verify data not corrupted: `JSON.parse(localStorage.getItem('naijaAmeboUsers'))`
- [ ] Look for JavaScript errors in console

---

## Test 9: Production Deployment

### Steps
1. Commit all changes: `git add . && git commit -m "msg"`
2. Push to GitHub: `git push`
3. Monitor Railway deployment
4. Go to production URL (https://naija-amebo-gist-production.up.railway.app)
5. Log in as admin
6. Run diagnostics

### Expected Results
- [x] Deployment completes without errors
- [x] Admin panel accessible
- [x] Diagnostics run successfully
- [x] Users sync from Firebase (if configured)
- [x] Manual add still works

### If Production Diagnostics Fail
- [ ] Check Railway environment variables set correctly
- [ ] Check Firestore rules allow access
- [ ] Use manual user management as fallback
- [ ] See [FIREBASE_PRODUCTION_SETUP.md](FIREBASE_PRODUCTION_SETUP.md)

---

## Summary Checklist

| Test | Status | Notes |
|------|--------|-------|
| Diagnostics | [ ] Pass | |
| Firebase Sync | [ ] Pass | |
| Manual Add | [ ] Pass | |
| User Approval | [ ] Pass | |
| Access Control | [ ] Pass | |
| User Rejection | [ ] Pass | |
| Data Refresh | [ ] Pass | |
| Persistence | [ ] Pass | |
| Production Deploy | [ ] Pass | |

---

## When to Use Each Method

### Use Firebase Sync when:
- ✅ Firestore database is populated
- ✅ Diagnostics shows all green
- ✅ Users already saved in Firebase
- ✅ Want automatic sync

### Use Manual Add when:
- ✅ Firebase not configured yet
- ✅ Diagnostics shows errors
- ✅ Quick testing needed
- ✅ Backup when Firebase fails
- ✅ Adding ad-hoc users

### Use Refresh Data when:
- ✅ Data seems out of sync
- ✅ Just made changes
- ✅ Check latest state
- ✅ Troubleshooting

---

## Console Commands for Advanced Users

```javascript
// View all users in localStorage
JSON.parse(localStorage.getItem('naijaAmeboUsers'))

// View pending users only
JSON.parse(localStorage.getItem('naijaAmeboUsers')).filter(u => u.verificationStatus === 'pending')

// Count approved users
JSON.parse(localStorage.getItem('naijaAmeboUsers')).filter(u => u.verificationStatus === 'approved').length

// Clear all users (careful!)
localStorage.removeItem('naijaAmeboUsers')

// Add test user manually
const users = JSON.parse(localStorage.getItem('naijaAmeboUsers')) || []
users.push({
  id: `test_${Date.now()}`,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  verificationStatus: 'pending',
  facialPhoto: 'data:...'
})
localStorage.setItem('naijaAmeboUsers', JSON.stringify(users))
```

---

## Still Having Issues?

1. **Check Console**: F12 → Console tab for errors
2. **Run Diagnostics**: Click 🔧 button for detailed report
3. **Check Firestore**: Go to Firebase Console and verify data
4. **Check Rails**: View production logs in Railway dashboard
5. **Use Manual Add**: Always works, no Firebase needed
6. **Read Guides**: 
   - [FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)
   - [FIREBASE_PRODUCTION_SETUP.md](FIREBASE_PRODUCTION_SETUP.md)
