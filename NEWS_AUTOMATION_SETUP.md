# Automated Real-Time News System Setup

This system automatically fetches Nigerian and world news every 15 minutes and displays it on your website.

## Features

- ✅ **Multiple News Sources**: NewsAPI, Rapid News API, and Nigerian news sites
- ✅ **Auto-Update Every 15 Minutes**: Background scheduler keeps content fresh
- ✅ **Auto-Expiration**: Old news (48+ hours) automatically removed
- ✅ **Both Nigerian & World News**: Full coverage
- ✅ **Duplicate Prevention**: Same article won't be added twice
- ✅ **Zero Manual Updates**: Fully automated 24/7

## Setup Instructions

### 1. Get API Keys

You need to obtain free API keys:

**NewsAPI** (100 requests/day free)
- Go to: https://newsapi.org
- Sign up → Get your free API key
- Copy your key

**RapidAPI** (Free tier available)
- Go to: https://rapidapi.com/news-api14/api/news-api14
- Sign up → Subscribe to News API 14
- Copy your API key

### 2. Configure Environment Variables

1. Open `.env.local` file (create if it doesn't exist)
2. Add your API keys:

```
NEXT_PUBLIC_NEWSAPI_KEY=your_newsapi_key_here
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here
NEWS_UPDATE_TOKEN=your_secret_token_here
```

3. Replace the values with your actual keys

### 3. How It Works

**On the Client Side:**
- When the website loads, it triggers the first news update
- Every 15 minutes, it calls `/api/news/update`
- News is stored in your Firebase Firestore database

**Automatic Features:**
- Fetches from NewsAPI (Nigeria & world news)
- Fetches from RapidAPI (additional coverage)
- Removes duplicates based on URL
- Deletes articles older than 48 hours
- Runs silently in the background

### 4. Manual Trigger (Optional)

To manually trigger a news update:

```bash
curl -X POST https://your-site.com/api/news/update
```

Or from your admin panel, make a POST request to `/api/news/update`

### 5. View Automated News

Use the API endpoint to fetch news:

```bash
# Get all news (limit 50)
GET /api/news/get?limit=50

# Get Nigerian news only
GET /api/news/get?limit=50&category=Nigerian%20News

# Get world news only
GET /api/news/get?limit=50&category=World%20News
```

### 6. Display News on Homepage

In your components, use this to fetch automated news:

```typescript
import { getAllAutomatedNews } from '@/lib/newsService'

const news = await getAllAutomatedNews(20)
```

Or via API call:

```javascript
const response = await fetch('/api/news/get?limit=20')
const { articles } = await response.json()
```

## Firebase Collection

Articles are stored in Firestore under:
- **Collection**: `automated-news`
- **Fields**:
  - `title` - Article title
  - `description` - Article summary
  - `url` - Link to full article
  - `urlToImage` - Article image
  - `publishedAt` - Publication date
  - `source` - News source
  - `category` - Nigerian News / World News
  - `country` - Country of origin
  - `createdAt` - When added to database
  - `expiresAt` - When article will be deleted (48 hours)

## Troubleshooting

**No news updating?**
1. Check `.env.local` has correct API keys
2. Check browser console for errors
3. Verify API keys are active on NewsAPI.org and RapidAPI

**Getting "401 Unauthorized"?**
1. Your API keys might be invalid
2. Check they're copied completely (no extra spaces)
3. Verify NewsAPI free tier is active

**News not appearing on site?**
1. Create a new component to display news from `/api/news/get`
2. Or use `getAllAutomatedNews()` function directly

## Cost

- **NewsAPI**: Free tier = 100 requests/day (plenty for 15-min updates)
- **RapidAPI**: Free tier available (check on their site)
- **Firebase**: Free tier covers thousands of articles

## Next Steps

1. Add API keys to `.env.local`
2. Deploy to Railway
3. News updates will start automatically
4. Create components to display the news

Questions? The system logs everything - check Railway logs for details.
