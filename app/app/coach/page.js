'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/clientFirebase';
import { MessageSquare, Send } from 'lucide-react';

export default function CoachPage() {
  const [user] = useAuthState(auth || null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI trading coach. I can help you reflect on your trading patterns, emotions, and strategies. Ask me anything about your trading journey!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in production, this would call a Cloud Function)
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on your trading patterns, I'd suggest focusing on risk management first. What specific area would you like to improve?",
        "Emotional trading is common. Try keeping a journal of your feelings before each trade. What emotions do you notice most?",
        "Remember, consistency is key. Review your win rate and identify what's working. What's your biggest challenge right now?",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1000);
  };

  const quickPrompts = [
    "How can I improve my win rate?",
    "What emotional patterns should I watch for?",
    "Help me review my risk management",
    "What mistakes am I making?",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Coach</h1>
        <p className="text-gray-400 mt-1">Get personalized trading insights and guidance</p>
      </div>

      <div className="bg-card rounded-lg border border-gray-800 flex flex-col h-[calc(100vh-250px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-background text-gray-300 border border-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="px-3 py-1 text-sm bg-background border border-gray-700 rounded-lg text-gray-300 hover:bg-card-hover transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your trading coach..."
              className="flex-1 px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-400">
          ⚠️ AI Coach provides educational guidance only. This is NOT financial advice.
        </p>
      </div>
    </div>
  );
}

