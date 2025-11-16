#!/bin/bash

# Setup script for TradeJournal Firebase configuration

echo "Setting up Firebase configuration..."

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyD_F2SahLGWc58aDqgwSJLki_BL2BkXAPw","authDomain":"tradejournal-e79d9.firebaseapp.com","projectId":"tradejournal-e79d9","storageBucket":"tradejournal-e79d9.firebasestorage.app","messagingSenderId":"1026774829946","appId":"1:1026774829946:web:a7828168253a85a5caa4c3","measurementId":"G-D05LWTVFM6"}
EOF

echo "✅ Created .env.local file"
echo ""
echo "Next steps:"
echo "1. Enable Firebase services in the console:"
echo "   - Authentication (Email/Password + Google)"
echo "   - Firestore Database"
echo "   - Storage"
echo "   - Cloud Functions (requires Blaze plan)"
echo ""
echo "2. Deploy security rules:"
echo "   firebase deploy --only firestore:rules,storage:rules"
echo ""
echo "3. Start the dev server:"
echo "   npm run dev"
echo ""
echo "See SETUP_FIREBASE.md for detailed instructions."

