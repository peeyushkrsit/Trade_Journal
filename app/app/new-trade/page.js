'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions, getAuthInstance } from '@/lib/clientFirebase';
import FileUploader from '@/components/FileUploader';
import toast from 'react-hot-toast';
import { calculatePositionSize, sanitizeOCRText } from '@/lib/utils';

export default function NewTradePage() {
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
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  
  const [formData, setFormData] = useState({
    symbol: '',
    instrument: 'stock',
    side: 'long',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    qty: '',
    premium: '',
    dateOpen: '',
    dateClose: '',
    notes: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOCRDataExtracted = (extracted) => {
    setFormData((prev) => ({
      ...prev,
      ...extracted,
      entryPrice: extracted.entryPrice?.toString() || prev.entryPrice,
      exitPrice: extracted.exitPrice?.toString() || prev.exitPrice,
      stopLoss: extracted.stopLoss?.toString() || prev.stopLoss,
      qty: extracted.qty?.toString() || prev.qty,
      symbol: extracted.symbol || prev.symbol,
    }));
  };

  const handleOCRComplete = (text) => {
    setOcrText(text);
  };

  const handleFileSelect = (file) => {
    setScreenshotFile(file);
  };

  const calculatePnL = () => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.qty) || 0;
    const premium = parseFloat(formData.premium) || 0;

    if (formData.side === 'long') {
      const pnl = (exit - entry) * qty - premium;
      const pnlPercent = entry > 0 ? ((exit - entry) / entry) * 100 : 0;
      return { pnl, pnlPercent };
    } else {
      const pnl = (entry - exit) * qty - premium;
      const pnlPercent = entry > 0 ? ((entry - exit) / entry) * 100 : 0;
      return { pnl, pnlPercent };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in');
      return;
    }

    setLoading(true);
    try {
      const { pnl, pnlPercent } = calculatePnL();
      
      // Upload screenshot if exists
      let screenshotPath = '';
      if (screenshotFile) {
        const screenshotRef = ref(storage, `users/${user.uid}/screenshots/${Date.now()}_${screenshotFile.name}`);
        await uploadBytes(screenshotRef, screenshotFile);
        screenshotPath = await getDownloadURL(screenshotRef);
      }

      // Create trade document
      const tradeData = {
        ...formData,
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: parseFloat(formData.exitPrice) || 0,
        stopLoss: parseFloat(formData.stopLoss) || 0,
        qty: parseFloat(formData.qty) || 0,
        premium: parseFloat(formData.premium) || 0,
        pnl,
        pnlPercent,
        dateOpen: formData.dateOpen ? new Date(formData.dateOpen) : new Date(),
        dateClose: formData.dateClose ? new Date(formData.dateClose) : new Date(),
        screenshotPath,
        ocrText: sanitizeOCRText(ocrText),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tradeRef = await addDoc(collection(db, 'users', user.uid, 'trades'), tradeData);
      
      toast.success('Trade saved successfully');

      // Optionally trigger AI analysis
      const analyzeTrade = httpsCallable(functions, 'analyzeTrade');
      try {
        await analyzeTrade({ tradeId: tradeRef.id });
        toast.success('AI analysis started');
      } catch (error) {
        console.error('Analysis error:', error);
        // Don't fail the save if analysis fails
      }

      router.push(`/app/trade/${tradeRef.id}`);
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error('Failed to save trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New Trade</h1>
        <p className="text-gray-400 mt-1">Add a new trade to your journal</p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-gray-800 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Trade Details</h2>

            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-400 mb-2">
                Symbol *
              </label>
              <input
                id="symbol"
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="AAPL"
              />
            </div>

            <div>
              <label htmlFor="instrument" className="block text-sm font-medium text-gray-400 mb-2">
                Instrument
              </label>
              <select
                id="instrument"
                name="instrument"
                value={formData.instrument}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="stock">Stock</option>
                <option value="option">Option</option>
                <option value="future">Future</option>
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>

            <div>
              <label htmlFor="side" className="block text-sm font-medium text-gray-400 mb-2">
                Side
              </label>
              <select
                id="side"
                name="side"
                value={formData.side}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-400 mb-2">
                  Entry Price *
                </label>
                <input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  name="entryPrice"
                  value={formData.entryPrice}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label htmlFor="exitPrice" className="block text-sm font-medium text-gray-400 mb-2">
                  Exit Price *
                </label>
                <input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  name="exitPrice"
                  value={formData.exitPrice}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="105.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-400 mb-2">
                  Stop Loss
                </label>
                <input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="95.00"
                />
              </div>

              <div>
                <label htmlFor="qty" className="block text-sm font-medium text-gray-400 mb-2">
                  Quantity *
                </label>
                <input
                  id="qty"
                  type="number"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="premium" className="block text-sm font-medium text-gray-400 mb-2">
                Premium/Fees
              </label>
              <input
                id="premium"
                type="number"
                step="0.01"
                name="premium"
                value={formData.premium}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOpen" className="block text-sm font-medium text-gray-400 mb-2">
                  Date Open
                </label>
                <input
                  id="dateOpen"
                  type="date"
                  name="dateOpen"
                  value={formData.dateOpen}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="dateClose" className="block text-sm font-medium text-gray-400 mb-2">
                  Date Close
                </label>
                <input
                  id="dateClose"
                  type="date"
                  name="dateClose"
                  value={formData.dateClose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="Your thoughts, strategy, emotions..."
              />
            </div>
          </div>
        </div>

        {/* Right Column - OCR */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Screenshot & OCR</h2>
            <FileUploader
              onOCRComplete={handleOCRComplete}
              onDataExtracted={handleOCRDataExtracted}
              onFileSelect={handleFileSelect}
            />
          </div>

          {/* P&L Preview */}
          {formData.entryPrice && formData.exitPrice && formData.qty && (
            <div className="bg-card p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">P&L Preview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">P&L:</span>
                  <span className={`font-semibold ${calculatePnL().pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${calculatePnL().pnl.toFixed(2)} ({calculatePnL().pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Trade & Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
}

