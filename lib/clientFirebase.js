import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Initialize Firebase (client-side only)
let app;
let auth;
let db;
let storage;
let functions;
let googleProvider;

// Only initialize on client side
if (typeof window !== 'undefined') {
  const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  
  if (!firebaseConfig) {
    console.error('NEXT_PUBLIC_FIREBASE_CONFIG is not set. Please add your Firebase config to .env.local');
  } else {
    try {
      const config = JSON.parse(firebaseConfig);
      
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApps()[0];
      }
      
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      functions = getFunctions(app);
      googleProvider = new GoogleAuthProvider();
    } catch (error) {
      console.error('Error parsing Firebase config:', error);
    }
  }
} else {
  // Server-side: export undefined values
  // Components should check for these before using
  auth = undefined;
  db = undefined;
  storage = undefined;
  functions = undefined;
  app = undefined;
  googleProvider = undefined;
}

export { app, auth, db, storage, functions, googleProvider as GoogleAuthProvider };

