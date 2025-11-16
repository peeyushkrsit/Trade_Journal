'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/clientFirebase';
import TradeTable from '@/components/TradeTable';
import ExportCSV from '@/components/ExportCSV';

export default function JournalPage() {
  const [user] = useAuthState(auth || null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const tradesRef = collection(db, 'users', user.uid, 'trades');
        const q = query(tradesRef, orderBy('dateClose', 'desc'));
        const snapshot = await getDocs(q);
        
        const tradesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrades(tradesData);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  if (loading) {
    return <div className="text-white">Loading journal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trade Journal</h1>
          <p className="text-gray-400 mt-1">All your trades in one place</p>
        </div>
        {trades.length > 0 && <ExportCSV trades={trades} />}
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}

