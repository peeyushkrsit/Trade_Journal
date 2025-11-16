'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db, getAuthInstance } from '@/lib/clientFirebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import TradeTable from '@/components/TradeTable';
import { TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    winRate: 0,
    avgRR: 0,
    tradesThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
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

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const tradesRef = collection(db, 'users', user.uid, 'trades');
        const q = query(tradesRef, orderBy('dateClose', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        
        const tradesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate stats
        const thisMonthTrades = tradesData.filter((trade) => {
          const tradeDate = trade.dateClose?.toDate ? trade.dateClose.toDate() : new Date(trade.dateClose);
          return tradeDate >= startOfMonth;
        });

        const winningTrades = tradesData.filter((t) => (t.pnl || 0) > 0);
        const winRate = tradesData.length > 0 
          ? (winningTrades.length / tradesData.length) * 100 
          : 0;

        // Calculate average R:R (simplified)
        const avgRR = tradesData.length > 0
          ? tradesData.reduce((sum, t) => {
              if (t.entryPrice && t.exitPrice && t.stopLoss) {
                const risk = Math.abs(t.entryPrice - t.stopLoss);
                const reward = Math.abs(t.exitPrice - t.entryPrice);
                return sum + (risk > 0 ? reward / risk : 0);
              }
              return sum;
            }, 0) / tradesData.length
          : 0;

        setTrades(tradesData);
        setStats({
          winRate: winRate.toFixed(1),
          avgRR: avgRR.toFixed(2),
          tradesThisMonth: thisMonthTrades.length,
        });
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.displayName || 'Trader'}</p>
        </div>
        <Link
          href="/app/new-trade"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Trade
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          subtitle="All time"
          icon={Target}
        />
        <StatsCard
          title="Avg R:R"
          value={stats.avgRR}
          subtitle="Risk to Reward"
          icon={TrendingUp}
        />
        <StatsCard
          title="Trades This Month"
          value={stats.tradesThisMonth}
          subtitle="Current month"
          icon={TrendingDown}
        />
      </div>

      {/* Recent Trades */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Trades</h2>
          <Link
            href="/app/journal"
            className="text-primary hover:text-orange-400 transition-colors text-sm"
          >
            View All →
          </Link>
        </div>
        <TradeTable trades={trades} />
      </div>
    </div>
  );
}

