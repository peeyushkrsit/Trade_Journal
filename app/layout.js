import './globals.css'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Lazy load Toaster to reduce initial bundle
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
)

export const metadata = {
  title: 'TradeJournal - AI Trade Journal & Emotional Coach',
  description: 'Track your trades, analyze performance, and improve with AI-powered insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

