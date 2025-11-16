# Quick Start Guide

Get TradeJournal up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Firebase account
- OpenAI API key (optional, for AI analysis)

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

## Step 2: Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable:
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Storage
   - Cloud Functions (requires Blaze plan)

3. Get your Firebase config:
   - Project Settings > Your apps > Web app > Config
   - Copy the config object

4. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

5. Add Firebase config to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
```

6. Update `.firebaserc` with your project ID

## Step 3: Deploy Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Step 4: Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: (Optional) Deploy Functions

If you want AI analysis:

```bash
# Set environment variables
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="sk-your-key"

# Deploy
firebase deploy --only functions
```

## Next Steps

- Sign up for an account
- Add your first trade
- Try OCR with a screenshot
- Run AI analysis (if functions deployed)

For full deployment instructions, see [DEPLOY.md](./DEPLOY.md)

