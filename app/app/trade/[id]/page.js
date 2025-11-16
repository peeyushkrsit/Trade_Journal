'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, getAuthInstance } from '@/lib/clientFirebase';
import AnalysisCard from '@/components/AnalysisCard';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
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
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user || !params.id) return;

    const fetchTrade = async () => {
      try {
        const tradeDoc = await getDoc(doc(db, 'users', user.uid, 'trades', params.id));
        if (tradeDoc.exists()) {
          setTrade({ id: tradeDoc.id, ...tradeDoc.data() });
        } else {
          toast.error('Trade not found');
          router.push('/app/journal');
        }
      } catch (error) {
        console.error('Error fetching trade:', error);
        toast.error('Failed to load trade');
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [user, params.id, router]);

  const handleAnalyze = async () => {
    if (!user || !trade) return;
    setAnalyzing(true);
    try {
      const analyzeTrade = httpsCallable(functions, 'analyzeTrade');
      await analyzeTrade({ tradeId: trade.id });
      toast.success('Analysis started. Refreshing...');
      // Refresh trade data
      const tradeDoc = await getDoc(doc(db, 'users', user.uid, 'trades', trade.id));
      if (tradeDoc.exists()) {
        setTrade({ id: tradeDoc.id, ...tradeDoc.data() });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      if (error.code === 'quota_exceeded') {
        toast.error('Free monthly analysis quota (50) reached. Please wait until next month.');
      } else {
        toast.error('Analysis failed: ' + error.message);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('trade-detail-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`trade_${trade.symbol}_${trade.id}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (loading) {
    return <div className="text-white">Loading trade...</div>;
  }

  if (!trade) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {trade.symbol || 'Trade'} - {formatDate(trade.dateClose || trade.dateOpen)}
          </h1>
          <p className="text-gray-400 mt-1">Trade Details & Analysis</p>
        </div>
        <div className="flex gap-3">
          {!trade.aiAnalysis && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-card border border-gray-700 text-white rounded-lg font-medium hover:bg-card-hover transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div id="trade-detail-content" className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Trade Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Trade Info */}
          <div className="bg-card p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Trade Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Symbol</p>
                <p className="text-lg font-semibold text-white">{trade.symbol || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Side</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    trade.side === 'long'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {trade.side?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Entry Price</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(trade.entryPrice || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Exit Price</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(trade.exitPrice || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Stop Loss</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(trade.stopLoss || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Quantity</p>
                <p className="text-lg font-semibold text-white">{trade.qty || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">P&L</p>
                <p className={`text-lg font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(trade.pnl || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">P&L %</p>
                <p className={`text-lg font-semibold ${(trade.pnlPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(trade.pnlPercent || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-card p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Price Chart</h2>
            <div className="h-64 bg-background rounded-lg flex items-center justify-center border border-gray-800">
              <p className="text-gray-500">Chart placeholder - integrate your charting library here</p>
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div className="bg-card p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}

          {/* Screenshot */}
          {trade.screenshotPath && (
            <div className="bg-card p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Screenshot</h2>
              <img
                src={trade.screenshotPath}
                alt="Trade screenshot"
                className="max-w-full h-auto rounded-lg border border-gray-800"
              />
            </div>
          )}
        </div>

        {/* Right Column - Analysis */}
        <div>
          <AnalysisCard tradeId={trade.id} analysis={trade.aiAnalysis} onUpdate={() => {
            // Refresh trade data
            getDoc(doc(db, 'users', user.uid, 'trades', trade.id)).then((doc) => {
              if (doc.exists()) {
                setTrade({ id: doc.id, ...doc.data() });
              }
            });
          }} />
        </div>
      </div>
    </div>
  );
}

