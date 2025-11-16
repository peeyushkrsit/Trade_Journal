'use client';

import Link from 'next/link';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';

export default function TradeTable({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-card p-8 rounded-lg border border-gray-800 text-center">
        <p className="text-gray-400">No trades found. Start by adding your first trade!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-card-hover border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Exit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-card-hover transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(trade.dateClose || trade.dateOpen)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {trade.symbol || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      trade.side === 'long'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {trade.side?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(trade.entryPrice || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(trade.exitPrice || 0)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(trade.pnl || 0)} ({formatPercent(trade.pnlPercent || 0)})
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {trade.aiAnalysis?.qualityScore ? (
                    <span
                      className={`text-sm font-semibold ${
                        trade.aiAnalysis.qualityScore >= 70
                          ? 'text-green-400'
                          : trade.aiAnalysis.qualityScore >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {trade.aiAnalysis.qualityScore}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/app/trade/${trade.id}`}
                    className="text-primary hover:text-orange-400 transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

