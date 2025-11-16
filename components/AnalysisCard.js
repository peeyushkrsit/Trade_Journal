'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/clientFirebase';
import toast from 'react-hot-toast';

export default function AnalysisCard({ tradeId, analysis, onUpdate }) {
  const [user] = useAuthState(auth || null);
  const [markingLearned, setMarkingLearned] = useState(false);

  const handleMarkLearned = async () => {
    if (!tradeId || !user) return;
    setMarkingLearned(true);
    try {
      await updateDoc(doc(db, 'users', user.uid, 'trades', tradeId), {
        lessonLearned: true,
        updatedAt: new Date(),
      });
      toast.success('Marked as lesson learned');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setMarkingLearned(false);
    }
  };

  if (!analysis) {
    return (
      <div className="bg-card p-6 rounded-lg border border-gray-800">
        <p className="text-gray-400">No analysis available yet.</p>
      </div>
    );
  }

  const qualityColor = analysis.qualityScore >= 70 ? 'text-green-400' : 
                       analysis.qualityScore >= 50 ? 'text-yellow-400' : 'text-red-400';

  const emotionColors = {
    fear: 'bg-red-500/20 text-red-400 border-red-500/30',
    greed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    overconfidence: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    revenge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    hesitation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">AI Analysis</h2>
        <div className={`text-4xl font-bold ${qualityColor}`}>
          {analysis.qualityScore}
        </div>
      </div>

      {/* Quality Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Quality Score</span>
          <span className={`text-sm font-semibold ${qualityColor}`}>
            {analysis.qualityScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              analysis.qualityScore >= 70 ? 'bg-green-500' :
              analysis.qualityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${analysis.qualityScore}%` }}
          />
        </div>
      </div>

      {/* Emotion Tags */}
      {analysis.emotionTags && analysis.emotionTags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Emotional Patterns</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.emotionTags.map((emotion, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  emotionColors[emotion.tag] || emotionColors.neutral
                }`}
              >
                {emotion.tag} ({Math.round(emotion.confidence * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mistakes */}
      {analysis.mistakes && analysis.mistakes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Mistakes Identified</h3>
          <ul className="space-y-2">
            {analysis.mistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-1">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Suggestions</h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-primary mt-1">→</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation */}
      {analysis.explainers && (
        <div className="mb-6 p-4 bg-background rounded-lg border border-gray-800">
          <p className="text-sm text-gray-300">{analysis.explainers}</p>
        </div>
      )}

      {/* Confidence */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Analysis Confidence</span>
          <span className="text-sm font-semibold text-gray-300">
            {Math.round((analysis.confidence || 0) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${(analysis.confidence || 0) * 100}%` }}
          />
        </div>
      </div>

      {/* Mark as Learned */}
      <button
        onClick={handleMarkLearned}
        disabled={markingLearned}
        className="w-full py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
      >
        {markingLearned ? 'Marking...' : 'Mark Lesson Learned'}
      </button>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-400">
          ⚠️ Analysis is educational only and not financial advice.
        </p>
      </div>
    </div>
  );
}

