# 🎯 QUICK START: Testing News on amebo.org

**Website:** https://amebo.org  
**Status:** ✅ Code Deployed to Production  

---

## 1️⃣ Create Breaking News

**Go to:** https://amebo.org/super-admin/news-management

**Look for:** "🚨 Breaking News Monitor" section

**Fill in:**
- Title: "Test News - Jan 12"
- Description: "Testing the breaking news system"
- Select platforms: Facebook, Twitter
- Click: "🚨 Publish Breaking News"

**Expected:** Green toast saying "News created" and "Published"

---

## 2️⃣ Verify It Appears

**Go to:** https://amebo.org/breaking-news

**Check:**
- Does your news appear at the top?
- Can you see the title and description?
- Is the image loading?

**CRITICAL:** Refresh the page 5 times - does the news stay there?

---

## 3️⃣ Test Other Categories

**Create and test each:**
- https://amebo.org/trending-stories (Trending)
- https://amebo.org/celebrity (Celebrity)
- https://amebo.org/entertainment (Entertainment)
- https://amebo.org/viral-content (Viral)

**For each:** Create news → Verify it appears → Refresh 5x → Check it's still there

---

## 4️⃣ Check the Database

**Go to:** https://console.firebase.google.com  
**Select:** naija-amebo-gist project  
**Navigate:** Firestore → articles collection

**Verify you see:**
- Your test news documents
- Fields have correct names: `category`, `status`, `title`, etc.
- Status is `approved`
- Category is `breaking-news` (not `breaking`)

---

## ✅ Success Checklist

- [ ] News appears on amebo.org after creation
- [ ] News is still there after page refresh (5x minimum)
- [ ] Can test all categories
- [ ] Firebase console shows correct data
- [ ] No console errors (F12)
- [ ] NO NEWS DISAPPEARS

---

## 🔴 If Something Goes Wrong

**Check in order:**

1. **Refresh page** - Clear cache (Ctrl+Shift+Del) and reload
2. **Check Firebase** - Is the document there?
3. **Check API** - Go to `/api/articles/get?category=breaking-news&status=approved`
4. **Check Console** - Press F12, go to Console tab, any red errors?
5. **Check Network** - Press F12, go to Network tab, any 500 errors?

---

## 📞 Quick Links

| Item | URL |
|------|-----|
| Live Site | https://amebo.org |
| Breaking News Page | https://amebo.org/breaking-news |
| Admin Panel | https://amebo.org/super-admin/news-management |
| Firebase Console | https://console.firebase.google.com |
| GitHub Repo | https://github.com/anisioforifunanya/naija-amebo-gist |
| Railway Dashboard | https://railway.app/dashboard |

---

**Timeline:**
- ✅ Code fixed (Jan 12)
- ✅ Pushed to GitHub (Jan 12)
- ⏳ Deployed to Railway (auto, 1-2 min)
- ⏳ Testing (NOW)

