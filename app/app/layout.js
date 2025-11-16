'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initializeFirebase, getAuthInstance } from '@/lib/clientFirebase';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AppLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Ensure Firebase is initialized and listen to auth state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let retryCount = 0;
    const maxRetries = 10;
    let unsubscribe = null;
    
    const initAuth = () => {
      if (!auth) {
        initializeFirebase();
      }
      const instance = getAuthInstance();
      if (instance) {
        // Set up auth state listener
        unsubscribe = onAuthStateChanged(instance, (user) => {
          setUser(user);
          setLoading(false);
        });
        return unsubscribe;
      } else {
        // Retry if not ready (with timeout to prevent infinite loading)
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initAuth, 200);
        } else {
          // After max retries, stop loading anyway
          console.error('Firebase initialization failed after retries');
          setLoading(false);
        }
      }
    };
    
    const cleanup = initAuth();
    
    // Timeout fallback - stop loading after 5 seconds max
    const timeout = setTimeout(() => {
      console.warn('Auth initialization timeout - proceeding anyway');
      setLoading(false);
    }, 5000);
    
    return () => {
      if (cleanup && typeof cleanup === 'function') cleanup();
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // If not loading and no user, show redirect message (will redirect via useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <div className="text-white">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-56">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

