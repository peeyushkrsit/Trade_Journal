# TradeJournal - Complete Requirements Checklist

This checklist covers everything needed to get TradeJournal fully operational.

## ✅ Already Completed

- [x] Project structure created
- [x] All code files implemented
- [x] Firebase project ID configured (`tradejournal-e79d9`)
- [x] `.firebaserc` configured
- [x] Security rules files created
- [x] Documentation created

## 📦 Required: Dependencies Installation

### Frontend Dependencies
```bash
npm install
```

This installs:
- Next.js, React, React DOM
- Firebase SDK
- Tailwind CSS
- Tesseract.js (OCR)
- jsPDF, html2canvas (PDF export)
- react-hot-toast (notifications)
- lucide-react (icons)
- react-firebase-hooks

### Cloud Functions Dependencies
```bash
cd functions
npm install
cd ..
```

This installs:
- firebase-admin
- firebase-functions

**Status**: ⚠️ **TODO** - Run these commands

---

## 🔧 Required: Firebase Services Setup

### 1. Authentication
**Location**: https://console.firebase.google.com/project/tradejournal-e79d9/authentication

- [ ] Enable **Email/Password** sign-in method
- [ ] Enable **Google** sign-in method
- [ ] Configure OAuth consent screen (for Google sign-in)
  - Go to Google Cloud Console
  - APIs & Services > OAuth consent screen
  - Add authorized domains

**Status**: ⚠️ **TODO** - Enable in Firebase Console

### 2. Firestore Database
**Location**: https://console.firebase.google.com/project/tradejournal-e79d9/firestore

- [ ] Create Firestore database
- [ ] Choose location (e.g., us-central1)
- [ ] Start in **production mode**
- [ ] Deploy security rules:
  ```bash
  firebase deploy --only firestore:rules
  ```

**Status**: ⚠️ **TODO** - Create database and deploy rules

### 3. Cloud Storage
**Location**: https://console.firebase.google.com/project/tradejournal-e79d9/storage

- [ ] Get started with Cloud Storage
- [ ] Choose location (match Firestore location)
- [ ] Start in **production mode**
- [ ] Deploy security rules:
  ```bash
  firebase deploy --only storage:rules
  ```

**Status**: ⚠️ **TODO** - Enable storage and deploy rules

### 4. Cloud Functions
**Location**: https://console.firebase.google.com/project/tradejournal-e79d9/functions

- [ ] Upgrade to **Blaze plan** (pay-as-you-go) - Required for Cloud Functions
- [ ] Enable Cloud Functions API
- [ ] Set environment variables (see below)
- [ ] Deploy functions:
  ```bash
  firebase deploy --only functions
  ```

**Status**: ⚠️ **TODO** - Upgrade plan and deploy functions

---

## 🔑 Required: Environment Variables

### Frontend (.env.local)
**File**: `.env.local` (in root directory)

```env
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyD_F2SahLGWc58aDqgwSJLki_BL2BkXAPw","authDomain":"tradejournal-e79d9.firebaseapp.com","projectId":"tradejournal-e79d9","storageBucket":"tradejournal-e79d9.firebasestorage.app","messagingSenderId":"1026774829946","appId":"1:1026774829946:web:a7828168253a85a5caa4c3","measurementId":"G-D05LWTVFM6"}
```

**Status**: ⚠️ **TODO** - Create this file (run `./setup-env.sh` or create manually)

### Cloud Functions Environment Variables

**Option 1: Using Firebase CLI (Legacy)**
```bash
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="sk-your-openai-api-key"
```

**Option 2: Using Firebase Console (Recommended)**
1. Go to: https://console.firebase.google.com/project/tradejournal-e79d9/functions/config
2. Add environment variables:
   - `LLM_PROVIDER` = `openai` (or `gemini`)
   - `OPENAI_API_KEY` = `sk-your-key-here` (if using OpenAI)

**Status**: ⚠️ **TODO** - Set these for AI analysis to work

---

## 🔐 Required: API Keys & Credentials

### OpenAI API Key (for AI Analysis)
**Required if**: Using OpenAI for trade analysis

- [ ] Get API key from: https://platform.openai.com/api-keys
- [ ] Add to Cloud Functions environment variables
- [ ] Set `LLM_PROVIDER=openai`

**Cost**: ~$0.01-0.05 per analysis (GPT-3.5-turbo)

**Status**: ⚠️ **TODO** - Get key and configure

### Google Gemini / Vertex AI (Alternative)
**Required if**: Using Gemini instead of OpenAI

- [ ] Set up Google Cloud Project
- [ ] Enable Vertex AI API
- [ ] Create service account
- [ ] Download service account key
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Update `functions/index.js` with Vertex AI code (see comments in file)

**Status**: ⚠️ **Optional** - Only if using Gemini

---

## 🛠️ Required: Development Tools

### Node.js
- [ ] Install Node.js 18+ 
  - Check: `node --version`
  - Download: https://nodejs.org/

**Status**: ⚠️ **TODO** - Verify installation

### Firebase CLI
- [ ] Install Firebase CLI:
  ```bash
  npm install -g firebase-tools
  ```
- [ ] Login to Firebase:
  ```bash
  firebase login
  ```

**Status**: ⚠️ **TODO** - Install and login

### Git (Optional but Recommended)
- [ ] Initialize git repository:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

**Status**: ⚠️ **Optional** - For version control

---

## 🧪 Required: Testing Setup

### Run Tests
```bash
npm test
```

**Status**: ⚠️ **TODO** - Run tests to verify everything works

---

## 🚀 Required: Deployment Setup

### Vercel (Frontend)
- [ ] Create Vercel account: https://vercel.com
- [ ] Connect GitHub repository (if using Git)
- [ ] Add environment variable: `NEXT_PUBLIC_FIREBASE_CONFIG`
- [ ] Deploy

**Status**: ⚠️ **TODO** - Deploy frontend

### Firebase (Backend)
- [ ] Deploy Firestore rules
- [ ] Deploy Storage rules
- [ ] Deploy Cloud Functions
- [ ] Configure authorized domains in Firebase Auth

**Status**: ⚠️ **TODO** - Deploy backend

---

## 📋 Quick Setup Commands

Run these in order:

```bash
# 1. Install dependencies
npm install
cd functions && npm install && cd ..

# 2. Create .env.local
./setup-env.sh
# OR manually create .env.local with Firebase config

# 3. Login to Firebase
firebase login

# 4. Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# 5. Set Cloud Functions environment variables
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="your-key-here"

# 6. Deploy Cloud Functions
firebase deploy --only functions

# 7. Start development server
npm run dev
```

---

## ⚠️ Important Notes

### Firebase Blaze Plan
- **Required** for Cloud Functions
- Free tier includes: 2M function invocations/month
- You only pay for what you use beyond free tier
- Can set billing alerts

### Costs Estimate
- **Firebase**: Free tier covers most usage
- **OpenAI**: ~$0.01-0.05 per analysis
- **Vercel**: Free for personal projects
- **Total**: ~$0-10/month for moderate usage

### Security
- Never commit `.env.local` to git (already in .gitignore)
- Never commit API keys
- Use environment variables for all secrets
- Review Firestore and Storage rules before deploying

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Can sign up with email
- [ ] Can sign in with Google
- [ ] Can create a trade
- [ ] OCR works (upload screenshot)
- [ ] Trade saves to Firestore
- [ ] AI analysis works (if functions deployed)
- [ ] CSV export works
- [ ] PDF export works
- [ ] Settings page loads
- [ ] Can delete account

---

## 🆘 Troubleshooting

### "Firebase config not found"
- Check `.env.local` exists
- Restart dev server after creating `.env.local`

### "Functions deployment fails"
- Verify Blaze plan is active
- Check Node.js version (18+)
- Verify Firebase CLI is logged in

### "Authentication not working"
- Enable Email/Password and Google in Firebase Console
- Check authorized domains include localhost
- Verify OAuth consent screen is configured

### "AI analysis fails"
- Check environment variables are set
- Verify API key is correct
- Check function logs: `firebase functions:log`

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated**: 2024
**Project Status**: Ready for setup and deployment

