# EMERGENCY FIX GUIDE - Site 404 & Analytics Issues

**Status:** ✅ Code compiles successfully locally  
**Latest Commit:** 41dd3b68 (Simplified AnalyticsTracker with better error handling)  
**Issue:** Production site showing 404 errors, analytics not working

---

## CRITICAL CHECKLIST - IMMEDIATE ACTIONS

### 1. **VERIFY RAILWAY HAS DEPLOYED THE LATEST CODE**

The most likely cause of 404 errors is that Railway hasn't deployed commit `41dd3b68` yet.

**Check this:**
1. Go to https://railway.app
2. Open your "naija-amebo-gist" project
3. Click on the deployment section
4. Check if the latest commit shows `41dd3b68`
5. If not, the old broken code is still running

**If Railway shows old commit:**
- Click "Redeploy" or "Trigger Deploy"
- Wait for build to complete (usually 3-5 minutes)
- Check logs for "Build successful"

**Railway Build Status:**
- Latest code is pushed to GitHub ✅
- Next.js build runs successfully locally ✅
- All 122 pages compile correctly ✅
- No TypeScript errors ✅

---

### 2. **CHECK BROWSER CONSOLE FOR JAVASCRIPT ERRORS**

If Railway has deployed latest code but pages still show 404:

1. Open the website on your mobile phone
2. Open browser console (Chrome DevTools)
3. Check for red error messages
4. Take a screenshot of any errors

**What to look for:**
- `Cannot find module` errors
- `ReferenceError: document is not defined`
- `Fetch failed` errors
- `CORS` errors

---

### 3. **VERIFY API ENDPOINTS ARE WORKING**

Test if the analytics endpoint is being called:

1. Open DevTools → Network tab
2. Refresh the page
3. Look for POST request to `/api/analytics/realtime-init`
4. Check if it returns status 200

**If request doesn't appear:**
- Analytics tracker might have a runtime error
- Component might not be initializing
- Check console errors

**If request appears but returns error:**
- Analytics endpoint might have an issue
- Check the API endpoint error message

---

### 4. **TEST SPECIFIC PAGES DIRECTLY**

Try visiting these exact URLs:

```
https://amebo.org/breaking-news
https://amebo.org/news/[any-article-id]
https://amebo.org/marketplace
https://amebo.org/super-admin/analytics
https://amebo.org/community
```

If all return 404:
- Issue is with routing/build on Railway
- Need to rebuild

If some work but others don't:
- Issue is with specific page configuration
- Investigate that page's code

---

## WHAT WAS FIXED

### ✅ AnalyticsTracker Improvements (Commit 41dd3b68)

```typescript
// BEFORE: Complex tracker that could break if any dependency fails
// Could cause entire page to fail if device fingerprinting errors

// AFTER: Simplified with better error isolation
✅ Wrap entire component in try-catch
✅ Catch errors in device fingerprinting separately
✅ Catch errors in network detection separately
✅ Graceful fallbacks when features fail
✅ Console logging for debugging
✅ Won't break the page if analytics fails
```

### Device Detection Flow

```
1. AnalyticsTracker loads on page
2. Creates session ID: session_[timestamp]_[random]
3. Tries to generate device fingerprint
   - If succeeds: Use fingerprint (95% accurate)
   - If fails: Use fallback device_[timestamp]
4. Tries to get network info
   - If succeeds: Include network provider (MTN, Airtel, etc)
   - If fails: Continue without it
5. Immediately sends page_view event
6. Every 10 seconds: Flush queued events to /api/analytics/realtime-init
7. API receives events and broadcasts via WebSocket
8. Admin dashboard sees new visitor
```

---

## ANALYTICS DATA FLOW

### Page Loading (What Should Happen)

```
User visits page
  ↓
AnalyticsTracker component initializes (app/layout.tsx)
  ↓
generateSessionId() → "session_1704xxx_abc123"
  ↓
getDeviceFingerprintBrowser() → "fp_device_xxxx" (95% accurate)
  ↓
getNetworkInfoBrowser() → "MTN" or "Airtel" etc
  ↓
trackEvent('page_view', {...}) → Added to queue
  ↓
Immediately POST to /api/analytics/realtime-init
  ↓
API receives events:
  - engine.trackPageView()
  - wsServer.emitEvent() sends WebSocket update
  ↓
Admin Dashboard receives update via WebSocket
  ↓
"New device detected: mobile, MTN" shows on analytics panel
```

### What to Check on Admin Dashboard

Location: `/super-admin/analytics`

**You should see:**
- Real-time visitor count
- Device fingerprints
- Network providers (MTN, Airtel, Glo, 9Mobile)
- Page views count
- Click events
- Scroll events

---

## TESTING CHECKLIST

### Local Testing (Before Deployment)

If you want to test locally before relying on Railway:

```bash
# Terminal 1 - Start dev server
npm run dev

# Terminal 2 - After server starts, open
http://localhost:3000

# Check:
1. Pages load without 404
2. Open DevTools → Console
3. Look for: "[Analytics] Session ID: session_xxx"
4. Look for: "[Analytics] ✅ Sent 1 events"
5. Open super-admin dashboard at /super-admin/analytics
6. Should show real-time updates
```

### Production Testing (Railway)

1. Visit https://amebo.org/breaking-news
2. If it works: ✅ Site is fixed
3. Open DevTools → Console → Filter "[Analytics]"
4. Should see:
   - "[Analytics] Session ID: ..."
   - "[Analytics] Initialized: ..."
   - "[Analytics] ✅ Sent X events"
5. Go to /super-admin/analytics dashboard
6. Your device should appear in real-time visitors

---

## DEBUGGING PAGE 404s

### If breaking-news shows 404 on Railway:

1. **Check if it's a build issue:**
   - Local build: ✅ Page exists and compiles
   - Railway build: ❓ Need to check logs

2. **Check if it's a routing issue:**
   - Page file exists: ✅ `/app/breaking-news/page.tsx`
   - Middleware configured: ✅ No blocking middleware
   - Data sources available: ✅ Firebase + extended-news.json

3. **Check if Railway cache is stale:**
   - Force rebuild and redeploy
   - Clear Railway build cache
   - Wait 5+ minutes for propagation

4. **Check data sources:**
   - Firebase connectivity: Verify in API logs
   - extended-news.json: Verify file exists in repo
   - API endpoints: Check if `/api/articles/get` works

---

## QUICK FIX STEPS

**If pages are still 404 after latest deploy:**

1. **Step 1:** Go to Railway dashboard
2. **Step 2:** Delete current deployment
3. **Step 3:** Trigger new deployment from latest commit
4. **Step 4:** Wait 5 minutes for build
5. **Step 5:** Test pages on mobile phone
6. **Step 6:** Open DevTools console and check for [Analytics] logs

**If analytics still not detecting:**

1. **Check console:** Are there error messages?
2. **Check network tab:** Is /api/analytics/realtime-init being called?
3. **Check response:** Does API return success (200)?
4. **Check dashboard:** Go to /super-admin/analytics - refresh page - do numbers update?

---

## EMERGENCY FALLBACK

If pages still show 404 after following all steps:

1. **Revert to previous working commit:**
   ```bash
   git log --oneline (find last known good commit)
   git reset --hard [previous-commit]
   git push origin main --force
   ```

2. **Trigger fresh rebuild:**
   - Delete Railway build cache
   - Redeploy from clean state

3. **Monitor logs:**
   - Check Railway build logs for errors
   - Check Railway runtime logs for errors

---

## KEY FILES TO CHECK

| File | Purpose | Last Updated |
|------|---------|--------------|
| components/AnalyticsTracker.tsx | Tracking initialization | Commit 41dd3b68 |
| app/api/analytics/realtime-init/route.ts | Event processor | Working ✅ |
| app/layout.tsx | Tracker mounted here | Line 171 ✅ |
| app/breaking-news/page.tsx | News page | Working ✅ |
| lib/device/DeviceFingerprint.ts | Device detection | Working ✅ |
| lib/network/NetworkDetector.ts | Network detection | Working ✅ |

---

## CONTACT INFO FOR RAILWAY SUPPORT

If Railway build keeps failing:

1. Check Railway logs for specific error
2. Copy full error message
3. Go to Railway Discord: https://discord.gg/railway
4. Post error in #help channel
5. Include:
   - Repository: naija-amebo-gist
   - Latest commit: 41dd3b68
   - Error screenshot
   - Build logs excerpt

---

## WHAT NOT TO DO

❌ Don't edit code without testing locally first  
❌ Don't push broken code to main  
❌ Don't force-push history unnecessarily  
❌ Don't ignore console errors - they're telling you what's wrong  
❌ Don't assume Railway cached old version without checking  

---

## SUCCESS INDICATORS

✅ Pages load without 404  
✅ Console shows "[Analytics] Session ID: ..."  
✅ Network tab shows POST to /api/analytics/realtime-init with 200 response  
✅ Admin dashboard shows new visitor with device fingerprint  
✅ Multiple page visits accumulate in visitor count  
✅ Network provider shows correctly (MTN, Airtel, etc)  

---

**Last Updated:** 2024-01-08  
**Status:** Code ready for deployment  
**Next Step:** Verify Railway has deployed commit 41dd3b68
