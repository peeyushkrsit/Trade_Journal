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
    
    const initAuth = () => {
      if (!auth) {
        initializeFirebase();
      }
      const instance = getAuthInstance();
      if (instance) {
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(instance, (user) => {
          setUser(user);
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        // Retry if not ready
        setTimeout(initAuth, 100);
      }
    };
    
    const cleanup = initAuth();
    return cleanup;
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

  if (!user) {
    return null;
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

