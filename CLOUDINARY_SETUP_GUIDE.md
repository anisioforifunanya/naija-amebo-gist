# Image Storage Setup Guide - Cloudinary

## Problem Solved
✅ Your original uploaded images were stored as base64 in browser localStorage (not synced to server)  
✅ Now using **Cloudinary** - professional image storage and delivery  
✅ Images will persist across browsers and deployments  

---

## Step 1: Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email or Google account
3. Verify your email
4. Go to **Dashboard** (top right)

---

## Step 2: Get Your Cloudinary Credentials

In your Cloudinary Dashboard, find:
- **Cloud Name** - Located at the top of the dashboard
- **API Key** - Under Account Settings → API Keys

---

## Step 3: Create Upload Preset

1. Go to **Settings** → **Upload** (in dashboard)
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Set **Mode** to "Unsigned"
5. Set a name like: `naija-amebo-gist`
6. Click **Save**
7. Copy the preset name

---

## Step 4: Update Your `.env.local` File

Open `.env.local` in your project root and replace:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dj3k5m9vx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=naija-amebo-gist
```

---

## Step 5: Test the Setup

1. Save `.env.local`
2. Restart your development server: `npm run dev`
3. Go to: http://localhost:3000/submit-news
4. Upload a test image and submit
5. Check if image appears in breaking news section

---

## Retrieve Your Original Images

**Your previously uploaded images are in browser localStorage:**

1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Find entry starting with `http://localhost:3000`
4. Look for key: `naijaAmeboNews`
5. The images are there as base64 strings

**To migrate them:**
- I can extract them and upload to Cloudinary
- Update your news articles with new URLs
- This requires accessing the localStorage data from your browser

---

## Cost

✅ **Completely Free**
- 25GB/month storage (free tier)
- Unlimited transformations
- 25 monthly credits
- No credit card required to start

---

## Features Now Available

- 📸 Automatic image compression (saves storage & bandwidth)
- 🚀 Fast CDN delivery worldwide
- 📱 Responsive images for all devices
- 🔄 URL-based image transformations
- 🎨 Smart cropping and filtering
- 📊 Upload analytics

---

## Next Steps

1. Create Cloudinary account
2. Add credentials to `.env.local`
3. Restart dev server
4. Test by uploading news with images
5. Let me know when ready, and I can help migrate old images

