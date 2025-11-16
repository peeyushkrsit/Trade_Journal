# Firebase Configuration Setup

Your Firebase project is already configured! Here's how to complete the setup:

## Step 1: Create .env.local File

Create a file named `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyD_F2SahLGWc58aDqgwSJLki_BL2BkXAPw","authDomain":"tradejournal-e79d9.firebaseapp.com","projectId":"tradejournal-e79d9","storageBucket":"tradejournal-e79d9.firebasestorage.app","messagingSenderId":"1026774829946","appId":"1:1026774829946:web:a7828168253a85a5caa4c3","measurementId":"G-D05LWTVFM6"}
```

**Important**: The entire config must be on a single line as a JSON string.

## Step 2: Enable Firebase Services

Make sure these services are enabled in your Firebase Console:

1. **Authentication**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/authentication
   - Enable "Email/Password" sign-in method
   - Enable "Google" sign-in method

2. **Firestore Database**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/firestore
   - Create database (start in production mode)
   - Deploy rules: `firebase deploy --only firestore:rules`

3. **Storage**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/storage
   - Get started (start in production mode)
   - Deploy rules: `firebase deploy --only storage:rules`

4. **Cloud Functions**
   - Go to: https://console.firebase.google.com/project/tradejournal-e79d9/functions
   - Note: Requires Blaze (pay-as-you-go) plan
   - Deploy: `firebase deploy --only functions`

## Step 3: Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Step 4: Configure Cloud Functions (Optional - for AI Analysis)

If you want AI analysis to work:

```bash
# For OpenAI
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="your-openai-api-key-here"

# Then deploy
firebase deploy --only functions
```

Or set environment variables in Firebase Console:
- Go to Functions > Configuration > Environment variables
- Add: `LLM_PROVIDER` = `openai`
- Add: `OPENAI_API_KEY` = `your-key`

## Step 5: Test the Setup

```bash
# Start the development server
npm run dev
```

Visit http://localhost:3000 and try:
1. Sign up with email
2. Sign in with Google
3. Create a trade
4. Test OCR functionality

## Troubleshooting

### "Firebase config not found"
- Make sure `.env.local` exists in the root directory
- Check that the config is on a single line
- Restart the dev server after creating `.env.local`

### Authentication not working
- Verify Email/Password and Google are enabled in Firebase Console
- Check browser console for errors
- Make sure authorized domains include `localhost`

### Functions deployment fails
- Upgrade to Blaze plan in Firebase Console
- Check that Node.js 18+ is installed
- Verify Firebase CLI is up to date: `npm install -g firebase-tools`

## Your Firebase Project Details

- **Project ID**: tradejournal-e79d9
- **Project URL**: https://console.firebase.google.com/project/tradejournal-e79d9

