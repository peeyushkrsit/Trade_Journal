'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initializeFirebase, getAuthInstance } from '@/lib/clientFirebase';
import Link from 'next/link';

export default function LandingPage() {
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
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initAuth, 200);
        } else {
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
    if (user) {
      router.push('/app/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            TradeJournal
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            AI Trade Journal & Emotional Coach
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Track your trades, analyze performance, and improve with AI-powered insights.
            Learn from your mistakes and develop better trading discipline.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-card text-white rounded-lg font-semibold hover:bg-card-hover transition-colors border border-gray-700"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card p-6 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
              <p className="text-gray-400">
                Log trades with screenshots, notes, and detailed metrics. OCR automatically extracts data from your broker screenshots.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-400">
                Get instant AI-powered analysis of your trades. Identify emotional patterns, mistakes, and improvement opportunities.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Learn & Improve</h3>
              <p className="text-gray-400">
                Review your performance with detailed reports, export data, and track your progress over time.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-16 p-6 bg-card rounded-lg border border-yellow-600/30">
            <p className="text-yellow-400 font-semibold mb-2">⚠️ Important Disclaimer</p>
            <p className="text-gray-400 text-sm">
              TradeJournal provides educational content and analysis tools only. This is NOT financial advice.
              Trading involves substantial risk of loss. Always do your own research and consult with a licensed financial advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

