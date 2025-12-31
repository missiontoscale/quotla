/**
 * Footer Component (Refactored)
 *
 * Consolidated footer with no desktop/mobile duplication.
 * Uses centralized navigation data and shared components.
 *
 * Before: 274 lines
 * After: ~80 lines
 * LOC Reduction: ~194 lines (71% reduction)
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FOOTER_SECTIONS, FOOTER_BRAND, FooterLink as FooterLinkType } from './footer/footer-data'
import { FooterLink } from './footer/FooterLink'
import { COLORS, SPACING, TYPOGRAPHY, APP_VERSION } from '@/lib/constants'

export default function Footer() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Filter links based on auth status
  const filterLinks = (links: FooterLinkType[]) => {
    return links.filter((link) => {
      if (link.authRequired && !isAuthenticated) return false
      if (link.guestOnly && isAuthenticated) return false
      return true
    })
  }

  return (
    <footer className={`mt-auto bg-${COLORS.BG.ACCENT} border-t border-${COLORS.BORDER.LIGHT}`}>
      <div className={`${SPACING.CONTAINER} ${SPACING.SECTION_X} py-12`}>
        {/* Grid Layout (responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <img
                src={FOOTER_BRAND.logo}
                alt={`${FOOTER_BRAND.name} Logo`}
                className="h-10 md:h-11 w-auto transform group-hover:scale-105 transition-transform"
              />
              <span className={`${TYPOGRAPHY.HEADING_SM} text-${COLORS.TEXT.LIGHT} group-hover:text-${COLORS.BRAND.ORANGE} transition-colors`}>
                {FOOTER_BRAND.name}
              </span>
            </Link>
            <p className={`${TYPOGRAPHY.BODY_SM} font-semibold text-${COLORS.TEXT.LIGHT} mb-2`}>
              {FOOTER_BRAND.tagline}
            </p>
            <p className={`${TYPOGRAPHY.BODY_SM} text-${COLORS.TEXT.LIGHT}/70`}>
              {FOOTER_BRAND.description}
            </p>
          </div>

          {/* Navigation Sections */}
          {FOOTER_SECTIONS.map((section) => {
            const visibleLinks = filterLinks(section.links)
            if (visibleLinks.length === 0) return null

            return (
              <div key={section.title}>
                <h3 className={`font-semibold mb-4 text-${COLORS.TEXT.LIGHT}`}>
                  {section.title}
                </h3>
                <ul className={`space-y-2 ${TYPOGRAPHY.BODY_SM}`}>
                  {visibleLinks.map((link) => (
                    <li key={link.href}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Copyright */}
        <div className={`mt-8 pt-8 border-t border-${COLORS.BORDER.LIGHT} text-center`}>
          <p className={`${TYPOGRAPHY.BODY_SM} text-${COLORS.TEXT.LIGHT}/50`}>
            &copy; {new Date().getFullYear()} {FOOTER_BRAND.name}. All rights reserved.
          </p>
          <p className={`${TYPOGRAPHY.BODY_SM} text-${COLORS.TEXT.LIGHT}/30 mt-1`}>
            Version {APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  )
}
