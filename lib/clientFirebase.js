// src/lib/clientFirebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth, // <--- Use initializeAuth instead of getAuth
  indexedDBLocalPersistence, // <--- Import for persistence
  browserPopupRedirectResolver, // <--- Import for popups/redirects
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Initialize Firebase (client-side only)
let firebaseAppInstance; // Renamed to avoid confusion with the exported `app`
let authInstance; // Renamed for clarity
let dbInstance;
let storageInstance;
let functionsInstance;
let googleProviderInstance;
let isInitialized = false;

// Initialize Firebase function
function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  const firebaseConfigEnv = process.env.NEXT_PUBLIC_FIREBASE_CONFIG; // Renamed to avoid shadowing
  
  if (!firebaseConfigEnv) {
    console.error('NEXT_PUBLIC_FIREBASE_CONFIG is not set. Please add your Firebase config to .env.local');
    return;
  }

  try {
    const config = JSON.parse(firebaseConfigEnv);
    
    // Initialize Firebase with performance optimizations
    if (getApps().length === 0) {
      firebaseAppInstance = initializeApp(config);
    } else {
      firebaseAppInstance = getApp(); // Use getApp() to retrieve the default app
    }
    
    // Initialize services
    // Use initializeAuth for explicit persistence configuration
    authInstance = initializeAuth(firebaseAppInstance, {
      persistence: [indexedDBLocalPersistence], // Explicitly enable IndexedDB persistence
      popupRedirectResolver: browserPopupRedirectResolver, // For handling popup/redirect flows
    });

    dbInstance = getFirestore(firebaseAppInstance);
    storageInstance = getStorage(firebaseAppInstance);
    functionsInstance = getFunctions(firebaseAppInstance);
    googleProviderInstance = new GoogleAuthProvider();
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Initialize on client side immediately
if (typeof window !== 'undefined') {
  initializeFirebase();
  
  // Simplified retry logic, assuming the primary issue was `getAuth` vs `initializeAuth`
  // You can keep your more complex retry if env var loading is genuinely flaky
  if (!authInstance && !isInitialized) { // Check both for robustness
    setTimeout(() => initializeFirebase(), 100);
  }
}

// Export a safe auth getter that ensures initialization
export function getAuthInstance() {
  if (typeof window !== 'undefined') {
    if (!authInstance && !isInitialized) {
      initializeFirebase();
    }
    return authInstance;
  }
  return null;
}

// Export the initialized instances
export {
  firebaseAppInstance as app,
  authInstance as auth,
  dbInstance as db,
  storageInstance as storage,
  functionsInstance as functions,
  googleProviderInstance as GoogleAuthProvider,
  initializeFirebase
};
