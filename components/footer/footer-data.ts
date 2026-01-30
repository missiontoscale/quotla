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
    title: 'Solutions',
    links: [
      {
        label: 'For Business Owners',
        href: '/for-business',
      },
      {
        label: 'For Contractors',
        href: '/for-contractors',
      },
      {
        label: 'For Small Business',
        href: '/solutions',
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
        href: '/#features',
      },
      {
        label: 'Inventory Tracking',
        href: '/#features',
      },
      {
        label: 'Multi-Currency',
        href: '/#features',
      },
      {
        label: 'Client Portal',
        href: '/#features',
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
        label: 'Contact',
        href: ROUTES.ABOUT,
      },
    ],
  },
  {
    title: 'Legal',
    links: [
      {
        label: 'Privacy Policy',
        href: '/legal',
      },
      {
        label: 'Terms of Service',
        href: '/legal',
      },
    ],
  },
]

export const FOOTER_BRAND = {
  logo: '/images/logos/icons/Quotla full off white.svg',
  //name: 'Quotla',
  tagline: 'Seal your deal.',
  description:
    'Professional quote and inventory management for business owners and freelancers. Work smarter, get paid faster.',
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
