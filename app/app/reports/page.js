'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/clientFirebase';
import ExportCSV, { exportTradesToCSV } from '@/components/ExportCSV';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [user] = useAuthState(auth || null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const tradesRef = collection(db, 'users', user.uid, 'trades');
        const snapshot = await getDocs(tradesRef);
        
        const tradesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrades(tradesData);

        // Calculate stats
        const winningTrades = tradesData.filter((t) => (t.pnl || 0) > 0);
        const losingTrades = tradesData.filter((t) => (t.pnl || 0) < 0);
        const totalPnL = tradesData.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const avgWin = winningTrades.length > 0
          ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
          : 0;
        const avgLoss = losingTrades.length > 0
          ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
          : 0;
        const largestWin = winningTrades.length > 0
          ? Math.max(...winningTrades.map((t) => t.pnl || 0))
          : 0;
        const largestLoss = losingTrades.length > 0
          ? Math.min(...losingTrades.map((t) => t.pnl || 0))
          : 0;

        setStats({
          totalTrades: tradesData.length,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          totalPnL,
          avgWin,
          avgLoss,
          largestWin,
          largestLoss,
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
    return <div className="text-white">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Analyze your trading performance</p>
        </div>
        {trades.length > 0 && <ExportCSV trades={trades} />}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Total Trades</p>
          <p className="text-3xl font-bold text-white">{stats.totalTrades}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Win Rate</p>
          <p className="text-3xl font-bold text-white">
            {stats.totalTrades > 0
              ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Total P&L</p>
          <p className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalPnL)}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Avg Win</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.avgWin)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Avg Loss</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(stats.avgLoss)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Largest Win</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.largestWin)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Largest Loss</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(stats.largestLoss)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Profit Factor</p>
          <p className="text-3xl font-bold text-white">
            {Math.abs(stats.avgLoss) > 0
              ? (stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-card p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Export Data</h2>
        <div className="flex gap-4">
          <button
            onClick={() => exportTradesToCSV(trades)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <p className="text-sm text-gray-400 flex items-center">
            Export all your trades with analysis data for external analysis
          </p>
        </div>
      </div>
    </div>
  );
}

