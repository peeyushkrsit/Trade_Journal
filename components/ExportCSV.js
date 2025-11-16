'use client';

import { formatDate } from '@/lib/utils';

export function exportTradesToCSV(trades) {
  if (!trades || trades.length === 0) {
    return;
  }

  const headers = [
    'Date Open',
    'Date Close',
    'Symbol',
    'Instrument',
    'Side',
    'Entry Price',
    'Exit Price',
    'Stop Loss',
    'Quantity',
    'Premium',
    'P&L',
    'P&L %',
    'Quality Score',
    'Emotions',
    'Mistakes',
    'Suggestions',
    'Notes',
  ];

  const rows = trades.map((trade) => {
    const emotions = trade.aiAnalysis?.emotionTags
      ?.map((e) => `${e.tag}(${Math.round(e.confidence * 100)}%)`)
      .join('; ') || '';
    const mistakes = trade.aiAnalysis?.mistakes?.join('; ') || '';
    const suggestions = trade.aiAnalysis?.suggestions?.join('; ') || '';

    return [
      formatDate(trade.dateOpen),
      formatDate(trade.dateClose),
      trade.symbol || '',
      trade.instrument || '',
      trade.side || '',
      trade.entryPrice || 0,
      trade.exitPrice || 0,
      trade.stopLoss || '',
      trade.qty || 0,
      trade.premium || 0,
      trade.pnl || 0,
      trade.pnlPercent || 0,
      trade.aiAnalysis?.qualityScore || '',
      emotions,
      mistakes,
      suggestions,
      trade.notes || '',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const str = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ExportCSV({ trades }) {
  const handleExport = () => {
    exportTradesToCSV(trades);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
    >
      Export CSV
    </button>
  );
}

