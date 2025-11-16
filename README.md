# TradeJournal - AI Trade Journal & Emotional Coach

A production-ready Next.js web application for tracking trades, analyzing performance, and improving trading discipline with AI-powered insights.

## Features

- 📊 **Trade Tracking**: Log trades with screenshots, notes, and detailed metrics
- 🤖 **AI Analysis**: Get instant AI-powered analysis of your trades (50 free analyses/month)
- 📸 **OCR Integration**: Automatically extract trade data from broker screenshots using Tesseract.js
- 📈 **Performance Reports**: View statistics, win rates, and export data to CSV/PDF
- 🎯 **Emotional Coaching**: Identify emotional patterns and get personalized suggestions
- 🔒 **Secure & Private**: Firebase authentication and secure data storage

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **OCR**: Tesseract.js (client-side)
- **LLM**: OpenAI GPT-3.5 or Google Gemini (via Cloud Functions)
- **Deployment**: Vercel (frontend) + Firebase (backend)

## Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- OpenAI API key (or Google Cloud credentials for Gemini)
- Vercel account (for frontend deployment)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Setup

**✅ Your Firebase project is already configured!** (Project ID: `tradejournal-e79d9`)

The `.env.local` file has been created with your Firebase configuration.

1. Enable the following services in [Firebase Console](https://console.firebase.google.com/project/tradejournal-e79d9):
   - **Authentication**: Enable Email/Password and Google sign-in
   - **Firestore Database**: Create database (start in production mode)
   - **Storage**: Get started (start in production mode)
   - **Cloud Functions**: Enable (requires Blaze plan for deployment)

2. The `.firebaserc` file is already configured with your project ID.

### 3. Deploy Firestore Rules and Storage Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 4. Deploy Cloud Functions

1. Set environment variables for Cloud Functions:

```bash
# For OpenAI
firebase functions:config:set llm.provider="openai"
firebase functions:config:set openai.api_key="your-openai-api-key"

# OR for Gemini (after setting up Vertex AI)
firebase functions:config:set llm.provider="gemini"
```

2. Deploy functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**Note**: For Gemini/Vertex AI integration, see the detailed instructions in `functions/index.js` comments.

### 5. Run Locally

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Firebase emulators (optional)
firebase emulators:start
```

Visit `http://localhost:3000` to see the app.

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable:
   - `NEXT_PUBLIC_FIREBASE_CONFIG`: Your Firebase config JSON string
4. Deploy

### Backend (Firebase)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

## Project Structure

```
Trade_Journal/
├── app/                    # Next.js app directory
│   ├── app/               # Protected app pages
│   │   ├── dashboard/     # Dashboard page
│   │   ├── journal/       # Trade journal list
│   │   ├── new-trade/     # Add new trade
│   │   ├── trade/[id]/    # Trade detail page
│   │   ├── coach/         # AI coach chat
│   │   ├── reports/       # Performance reports
│   │   └── settings/      # User settings
│   ├── auth/              # Auth pages (login/signup)
│   └── privacy-policy/    # Privacy policy page
├── components/            # React components
├── lib/                   # Utilities and Firebase config
├── functions/             # Cloud Functions
│   └── index.js          # analyzeTrade function
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── __tests__/            # Unit tests
```

## Firestore Schema

### Users Collection
```
users/{uid}
  - displayName: string
  - email: string
  - createdAt: timestamp
  - plan: "free"
  - analysisCount: number
  - analysisMonth: "YYYY-MM"
```

### Trades Subcollection
```
users/{uid}/trades/{tradeId}
  - symbol: string
  - instrument: string
  - side: "long" | "short"
  - entryPrice: number
  - exitPrice: number
  - stopLoss: number
  - qty: number
  - premium: number
  - pnl: number
  - pnlPercent: number
  - dateOpen: timestamp
  - dateClose: timestamp
  - notes: string
  - screenshotPath: string
  - ocrText: string
  - aiAnalysis: {
      qualityScore: number (0-100)
      mistakes: string[]
      emotionTags: [{tag: string, confidence: number}]
      suggestions: string[]
      explainers: string
      confidence: number (0-1)
    }
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_FIREBASE_CONFIG`: Firebase web config JSON string

### Cloud Functions
- `LLM_PROVIDER`: "openai" or "gemini"
- `OPENAI_API_KEY`: Your OpenAI API key (if using OpenAI)

## Testing

Run unit tests:

```bash
npm test
```

## Quota Management

Free tier users get 50 AI analyses per calendar month. The quota is automatically reset at the start of each month. Quota is enforced in the Cloud Function using Firestore transactions.

## Security

- All Firestore rules enforce user authentication and ownership
- Storage rules restrict access to user's own files
- API keys are stored as environment variables (never in code)
- User data is isolated per user ID

## Privacy

- Users can delete their account and all associated data from Settings
- Privacy Policy is available at `/privacy-policy`
- No data is shared with third parties

## Troubleshooting

### OCR not working
- Ensure Tesseract.js worker is loading correctly
- Check browser console for errors
- Try with a clearer, higher-resolution image

### Cloud Functions deployment fails
- Ensure Node.js 18+ is installed
- Check Firebase CLI is up to date: `npm install -g firebase-tools`
- Verify environment variables are set correctly

### Authentication issues
- Verify Firebase config in `.env.local`
- Check Firebase Console > Authentication is enabled
- Ensure Email/Password and Google sign-in methods are enabled

## License

MIT License - see LICENSE file

## Disclaimer

⚠️ **Not Financial Advice**: TradeJournal provides educational content and analysis tools only. This is NOT financial advice. Trading involves substantial risk of loss. Always do your own research and consult with a licensed financial advisor.

## Support

For issues and questions, please check the documentation or create an issue in the repository.

