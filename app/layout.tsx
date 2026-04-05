import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'I CAN – Language Learning',
  description: 'Read, speak, and learn at your level',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
