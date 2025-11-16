'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/" className="text-primary hover:text-orange-400 transition-colors mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-card p-8 rounded-lg border border-gray-800 space-y-6 text-gray-300">
          <div>
            <p className="text-sm text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              TradeJournal collects the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information: email address, display name</li>
              <li>Trading data: trades, screenshots, notes, and analysis</li>
              <li>Usage data: how you interact with the application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and improve our services</li>
              <li>Generate AI-powered trade analysis</li>
              <li>Send you important updates about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage</h2>
            <p className="mb-4">
              Your data is stored securely using Firebase (Google Cloud Platform). We implement industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. Your trading data is private and only accessible to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your data at any time</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in CSV format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through the app settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

