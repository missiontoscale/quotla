import type { Metadata } from 'next'
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
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/images/quotla-logo.png',
    apple: '/images/quotla-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${bricolageGrotesque.variable} ${barlow.variable} ${figtree.variable}`}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/images/quotla-logo.png" />
      </head>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
