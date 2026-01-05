/**
 * Navbar Component (Enhanced)
 *
 * Full-width navbar with dropdown menus for better UX.
 * Supports sublinks and creative aesthetics.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, Zap, ChevronDown } from 'lucide-react'
import { GUEST_NAV_LINKS, AUTH_NAV_LINKS, NAVBAR_BRAND, NavLink } from './navbar/nav-data'
import { COLORS, TRANSITIONS, STORAGE_KEYS } from '@/lib/constants'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent hydration mismatch
  const isAuthenticated = mounted ? !!user : false

  // Check if we're on Dashboard or Settings page to show Sign Out
  const showSignOut = pathname?.startsWith('/dashboard') || pathname?.startsWith('/settings')

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push(NAVBAR_BRAND.homeUrl)
    } catch (error) {
      // Handle error silently
    }
  }

  // Get appropriate nav links based on auth status
  const navLinks = isAuthenticated ? AUTH_NAV_LINKS : GUEST_NAV_LINKS

  // Toggle dropdown
  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  // Render a nav link with dropdown support
  const renderNavLink = (link: NavLink, isMobile: boolean = false) => {
    // Skip if auth requirements don't match
    if (link.authRequired && !isAuthenticated) return null
    if (link.guestOnly && isAuthenticated) return null

    // Skip Settings link on desktop view
    if (!isMobile && link.label === 'Settings') return null

    const baseClasses = isMobile
      ? 'block px-4 py-2 text-base font-medium'
      : 'text-sm font-semibold'

    if (link.primary) {
      // Primary CTA button
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={`
            ${baseClasses}
            px-5 py-2.5 rounded-xl font-bold
            bg-gradient-to-r from-quotla-orange to-secondary-600
            text-white hover:from-secondary-600 hover:to-quotla-orange
            ${TRANSITIONS.DEFAULT}
            shadow-lg shadow-quotla-orange/30
            hover:shadow-quotla-orange/50 hover:scale-105
            flex items-center gap-2
            ${isMobile ? 'justify-center' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          {link.showIcon && <Zap className="h-4 w-4" />}
          {link.label}
        </Link>
      )
    }

    // Dropdown menu
    if (link.hasDropdown && link.dropdownItems) {
      if (isMobile) {
        return (
          <div key={link.label}>
            <button
              onClick={() => toggleDropdown(link.label)}
              className={`
                ${baseClasses} w-full text-left flex items-center justify-between
                text-quotla-light/80 hover:text-quotla-light
                ${TRANSITIONS.COLORS}
              `.trim().replace(/\s+/g, ' ')}
            >
              {link.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === link.label && (
              <div className="pl-4 mt-2 space-y-1">
                {link.dropdownItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[#fffad6]/80 hover:text-[#ce6203] transition-colors border-l-2 border-transparent hover:border-[#ce6203] hover:bg-[#ce6203]/5"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      }

      // Desktop dropdown
      return (
        <div key={link.label} className="relative" ref={openDropdown === link.label ? dropdownRef : null}>
          <button
            onClick={() => toggleDropdown(link.label)}
            onMouseEnter={() => setOpenDropdown(link.label)}
            className={`
              ${baseClasses} flex items-center gap-1
              text-quotla-light/90 hover:text-quotla-orange
              ${TRANSITIONS.COLORS}
            `.trim().replace(/\s+/g, ' ')}
          >
            {link.label}
            <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === link.label && (
            <div
              className="absolute top-full left-0 mt-2 w-80 bg-[#1a1f1f]/98 backdrop-blur-xl border border-[#445642]/40 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-fadeIn"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <div className="py-3 px-2">
                {link.dropdownItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenDropdown(null)}
                    className="relative flex items-start gap-4 px-4 py-3.5 rounded-lg hover:bg-[#445642]/20 transition-all duration-200 group"
                    style={{
                      animationDelay: `${index * 30}ms`,
                      animation: 'slideIn 0.3s ease-out forwards'
                    }}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <div className="flex-shrink-0 text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#fffad6] group-hover:text-[#ce6203] transition-colors text-sm leading-tight mb-1">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-[#d1d5db]/80 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#ce6203] rounded-r-full group-hover:h-12 transition-all duration-200"></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Regular link
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`
          ${baseClasses}
          text-quotla-light/90 hover:text-quotla-orange
          ${TRANSITIONS.COLORS}
          relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
          after:bg-quotla-orange after:transition-all hover:after:w-full
        `.trim().replace(/\s+/g, ' ')}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-quotla-dark/95 backdrop-blur-xl border-b-2 border-quotla-light/10 shadow-lg">
      {/* Full-width container */}
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={NAVBAR_BRAND.homeUrl} className="flex items-center gap-3 group">
            <img
              src={NAVBAR_BRAND.logo}
              alt="Quotla Logo"
              className="h-[56px] w-auto transform group-hover:scale-110 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => renderNavLink(link, false))}

            {/* Sign Out button (only on dashboard/settings) */}
            {isAuthenticated && showSignOut && (
              <button
                onClick={handleSignOut}
                className={`
                  text-sm font-semibold px-4 py-2 rounded-lg
                  text-quotla-light/80 hover:text-quotla-light
                  hover:bg-quotla-light/10
                  ${TRANSITIONS.COLORS}
                `.trim().replace(/\s+/g, ' ')}
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 text-quotla-light hover:text-quotla-orange ${TRANSITIONS.COLORS} rounded-lg hover:bg-quotla-light/10`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-quotla-dark/98 border-t border-quotla-light/10 backdrop-blur-xl">
          <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => renderNavLink(link, true))}

            {/* Sign Out button (mobile) */}
            {isAuthenticated && showSignOut && (
              <button
                onClick={handleSignOut}
                className={`
                  block w-full text-left px-4 py-2 text-base font-medium
                  text-quotla-light/80 hover:text-quotla-light
                  hover:bg-quotla-light/10 rounded-lg
                  ${TRANSITIONS.COLORS}
                `.trim().replace(/\s+/g, ' ')}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
