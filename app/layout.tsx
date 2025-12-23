import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

// Primary typeface - Inter (similar to Open Sauce)
// Used for headings, UI labels, navigation, and core interface copy
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

// Secondary typeface - Bricolage Grotesque
// Used selectively for marketing headers, highlights, or emphasis where personality is needed
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Quotla - Professional Quote & Invoice Management',
  description: 'Create professional quotes and invoices with AI-powered content generation',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logos/icons/Quotla icon dark.svg',
    apple: '/images/logos/icons/Quotla icon dark.svg',
  },
  other: {
    'dns-prefetch': 'https://img.logo.dev',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0e1616',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolageGrotesque.variable}`}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
