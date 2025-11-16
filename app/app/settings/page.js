'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { auth, db, storage, getAuthInstance } from '@/lib/clientFirebase';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const instance = getAuthInstance();
    if (instance) {
      const unsubscribe = onAuthStateChanged(instance, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, []);
  
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setDisplayName(data.displayName || user.displayName || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        updatedAt: new Date(),
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
      return;
    }

    if (!confirm('This will permanently delete all your trades, analysis, and account data. Type DELETE to confirm.')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete all trades
      const tradesRef = collection(db, 'users', user.uid, 'trades');
      const tradesSnapshot = await getDocs(tradesRef);
      const deletePromises = tradesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete all screenshots
      const screenshotsRef = ref(storage, `users/${user.uid}/screenshots`);
      try {
        const listResult = await listAll(screenshotsRef);
        const deleteScreenshotPromises = listResult.items.map((item) => deleteObject(item));
        await Promise.all(deleteScreenshotPromises);
      } catch (error) {
        console.error('Error deleting screenshots:', error);
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete auth account
      await deleteUser(user);

      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !userData) {
    return <div className="text-white">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Account Info */}
      {userData && (
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Plan:</span>
              <span className="text-white font-medium">{userData.plan || 'free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Analyses This Month:</span>
              <span className="text-white font-medium">
                {userData.analysisCount || 0} / 50
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member Since:</span>
              <span className="text-white font-medium">
                {userData.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy */}
      <div className="bg-card p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
        <Link
          href="/privacy-policy"
          className="text-primary hover:text-orange-400 transition-colors"
        >
          View Privacy Policy →
        </Link>
      </div>

      {/* Delete Account */}
      <div className="bg-card p-6 rounded-lg border border-red-500/30">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Delete Account</h2>
            <p className="text-gray-400 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

