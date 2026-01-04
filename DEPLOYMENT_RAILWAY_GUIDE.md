# Deployment Guide for Railway.app

## 🚀 Complete Automatic Deployment Guide

Your NAIJA AMEBO GIST application is ready for automatic deployment to Railway.app!

---

## ✅ Pre-Deployment Checklist (Already Completed)

- [x] Firebase configured and integrated
- [x] Firestore database set up
- [x] Firebase Authentication implemented
- [x] Community chat using Firebase
- [x] Private messages using Firebase
- [x] User registration with Firebase
- [x] User login with Firebase
- [x] Production build tested
- [x] Environment variables configured
- [x] Railway.json created
- [x] Procfile created

---

## 🎯 Deployment Steps (3 Minutes)

### Step 1: Create Railway Account (1 minute)
1. Go to https://railway.app
2. Click **"Sign Up"**
3. Click **"Sign up with GitHub"**
4. Authorize Railway to access your GitHub account
5. Done! ✅

### Step 2: Create New Project (30 seconds)
1. Click **"+ New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Select **"naija-amebo-gist"** repository
4. Click **"Deploy"**

Railway automatically detects it's a Next.js app and starts building!

### Step 3: Configure Environment Variables (1 minute)
1. In Railway dashboard, go to **"Variables"** tab
2. The Firebase variables are already in `.env.example`
3. Click **"Add Variable"** for each:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAzYQ2xM-Z1_VtVvXZqOK0jcEOI89DshT4
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=naija-amebo-gist.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=naija-amebo-gist
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=naija-amebo-gist.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=749835043572
   NEXT_PUBLIC_FIREBASE_APP_ID=1:749835043572:web:d3b784f2d1a69f369714a1
   NODE_ENV=production
   ```
4. Click **"Save"**

### Step 4: Watch Deployment (1-2 minutes)
1. Stay on Railway dashboard
2. Watch build progress in the **"Build Logs"** tab
3. Wait for **"Deployment successful"** message
4. Your app URL appears (like `naija-amebo-gist-production.up.railway.app`)

### Step 5: Test Live App (30 seconds)
1. Click the generated Railway app URL
2. Your app is now **LIVE** online! 🎉
3. Test:
   - Register new account
   - Login
   - Send messages
   - Private messages

---

## 🎓 What Happens After You Click "Deploy"

```
Step 1: Railway clones your GitHub repo
         ↓
Step 2: Railway detects Next.js app
         ↓
Step 3: Installs dependencies (npm install)
         ↓
Step 4: Builds Next.js (npm run build)
         ↓
Step 5: Sets up environment variables
         ↓
Step 6: Starts the app (npm run start)
         ↓
Step 7: App goes LIVE ✅
         ↓
Step 8: You get a public URL
```

---

## 📊 Deployment Architecture

```
Your Computer                Railway.app               Firebase
─────────────────────────────────────────────────────────────────

Next.js Code ─────────┐
                      ├──> Railway Servers ────> Firebase (DB/Auth)
GitHub Repo ──────────┘
                      
                      ↓
              Automatic Deployment
              (every GitHub push)
```

---

## 🔐 Security & Firestore Rules

Before you deploy, **you MUST deploy your Firestore security rules**:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select **naija-amebo-gist**
3. Click **Firestore Database → Rules**
4. Replace with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /privateMessages/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

---

## 📁 What Gets Deployed

```
To Railway.app:
├── app/                    ✅ All your pages
├── lib/                    ✅ Firebase config
├── components/             ✅ React components
├── public/                 ✅ Images & assets
├── package.json           ✅ Dependencies
├── next.config.js         ✅ Config
├── tsconfig.json          ✅ TypeScript config
└── .env                   ✅ Environment variables

NOT deployed (stays on your computer):
├── node_modules/          (installed on Railway)
├── .next/                 (built on Railway)
├── .git/                  (not needed)
└── Local files

Firebase services (accessed from Railway):
├── Firestore Database     ☁️ Cloud
├── Firebase Storage       ☁️ Cloud
└── Firebase Auth          ☁️ Cloud
```

---

## 🌐 Your Live App URLs

After deployment, you'll get:

```
Production URL:  https://naija-amebo-gist-production.up.railway.app
                 (or Railway-generated URL)

Custom Domain:   Add custom domain in Railway settings
                 (Optional, paid feature)

API Endpoints:   All use Firebase, no separate API server
```

---

## ✨ What Works After Deployment

✅ **User Registration** - Creates accounts in Firebase Auth  
✅ **User Login** - Authenticates via Firebase  
✅ **Community Chat** - Messages save to Firestore  
✅ **Private Messages** - Persisted in Firestore  
✅ **File Uploads** - Saved to Firebase Storage  
✅ **Profile Pictures** - Uploaded to Firebase Storage  
✅ **Offline Support** - localStorage fallback works  

---

## 📊 Free Tier Limits on Railway

```
Monthly Credit:        $5 (more than enough)
Storage:              5 GB
Bandwidth:            100 GB/month
Database:             Integrated (Firebase)
Uptime:               99.9%
Custom Domain:        No (need to upgrade)
```

**For your app size: COMPLETELY FREE** ✅

---

## 🔄 Auto-Deploy on GitHub Push

After first deployment, Railway automatically redeploys when you:

```
1. Push to GitHub:
   git add .
   git commit -m "Update message"
   git push origin main

2. Railway detects the push

3. Automatically rebuilds and redeploys

4. Your live app updates within 2-3 minutes
```

**No manual deployment needed!** 🚀

---

## 🛠️ Troubleshooting

### Build Fails
**Check**: Railway build logs for errors
**Solution**: Ensure `npm run build` works locally first
```bash
npm run build
```

### Deployment Slow
**Normal**: First deployment takes 3-5 minutes
**Reason**: Installing dependencies, building Next.js
**After that**: Much faster (2-3 min)

### App Won't Start
**Check**: Environment variables in Railway dashboard
**Ensure**: All Firebase variables are set
**Verify**: `.env.example` has all required variables

### Firebase Data Not Showing
**Check 1**: Firestore security rules published?
**Check 2**: User authenticated in the app?
**Check 3**: Browser console for errors (F12)

### Custom Domain Issues
**Contact**: Railway support (email)
**Or**: Use Railway-provided URL (free option)

---

## 📈 Monitoring Your Live App

After deployment, monitor with Railway dashboard:

```
Dashboard Metrics:
├── Deployments    → See all deployments
├── Logs           → Real-time app logs
├── CPU/Memory     → Performance metrics
├── Costs          → Actual usage costs
└── Domain         → Custom domain settings
```

---

## 💡 Next Steps After Deployment

### Immediate (after going live)
- [ ] Test all features
- [ ] Share URL with friends/users
- [ ] Collect feedback
- [ ] Monitor logs for errors

### Soon (this week)
- [ ] Add custom domain (if needed)
- [ ] Set up GitHub Actions for CI/CD
- [ ] Enable email verification in Firebase
- [ ] Add password reset feature

### Later (when scaling)
- [ ] Enable Firebase backup
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Performance optimization

---

## 🎉 You're All Set!

**Your app is ready to deploy!**

Everything is configured and prepared. You just need to:

1. ✅ Create Railway account
2. ✅ Connect GitHub repo
3. ✅ Set environment variables
4. ✅ Done! App is live

**Estimated time: 3 minutes total**

---

## 📞 Support Resources

**Railway Docs**: https://docs.railway.app
**Firebase Docs**: https://firebase.google.com/docs
**Next.js Docs**: https://nextjs.org/docs
**Railway Support**: support@railway.app

---

## 🏆 Final Checklist

- [x] Firebase configured
- [x] Code deployed ready
- [x] Environment variables prepared
- [x] railway.json created
- [x] Production build tested
- [x] Security rules created
- [x] Deployment guide prepared

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**

---

**Deployment Date**: January 4, 2026
**Project**: NAIJA AMEBO GIST
**Status**: ✨ Production Ready
**Cost**: FREE ($5/month Railway credit)
**Time to Deploy**: 3 minutes

🚀 **You're ready to launch!**
