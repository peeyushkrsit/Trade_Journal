# Deploy TradeJournal to Vercel - Step by Step

## ✅ Build Status: Ready to Deploy!

Your project builds successfully. Follow these steps to deploy to Vercel.

## Step 1: Push Code to GitHub

If you haven't already:

```bash
# Check git status
git status

# Add all files
git add .

# Commit changes
git commit -m "Ready for Vercel deployment"

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub (recommended)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Find and select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variable** ⚠️ CRITICAL
   - Click "Environment Variables"
   - Add new variable:
     - **Name**: `NEXT_PUBLIC_FIREBASE_CONFIG`
     - **Value**: 
       ```json
       {"apiKey":"AIzaSyD_F2SahLGWc58aDqgwSJLki_BL2BkXAPw","authDomain":"tradejournal-e79d9.firebaseapp.com","projectId":"tradejournal-e79d9","storageBucket":"tradejournal-e79d9.firebasestorage.app","messagingSenderId":"1026774829946","appId":"1:1026774829946:web:a7828168253a85a5caa4c3","measurementId":"G-D05LWTVFM6"}
       ```
   - **Environments**: Select all (Production, Preview, Development)
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live! 🎉

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? trade-journal (or any name)
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_FIREBASE_CONFIG

# Paste your Firebase config JSON string when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

## Step 3: Configure Firebase Authorized Domains

After deployment, add your Vercel domain to Firebase:

1. **Get Your Vercel URL**
   - After deployment, Vercel will show your URL
   - Example: `https://trade-journal.vercel.app`

2. **Add to Firebase**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/authentication/settings
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add your Vercel domain (e.g., `trade-journal.vercel.app`)
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

## Common Deployment Issues & Solutions

### Issue: Build Fails

**Error**: "Module not found" or "Cannot find module"
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: "Environment variable not found"
- **Solution**: Make sure `NEXT_PUBLIC_FIREBASE_CONFIG` is set in Vercel
- Check that variable name is exactly correct
- Redeploy after adding environment variable

### Issue: Authentication Not Working

**Error**: "Domain not authorized"
- **Solution**: Add Vercel domain to Firebase authorized domains
- Go to Firebase Console > Authentication > Settings > Authorized domains

**Error**: "Firebase config not found"
- **Solution**: Verify environment variable is set correctly
- Check Vercel dashboard > Settings > Environment Variables
- Redeploy after fixing

### Issue: Functions Not Working

**Error**: "Cloud Functions not deployed"
- **Solution**: Deploy Firebase Functions separately:
  ```bash
  firebase deploy --only functions
  ```

## Environment Variables Summary

### Required in Vercel:
- `NEXT_PUBLIC_FIREBASE_CONFIG` - Your Firebase web config (JSON string)

### Not Needed in Vercel (Cloud Functions only):
- `LLM_PROVIDER` - Only needed in Firebase Functions
- `OPENAI_API_KEY` - Only needed in Firebase Functions

## Post-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variable `NEXT_PUBLIC_FIREBASE_CONFIG` added
- [ ] Deployment successful
- [ ] Firebase authorized domain added
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Can create trades
- [ ] Data saves to Firestore

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment

## Your Deployment URLs

After deployment, you'll get:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Build Logs**: Check in Vercel dashboard > Deployments > [Your Deployment] > Build Logs
- **Function Logs**: Check in Firebase Console > Functions > Logs

---

**Status**: ✅ Build successful, ready to deploy!
**Next Step**: Push to GitHub and import to Vercel

