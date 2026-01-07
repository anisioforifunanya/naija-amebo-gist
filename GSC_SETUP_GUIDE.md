# 🔍 Google Search Console Setup - Quick Start

## ✅ Pre-Deployment Checklist

- [x] Domain: https://amebo.org (SSL certificate active)
- [x] Sitemap: https://amebo.org/sitemap.xml (live)
- [x] Robots.txt: https://amebo.org/robots.txt (live)
- [x] Meta tags: Implemented in layout.tsx
- [x] JSON-LD schema: Implemented
- [x] 65+ keywords: In seo-config.ts

---

## 🎯 DO THIS NOW (Takes 10 minutes)

### Step 1: Add Property to Google Search Console
**URL:** https://search.google.com/search-console

1. Click **"Add property"** button
2. Select **"URL prefix"** (don't use domain property)
3. Enter: `https://amebo.org`
4. Click **"Continue"**

### Step 2: Verify Domain Ownership
You'll see 4 verification methods. Choose **DNS record**:

1. **Copy the TXT record value** that Google shows
2. **Go to Namecheap:**
   - Navigate to: Dashboard → Domains → amebo.org → Manage → Advanced DNS
   - Click: **"Add New Record"**
   - Type: **TXT**
   - Host: **@** (the @ symbol)
   - Value: **Paste Google's TXT record**
   - TTL: **30 min** (leave as default)
   - Click: **✓ Save**
3. **Return to GSC** and click **"Verify"**
4. **Wait 2-5 minutes** and refresh GSC

### Step 3: Submit Sitemap
Once verified:

1. In GSC, go to **"Sitemaps"** (left menu)
2. Paste: `https://amebo.org/sitemap.xml`
3. Click **"Submit"**
4. You should see "Success" message

### Step 4: Check Indexing Status
Go to **"Coverage"** tab:

- **Indexed:** Should show 100+ pages
- **Errors:** Fix any red items immediately
- **Warnings:** Address yellow items (low priority)

---

## 📊 Monitor Your Rankings

### Daily Tasks (2 minutes)
- Check **Coverage** for new errors
- Review **Performance** for impressions/clicks

### Weekly Tasks (10 minutes)
- Check keyword rankings in **Performance** tab
- Look for new keyword opportunities
- Monitor CTR (Click-Through Rate)

### Monthly Tasks (30 minutes)
- Analyze ranking trends
- Identify top-performing keywords
- Find low-hanging fruit keywords to target

---

## 🎯 What to Expect

### Week 1-2
- ✅ Pages indexed (may take 1-2 weeks)
- ✅ Sitemap processed
- ✅ Initial crawl data appears

### Week 3-4
- ✅ Search impressions start appearing (50-200/week)
- ✅ Keyword data in Performance tab
- ✅ Average ranking position: 50-100

### Month 2-3
- ✅ Impressions increase to 500-1000+
- ✅ First keywords enter top 50
- ✅ Average ranking: 30-50

### Month 6+
- ✅ Top 10 rankings for 10-15 keywords
- ✅ 5000+ monthly impressions
- ✅ 100+ monthly clicks

---

## 🛠️ Troubleshooting

### "Verification Failed"
- **Check:** TXT record was added to correct domain (amebo.org)
- **Check:** TXT value is exactly copied from GSC (no extra spaces)
- **Wait:** DNS can take 5-30 minutes to propagate
- **Retry:** Try verification again after 15 minutes

### "Sitemap Not Indexed"
- **Check:** Sitemap URL is correct: `https://amebo.org/sitemap.xml`
- **Check:** Sitemap is accessible (test by visiting URL)
- **Wait:** Can take 24-48 hours for full processing
- **Check:** No robots.txt blocking

### "Pages Not Indexed"
- **Check:** No noindex meta tag blocking pages
- **Check:** robots.txt allows crawling
- **Check:** No redirect loops
- **Wait:** Indexing can take 1-4 weeks for new sites

---

## 🎓 Key Performance Indicators (KPIs)

Monitor in GSC **Performance** tab:

1. **Impressions:** Total times your site appeared in search results
   - Week 1: 0-50
   - Week 4: 100-500
   - Month 2: 500-2000

2. **Clicks:** Total times users clicked your link
   - Track CTR = Clicks / Impressions
   - Healthy CTR: 3-5% for new site

3. **Average Position:** Your average ranking position
   - Track trending (should improve over time)
   - Target: < 20 average position

4. **Top Keywords:** Most common search queries bringing traffic
   - Document these monthly
   - Optimize content for top keywords

---

## 🚀 Next Actions (After GSC Setup)

1. **Enable Google Analytics 4** (analytics.google.com)
2. **Link GSC to Analytics** (for traffic data)
3. **Set up email alerts** for critical errors in GSC
4. **Create content calendar** based on target keywords
5. **Build backlinks** from Nigerian news/entertainment sites

---

## 📞 Support Resources

- **[Google Search Console Help](https://support.google.com/webmasters)**
- **[GSC Training](https://www.youtube.com/results?search_query=google+search+console+tutorial)**
- **[Verification Help](https://support.google.com/webmasters/answer/9008080)**

---

**Status:** Ready for Google Search Console
**Domain:** https://amebo.org
**Last Updated:** January 7, 2026
