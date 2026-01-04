import { ROUTES } from '@/lib/constants'

export interface FooterLink {
  label: string
  href: string
  authRequired?: boolean // Only show for authenticated users
  guestOnly?: boolean // Only show for guests
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'For Business Owners',
    links: [
      {
        label: 'Freelancers',
        href: '/solutions/freelancers',
      },
      {
        label: 'Small Business',
        href: '/solutions/small-business',
      },
      {
        label: 'Agencies',
        href: '/solutions/agencies',
      },
      {
        label: 'Consultants',
        href: '/solutions/consultants',
      },
      {
        label: 'Pricing',
        href: ROUTES.PRICING,
      },
    ],
  },
  {
    title: 'Features',
    links: [
      {
        label: 'AI Quote Generation',
        href: '/features/ai-quotes',
      },
      {
        label: 'Invoice Management',
        href: '/features/invoices',
      },
      {
        label: 'Inventory Tracking',
        href: '/features/inventory',
      },
      {
        label: 'Multi-Currency',
        href: '/features/multi-currency',
      },
      {
        label: 'Client Portal',
        href: '/features/client-portal',
      },
      {
        label: 'Analytics & Reports',
        href: '/features/analytics',
      },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'Blog',
        href: ROUTES.BLOG,
      },
      {
        label: 'About Us',
        href: ROUTES.ABOUT,
      },
      {
        label: 'Help Center',
        href: '/help',
      },
      {
        label: 'API Docs',
        href: '/docs/api',
      },
      {
        label: 'Community',
        href: ROUTES.COMMUNITY,
        authRequired: true,
      },
      {
        label: 'Testimonials',
        href: ROUTES.TESTIMONIALS,
      },
    ],
  },
  {
    title: 'Company',
    links: [
      {
        label: 'Careers',
        href: ROUTES.CAREERS,
      },
      {
        label: 'Contact Us',
        href: '/contact',
      },
      {
        label: 'Press Kit',
        href: '/press',
      },
      {
        label: 'Partners',
        href: '/partners',
      },
    ],
  },
  {
    title: 'Legal',
    links: [
      {
        label: 'Privacy Policy',
        href: ROUTES.PRIVACY,
      },
      {
        label: 'Terms of Service',
        href: ROUTES.TERMS,
      },
      {
        label: 'Cookie Policy',
        href: '/legal/cookies',
      },
      {
        label: 'Security',
        href: '/legal/security',
      },
    ],
  },
]

export const FOOTER_BRAND = {
  logo: '/images/logos/icons/Quotla full off white.svg',
  //name: 'Quotla',
  tagline: 'Seal your deal.',
  description:
    'Professional invoice, quote, and inventory management for business owners and freelancers. Work smarter, get paid faster.',
}

export const FOOTER_SOCIAL = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/quotla',
    icon: '𝕏'
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/quotla',
    icon: '💼'
  },
  {
    name: 'GitHub',
    href: 'https://github.com/quotla',
    icon: '⚙️'
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/quotla',
    icon: '📸'
  },
]
