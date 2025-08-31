import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tone Picker Text Tool',
  description: 'Transform your text\'s tone using AI-powered language processing',
  keywords: ['AI', 'text', 'tone', 'transformation', 'Mistral AI'],
  authors: [{ name: 'Tone Picker Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
