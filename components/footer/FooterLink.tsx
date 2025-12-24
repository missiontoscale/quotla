/**
 * FooterLink Component
 *
 * Reusable footer link component with consistent styling.
 * Uses design tokens from constants.
 */

import Link from 'next/link'
import { COLORS, TRANSITIONS } from '@/lib/constants'

interface FooterLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const FooterLink: React.FC<FooterLinkProps> = ({ href, children, className = '' }) => {
  return (
    <Link
      href={href}
      className={`
        text-${COLORS.TEXT.LIGHT}/70
        hover:text-${COLORS.TEXT.ACCENT}
        ${TRANSITIONS.COLORS}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </Link>
  )
}

export default FooterLink
