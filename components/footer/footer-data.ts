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
    title: 'Product',
    links: [
      {
        label: 'Create Quote',
        href: ROUTES.SIGNUP,
        guestOnly: true,
      },
      {
        label: 'Create',
        href: ROUTES.SIGNUP,
        authRequired: true,
      },
      {
        label: 'Testimonials',
        href: ROUTES.TESTIMONIALS,
      },
      {
        label: 'Pricing',
        href: ROUTES.PRICING,
      },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'About Us',
        href: ROUTES.ABOUT,
      },
      {
        label: 'Blog',
        href: ROUTES.BLOG,
      },
      {
        label: 'Community',
        href: ROUTES.COMMUNITY,
        authRequired: true,
      },
      {
        label: 'Careers',
        href: ROUTES.CAREERS,
      },
    ],
  },
  {
    title: 'Compliance',
    links: [
      {
        label: 'Privacy Policy',
        href: ROUTES.PRIVACY,
      },
      {
        label: 'Terms of Service',
        href: ROUTES.TERMS,
      },
    ],
  },
]

export const FOOTER_BRAND = {
  logo: '/images/logos/icons/Quotla full off white.svg',
  //name: 'Quotla',
  tagline: 'Seal your deal.',
  description:
    'Bespoke product for business owners, and professionals with invoice, quote, and inventory management',
}
