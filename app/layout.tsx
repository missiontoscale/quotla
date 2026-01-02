import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { openSauceSans } from '@/components/font/open-sauce'

// Secondary typeface - Open Sauce Sans (brand's secondary font)
// Used for body text, UI labels, navigation, and core interface copy
// Professional, clean sans-serif that provides excellent readability

// Primary typeface - Bricolage Grotesque
// Used selectively for marketing headers, highlights, or emphasis where personality is needed
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Quotla | Top product innovation helping seal more deals. - Professional Quote, Invoice, and InventoryManagement',
  description: 'Bespoke product for business owners, and professionals with invoice, quote, and inventory management.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logos/icons/Quotla icon orange.svg',
    apple: '/images/logos/icons/Quotla icon orange.svg',
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
    <html lang="en" className={`${openSauceSans.variable} ${bricolageGrotesque.variable}`} suppressHydrationWarning>
      <body className={openSauceSans.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
