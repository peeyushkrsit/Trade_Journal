'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/clientFirebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Topbar() {
  const [user] = useAuthState(auth || null);
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="h-16 bg-card border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

