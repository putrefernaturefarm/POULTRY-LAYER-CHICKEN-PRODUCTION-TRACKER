import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'LayerPro — Poultry Layer Chicken Production Tracker',
  description: 'Professional poultry layer management system for flocks, eggs, feed, health, morbidity, mortality, and farm performance.',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
