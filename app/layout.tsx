import type { Metadata, Viewport } from 'next'
import { Poppins, Bricolage_Grotesque, Barlow, Figtree } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Quotla - Professional Quote & Invoice Management',
  description: 'Create professional quotes and invoices with AI-powered content generation',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/quotla-logo.png',
    apple: '/images/quotla-logo.png',
  },
  other: {
    'dns-prefetch': 'https://img.logo.dev',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${bricolageGrotesque.variable} ${barlow.variable} ${figtree.variable}`}>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
