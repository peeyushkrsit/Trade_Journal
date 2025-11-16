# Deploy TradeJournal to Vercel

This guide will help you deploy your TradeJournal app to Vercel.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account (free tier works)
- Firebase project already set up

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository (if not already done)

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TradeJournal app"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `trade-journal`)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

### 1.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up or log in (you can use GitHub to sign in)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository you just created

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add the following:
     - **Name**: `NEXT_PUBLIC_FIREBASE_CONFIG`
     - **Value**: Your Firebase config JSON string:
       ```json
       {"apiKey":"AIzaSyD_F2SahLGWc58aDqgwSJLki_BL2BkXAPw","authDomain":"tradejournal-e79d9.firebaseapp.com","projectId":"tradejournal-e79d9","storageBucket":"tradejournal-e79d9.firebasestorage.app","messagingSenderId":"1026774829946","appId":"1:1026774829946:web:a7828168253a85a5caa4c3","measurementId":"G-D05LWTVFM6"}
       ```
   - Select environments: **Production**, **Preview**, **Development**
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `NEXT_PUBLIC_FIREBASE_CONFIG` = (your Firebase config JSON string)

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Firebase Authorized Domains

After deployment, you need to add your Vercel domain to Firebase:

1. **Get Your Vercel URL**
   - Your app URL will be: `https://your-project.vercel.app`
   - Or your custom domain if you set one up

2. **Add to Firebase**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/authentication/settings
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add: `your-project.vercel.app`
   - Click "Add"

## Step 4: Verify Deployment

1. **Visit Your App**
   - Go to your Vercel deployment URL
   - Test the landing page

2. **Test Authentication**
   - Try signing up with email
   - Try signing in with Google
   - Verify redirects work

3. **Test Features**
   - Create a trade
   - Test OCR functionality
   - Verify data saves to Firestore

## Step 5: Set Up Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Firebase Authorized Domains**
   - Add your custom domain to Firebase authorized domains

## Environment Variables Summary

### Required for Vercel:
- `NEXT_PUBLIC_FIREBASE_CONFIG` - Your Firebase web config (JSON string)

### Not Needed in Vercel (Cloud Functions only):
- `LLM_PROVIDER` - Only needed in Firebase Functions
- `OPENAI_API_KEY` - Only needed in Firebase Functions

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `NEXT_PUBLIC_FIREBASE_CONFIG` is set correctly

### Authentication Not Working
- Verify Firebase authorized domains include your Vercel domain
- Check browser console for errors
- Ensure Firebase services are enabled

### Environment Variables Not Working
- Make sure variable name is exactly `NEXT_PUBLIC_FIREBASE_CONFIG`
- Redeploy after adding environment variables
- Check that variable is set for all environments (Production, Preview, Development)

## Post-Deployment Checklist

- [ ] App is accessible at Vercel URL
- [ ] Landing page loads correctly
- [ ] Sign up with email works
- [ ] Sign in with Google works
- [ ] Can create trades
- [ ] Data saves to Firestore
- [ ] Firebase authorized domains configured
- [ ] Custom domain set up (if applicable)

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

## Support

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Check deployment logs in Vercel dashboard for errors

---

**Your Vercel URL**: Will be shown after deployment
**Firebase Project**: tradejournal-e79d9
**Status**: Ready to deploy! 🚀

