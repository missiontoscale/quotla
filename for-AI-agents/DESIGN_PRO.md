# DESIGN_PRO.md — Design Operating System for AI Agents

## Purpose

This is not a style guide.

It is a **design operating system** — the rules and philosophy that govern all design decisions in Quotla.

---

## Design Philosophy

- **One primary action per screen** — never overload users with choices
- **Progressive disclosure** — advanced functionality is reached through menus, filters, or detail screens, not exposed by default
- **Health before analytics** — users first understand the state of their business, then explore the numbers if they choose
- **Responsive by natural breakpoints** — never device-specific breakpoints
- **Touch-first interactions** — all interactions are designed for touch before mouse/keyboard
- **Desktop adapts from mobile** — not the reverse

---

## Mobile-first Rules

1. All design starts at the smallest mobile viewport (320px)
2. Content flows in a single column by default
3. Desktop layouts extend from mobile layouts
4. Test on real mobile devices, not just browser dev tools
5. Touch targets must be at least 44x44px
6. Never use hover as the only way to reveal functionality

---

## Responsive Design Strategy

- Use natural/content-based breakpoints, not device-specific breakpoints
- Resize the browser continuously and add breakpoints where the design breaks
- Prefer fluid layouts (`%`, `clamp()`, `min()`, `max()`) over fixed breakpoints where possible
- Use TailwindCSS responsive prefixes consistently
- Mobile-first: start with mobile styles, add `sm:`, `md:`, `lg:`, `xl:` overrides

---

## Navigation Rules

- Maximum **3 items** in bottom navigation on mobile
- Maximum **4 items** in sidebar on desktop
- Bottom nav is for primary destinations only
- Secondary navigation belongs in drawers, menus, or detail screens
- Every screen must have a clear way to navigate back

---

## Layout Rules

- Maximum **3 sections** visible before scrolling
- Content is organized in a single column on mobile
- Multi-column layouts are desktop-only enhancements
- Cards group related information
- White space is a design element, not wasted space

---

## Information Hierarchy

1. **Health/Status** — is the business doing well? (shown first)
2. **Key metrics** — the 3-5 most important numbers
3. **Details** — drill-down data, history, transactions
4. **Actions** — what can the user do next?

Every screen answers **one question**.

---

## Accessibility

- All interactive elements must be keyboard accessible
- Color is never the sole indicator of state (use icons, text, or patterns too)
- Touch targets minimum 44x44px
- Sufficient color contrast (WCAG AA minimum)
- Screen reader labels on all icons and interactive elements
- Focus indicators visible on all interactive elements

---

## Performance Principles

- Mobile data is expensive — minimize payload size
- Lazy load below-the-fold content
- Optimize images using WebP or AVIF
- Minimize API calls
- Cache aggressively on the client
- Provide loading states for all async operations
- Never block rendering with large JavaScript bundles

---

## Animation Rules

- Animations must be optional via `prefers-reduced-motion`
- Keep animations short (200-300ms)
- Use animations to communicate state changes, not for decoration
- Never animate layout properties (use transforms instead)

---

## Component Consistency

- Use shadcn/ui components wherever possible
- Custom components must match the visual language of shadcn/ui
- Maintain consistent spacing using TailwindCSS spacing scale
- Use design tokens (CSS variables) for colors, spacing, typography
- Do not introduce new component libraries without review

---

## Color Philosophy

- **quotla-dark** — backgrounds
- **quotla-green** — success states, positive indicators
- **quotla-light** — accents, secondary surfaces
- **quotla-orange** — primary highlights, calls to action
- **primary-\*** — UI surfaces, cards, containers
- Color conveys meaning first, aesthetics second

---

## Typography

- Use the TailwindCSS typography scale
- Body text: readable size (16px base / `text-base`)
- Headings: clear hierarchy (`h1`, `h2`, `h3` mapped to responsive sizes)
- Line length: maximum ~66 characters per line for readability
- Avoid text in images

---

## Interaction Design

- Every interaction provides immediate feedback
- Form submissions show loading states
- Errors are communicated clearly with actionable messages
- Success states are celebrated briefly but not intrusively
- Destructive actions require confirmation
- Undo is preferred over confirmation dialogs where possible

---

## Definition of Good Design

A design is good when:
- The user knows the state of their business within seconds
- The user can complete their primary task in one screen
- The user never feels overwhelmed by choices or data
- The interface works reliably on a slow mobile connection
- The design feels warm, not corporate

---

## Design Review Checklist

Before considering design work complete:
- [ ] One primary action per screen
- [ ] Content visible without scrolling tells the full story
- [ ] Responsive at all breakpoints (320px and up)
- [ ] Touch targets are at least 44x44px
- [ ] Color is not the only indicator of state
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Loading states are present for all async operations
- [ ] Error states are handled
- [ ] Empty states are handled (helpful, not confusing)
- [ ] Mobile tested (not just browser dev tools)
- [ ] Keyboard navigable
- [ ] Screen reader friendly
