# 📰 Getting API Keys for Automated News System

Your automated news system is now ready! Follow these steps to activate real-time news on your website.

## Step 1: Get NewsAPI Key (Free - 100 requests/day)

1. Visit **https://newsapi.org**
2. Click **"Get API Key"** button
3. Sign up with your email (free account)
4. Verify your email
5. Copy your **API Key** from your account dashboard

![NewsAPI Screenshot]
```
Your key will look like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Step 2: Get RapidAPI Key (Free tier available)

1. Visit **https://rapidapi.com**
2. Sign up/Login
3. Go to **https://rapidapi.com/news-api14/api/news-api14**
4. Click **"Subscribe"** → Choose **Free Plan**
5. Copy your **X-RapidAPI-Key** from your account header (top right)

![RapidAPI Screenshot]
```
Your key will look like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Step 3: Add Keys to Your Project

### Option A: Local Development (.env.local)

Create or edit `.env.local` in your project root:

```
NEXT_PUBLIC_NEWSAPI_KEY=your_newsapi_key_here
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here
NEWS_UPDATE_TOKEN=any_secret_token_here
```

**Replace** the values with your actual keys.

### Option B: Railway Deployment

1. Go to your Railway project settings
2. Add **Environment Variables**:
   - `NEXT_PUBLIC_NEWSAPI_KEY` = your_newsapi_key
   - `NEXT_PUBLIC_RAPIDAPI_KEY` = your_rapidapi_key
   - `NEWS_UPDATE_TOKEN` = your_secret_token

---

## Step 4: Verify It's Working

### Check if News is Loading

1. Start your dev server: `npm run dev`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Look for requests to `/api/news/get`
5. Check if it returns news articles

### Manually Trigger News Update

In browser console, run:

```javascript
fetch('/api/news/update', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

You should see: `{ success: true, message: 'News updated successfully' }`

---

## What's Now Active on Your Homepage

✅ **Nigerian News Section** - 6 latest Nigerian articles with images
✅ **World News Section** - 6 latest world articles with images
✅ **Auto-refresh** - Updates every 15 minutes
✅ **Click to read** - Links open in new tab
✅ **Dark mode support** - Looks great in light/dark theme

---

## API Endpoints Available

### Get All News
```bash
GET /api/news/get?limit=50
```

### Get Nigerian News Only
```bash
GET /api/news/get?limit=20&category=Nigerian%20News
```

### Get World News Only
```bash
GET /api/news/get?limit=20&category=World%20News
```

### Manual News Update
```bash
POST /api/news/update
Authorization: Bearer your_secret_token
```

---

## Troubleshooting

### ❌ No news showing up?

1. **Check console errors** (Browser DevTools F12)
2. **Verify API keys are correct** - Copy again from website
3. **Check API key is active** - Log into NewsAPI.org and verify
4. **Check free tier limits** - NewsAPI gives 100 requests/day free
5. **Wait 5-10 minutes** - First fetch takes time

### ❌ Getting 401 Unauthorized error?

Your API keys are invalid or copied incorrectly:
- Make sure there are NO extra spaces
- Make sure you copied the FULL key
- Go back to the website and copy again

### ❌ Seeing "No news available"?

- API might be slow (first load can take 10-30 seconds)
- You might have exceeded free tier limits
- Try refreshing the page
- Check browser console for error messages

### ✅ Everything working?

Congratulations! Your automated news system is now live!

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| NewsAPI | 100 requests/day | $0 |
| RapidAPI | 1000 requests/month | $0-49/month |
| Firebase | Generous free tier | $0-100/month |
| **Total** | **Full automation** | **Free-$100** |

---

## Next: Display Different News Sections

You can customize which news shows where:

```jsx
// Show only Nigerian news
<AutomatedNewsDisplay limit={6} category="Nigerian News" />

// Show only World news
<AutomatedNewsDisplay limit={12} category="World News" />

// Show all news
<AutomatedNewsDisplay limit={20} />
```

---

## Support

If you need help:
1. Check the browser console (F12) for error messages
2. Check Railway logs for backend errors
3. Verify API keys are active on the service websites
4. Try refreshing the page and waiting 30 seconds

Your automated news system will now keep your website fresh with real news 24/7!
