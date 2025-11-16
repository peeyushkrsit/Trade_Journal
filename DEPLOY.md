# Deployment Guide

This guide provides step-by-step instructions for deploying TradeJournal to production.

## Prerequisites

- Firebase account and project created
- Vercel account (or alternative hosting)
- OpenAI API key (or Google Cloud credentials for Gemini)
- Node.js 18+ installed locally

## Step 1: Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "trade-journal")
   - Follow the setup wizard

2. **Enable Services**
   - **Authentication**: Enable Email/Password and Google sign-in
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Cloud Storage
   - **Cloud Functions**: Enable (may require Blaze plan)

3. **Get Web Config**
   - Go to Project Settings > Your apps
   - Click "Web" icon (`</>`)
   - Register app with nickname
   - Copy the `firebaseConfig` object

## Step 2: Deploy Firestore Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore: Configure security rules
# - Storage: Configure security rules
# - Functions: Configure a Cloud Functions directory

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

## Step 3: Deploy Cloud Functions

1. **Set Environment Variables**

```bash
# For OpenAI
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="sk-your-openai-key-here"

# OR for Gemini (after Vertex AI setup)
firebase functions:config:set llm.provider="gemini"
```

2. **Deploy Functions**

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**Note**: Cloud Functions require the Blaze (pay-as-you-go) plan. The free tier has limitations.

## Step 4: Deploy Frontend to Vercel

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variable**
   - In Vercel project settings, go to "Environment Variables"
   - Add: `NEXT_PUBLIC_FIREBASE_CONFIG`
   - Value: Your Firebase config as a JSON string (e.g., `{"apiKey":"...","authDomain":"..."}`)
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## Step 5: Configure Firebase Authentication

1. **Authorized Domains**
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-project.vercel.app`)

2. **OAuth Consent Screen (for Google Sign-in)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Go to APIs & Services > OAuth consent screen
   - Configure consent screen
   - Add authorized domains

## Step 6: Verify Deployment

1. **Test Authentication**
   - Visit your deployed app
   - Try signing up with email
   - Try signing in with Google

2. **Test Trade Creation**
   - Create a test trade
   - Upload a screenshot
   - Verify OCR works

3. **Test AI Analysis**
   - Run AI analysis on a trade
   - Verify quota is enforced (50/month)

## Troubleshooting

### Functions Deployment Fails

- **Error**: "Billing account not found"
  - Solution: Upgrade to Blaze plan in Firebase Console

- **Error**: "Permission denied"
  - Solution: Run `firebase login` again

### Frontend Build Fails

- **Error**: "NEXT_PUBLIC_FIREBASE_CONFIG is not defined"
  - Solution: Ensure environment variable is set in Vercel

- **Error**: Build timeout
  - Solution: Increase build timeout in Vercel settings

### Authentication Not Working

- **Error**: "Domain not authorized"
  - Solution: Add domain to Firebase authorized domains

- **Error**: Google sign-in fails
  - Solution: Configure OAuth consent screen in Google Cloud Console

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_FIREBASE_CONFIG`: Firebase web config JSON string

### Cloud Functions (Firebase)
- `LLM_PROVIDER`: "openai" or "gemini"
- `OPENAI_API_KEY`: Your OpenAI API key (if using OpenAI)

## Post-Deployment Checklist

- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Cloud Functions deployed
- [ ] Environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Firebase authorized domains configured
- [ ] OAuth consent screen configured (for Google)
- [ ] Test authentication (email + Google)
- [ ] Test trade creation
- [ ] Test OCR functionality
- [ ] Test AI analysis
- [ ] Verify quota enforcement

## Monitoring

1. **Firebase Console**
   - Monitor function invocations
   - Check Firestore usage
   - View authentication logs

2. **Vercel Analytics**
   - Monitor page views
   - Check build logs
   - View error logs

3. **Set Up Alerts**
   - Firebase: Set up billing alerts
   - Vercel: Configure deployment notifications

## Cost Estimation

### Firebase (Blaze Plan)
- **Free Tier**: 50K reads/day, 20K writes/day, 1GB storage
- **Functions**: 2M invocations/month free, then $0.40 per million
- **Storage**: 5GB free, then $0.026/GB/month

### Vercel
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for team features

### OpenAI
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Estimated**: $0.01-0.05 per analysis

## Security Checklist

- [ ] API keys stored as environment variables (never in code)
- [ ] Firestore rules enforce user authentication
- [ ] Storage rules restrict access to user's own files
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured correctly
- [ ] Rate limiting considered (Firebase handles this)

## Support

For deployment issues:
1. Check Firebase Console logs
2. Check Vercel build logs
3. Review error messages in browser console
4. Consult Firebase and Vercel documentation

