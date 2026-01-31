/**
 * Footer Component (Enhanced)
 *
 * Full-width footer with expanded navigation and social links.
 * Creative asymmetric design with gradient accents.
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FOOTER_SECTIONS, FOOTER_BRAND, FOOTER_SOCIAL, FooterLink as FooterLinkType } from './footer/footer-data'
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
    <footer className="relative mt-auto bg-gradient-to-br from-quotla-dark via-[#0a0f0f] to-quotla-dark border-t-2 border-quotla-light/10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-quotla-orange/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-quotla-green/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.015]" style={{backgroundSize: '150%'}}></div>
      </div>

      <div className="relative w-full px-6 lg:px-12 py-16">
        {/* Top Section - Brand + Social */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 pb-12 border-b border-quotla-light/10">
          {/* Brand */}
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <img
                src={FOOTER_BRAND.logo}
                alt="Quotla Logo"
                className="h-12 w-auto transform group-hover:scale-110 transition-transform"
              />
            </Link>
            <p className="font-heading text-xl font-bold text-quotla-orange mb-2">
              {FOOTER_BRAND.tagline}
            </p>
            <p className="text-sm text-quotla-light/70 leading-relaxed">
              {FOOTER_BRAND.description}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-heading text-sm font-bold text-quotla-light/50 uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              {FOOTER_SOCIAL.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-quotla-light/5 hover:bg-quotla-orange/20 border border-quotla-light/10 hover:border-quotla-orange/50 flex items-center justify-center text-2xl transition-all hover:scale-110 group"
                  aria-label={social.name}
                >
                  <span className="group-hover:rotate-12 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Grid - Full width, 5 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {FOOTER_SECTIONS.map((section) => {
            const visibleLinks = filterLinks(section.links)
            if (visibleLinks.length === 0) return null

            return (
              <div key={section.title}>
                <h3 className="font-heading font-bold mb-4 text-quotla-light text-sm uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {visibleLinks.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom Section - Newsletter + Copyright */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-8 border-t border-quotla-light/10">
          {/* Newsletter Signup */}
          <div className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="email"
                placeholder="Enter your email for updates"
                className="px-4 py-2.5 rounded-lg bg-quotla-light/5 border border-quotla-light/10 text-quotla-light placeholder:text-quotla-light/40 focus:outline-none focus:border-quotla-orange transition-colors w-full sm:w-64"
              />
              <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-quotla-orange to-secondary-600 text-white font-semibold hover:from-secondary-600 hover:to-quotla-orange transition-all shadow-lg hover:scale-105 w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center lg:text-right">
            <p className="text-sm text-quotla-light/50">
              &copy; {new Date().getFullYear()} Quotla. All rights reserved.
            </p>
            <p className="text-xs text-quotla-light/30 mt-1">
              Version {APP_VERSION} • Made with ❤️ for entrepreneurs
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient bar at bottom */}
      <div className="h-1 w-full bg-gradient-to-r from-quotla-orange via-quotla-green to-quotla-orange"></div>
    </footer>
  )
}
