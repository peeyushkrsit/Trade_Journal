# Changelog

All notable changes to TradeJournal will be documented in this file.

## [1.0.0] - 2024-01-XX

### Added
- Initial release of TradeJournal
- User authentication (Email/Password + Google)
- Trade journaling with manual entry and OCR
- AI-powered trade analysis (OpenAI GPT-3.5 or Gemini)
- Monthly quota system (50 free analyses/month)
- CSV and PDF export functionality
- Performance reports and statistics
- AI Coach chat interface
- Privacy policy and data deletion
- Dark trading terminal theme UI
- Responsive design for web

### Features
- **Trade Tracking**: Log trades with screenshots, notes, and metrics
- **OCR Integration**: Extract trade data from broker screenshots using Tesseract.js
- **AI Analysis**: Get quality scores, emotional patterns, mistakes, and suggestions
- **Reports**: View win rates, P&L, and export data
- **Security**: Firestore rules, user isolation, secure authentication

### Technical
- Next.js 14 with App Router
- Firebase (Auth, Firestore, Storage, Cloud Functions)
- Tailwind CSS for styling
- Tesseract.js for OCR
- OpenAI/Gemini for LLM analysis

