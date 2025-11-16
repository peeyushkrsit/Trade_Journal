import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Initialize Firebase (client-side only)
let app;
let auth = null;
let db = null;
let storage = null;
let functions = null;
let googleProvider = null;
let isInitialized = false;

// Initialize Firebase function
function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  
  if (!firebaseConfig) {
    console.error('NEXT_PUBLIC_FIREBASE_CONFIG is not set. Please add your Firebase config to .env.local');
    return;
  }

  try {
    const config = JSON.parse(firebaseConfig);
    
    // Initialize Firebase with performance optimizations
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    googleProvider = new GoogleAuthProvider();
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Initialize on client side immediately
if (typeof window !== 'undefined') {
  // Initialize immediately
  initializeFirebase();
  
  // Also try on next tick in case env vars aren't ready (for Vercel/production)
  if (!auth) {
    // Try multiple times with increasing delays for production environments
    let retries = 0;
    const maxRetries = 5;
    const retryInit = () => {
      if (!auth && retries < maxRetries) {
        retries++;
        setTimeout(() => {
          initializeFirebase();
          if (!auth) {
            retryInit();
          }
        }, 200 * retries);
      }
    };
    setTimeout(retryInit, 100);
  }
}

// Export a safe auth getter that ensures initialization
export function getAuthInstance() {
  if (typeof window !== 'undefined') {
    if (!auth) {
      initializeFirebase();
    }
    // Return auth even if null (for error handling)
    return auth;
  }
  return null;
}

export { app, auth, db, storage, functions, googleProvider as GoogleAuthProvider, initializeFirebase };

