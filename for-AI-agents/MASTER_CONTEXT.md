# MASTER_CONTEXT.md — Complete Understanding of Quotla

This file contains **zero instructions**. It explains what Quotla is becoming.

---

## Mission

Help businesses become wiser over time. Every day the business should become easier to run than it was yesterday — not because the owner worked harder, but because the business itself retained what it learned.

---

## Vision

A conversational business OS for African small and medium businesses that runs primarily on WhatsApp, making sophisticated business management accessible to anyone with a phone.

---

## Core Philosophy

- **Conversational-first** — WhatsApp is the primary interface; web is secondary
- **Detect drift, not events** — businesses do not collapse in a day, they drift
- **Questions > Features** — every decision starts as a question, not a feature request
- **Business as accumulated experience** — memory is passive; learning is active
- **Health over metrics** — users understand the state of their business first, then explore numbers if they choose

---

## Target Customers

- African small business owners and entrepreneurs
- Freelancers and contractors across Africa
- Micro-businesses currently using pen-and-paper or spreadsheets
- Businesses needing mobile-first financial management

---

## Customer Personas

- **The micro-entrepreneur** — runs a small shop or service business, needs simple tracking of sales, expenses, and inventory
- **The freelancer/contractor** — needs invoicing, expense tracking, and profitability analysis
- **The growing business owner** — has employees, needs deeper insights and multi-user access

---

## Problems Being Solved

- Business owners do not know their profitability in real time
- Expense tracking is fragmented across notes, receipts, and memory
- Inventory management is done manually or not at all
- Financial insights require desktop software that is inaccessible on mobile
- Existing tools are built for Western markets and do not account for African business patterns

---

## Product Principles

- One primary action per screen
- Maximum three sections visible before scrolling
- Maximum three items in bottom navigation
- Every screen answers one question
- Progressive disclosure — advanced functionality behind menus/filters, not exposed by default
- Health over metrics — state of business first, numbers second

---

## Business Philosophy

### Health-over-Metrics Philosophy

Users should first understand the state of their business through a health indicator, then drill into the numbers if they choose. This prevents data overwhelm and keeps focus on actionable insights rather than raw numbers.

### WhatsApp-first Philosophy

WhatsApp is not an add-on or notification channel. It is the primary interface. The web dashboard supplements WhatsApp, not the reverse. Users should be able to run their entire business through conversational interactions.

### Mobile-first Philosophy

All design starts at the smallest mobile viewport. Desktop adapts from mobile, never the reverse. Touch interactions are primary; mouse/keyboard are secondary.

### African-first Considerations

- Internet connectivity may be intermittent or expensive — optimize for offline resilience and low bandwidth
- Mobile data costs matter — minimize payload size and API calls
- Multiple currencies and informal economic patterns must be supported
- Local business practices (e.g. credit sales, negotiable pricing) are first-class features, not edge cases

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | TailwindCSS 3 |
| Component Library | shadcn/ui + Radix UI primitives |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email/password + Google OAuth) |
| Charts | Recharts |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| Document Generation | docx |
| Spreadsheet | SheetJS (xlsx) |
| Icons | Lucide React |
| Forms | react-hook-form |
| Date Handling | date-fns |
| Notifications | sonner |
| Drawer | vaul |
| Carousel | embla-carousel-react |

**Architecture**: Single Next.js monolith (no separate backend)

---

## Current Status

- Build passes clean
- `tsc --noEmit` passes with 0 errors
- `next build` succeeds
- `ignoreBuildErrors: false` in `next.config.mjs`

---

## Navigation Structure (Current)

- **Primary nav (mobile bottom / desktop sidebar):** Dashboard, Sales, Inventory, Expenses
- **Maximum 4 bottom nav items** (currently 4)

---

## Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page (hero, features, FAQ) |
| `/about` | About Quotla |
| `/pricing` | Pricing plans (Free, Starter, Professional, Enterprise) |
| `/solutions` | Solutions overview |
| `/for-business` | For business page |
| `/for-contractors` | For contractors page |
| `/login` | Login page |
| `/signup` | Signup page |
| `/legal` | Legal / privacy policy |

## Authenticated Pages

| Route | Purpose |
|-------|---------|
| `/onboarding` | Onboarding wizard (new user setup) |
| `/business/dashboard` | Main business dashboard |
| `/business/sales` | Sales and invoices management |
| `/business/products` | Products and inventory management |
| `/business/expenses` | Expenses and vendors management |
| `/business/settings` | Business settings |
| `/business/api-docs` | API documentation and schema reference |

## Admin Pages

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |

---

## Brand Identity

- **Name:** Quotla
- **Tone:** Warm, earthy, professional, conversational
- **Colors:** quotla-dark (bg), quotla-green (success), quotla-light (accent), quotla-orange (primary highlight), primary-\* (UI surfaces)

---

## Long-term Roadmap

_To be populated as the product evolves._

---

## Future Capabilities

_To be populated as the product evolves._

---

## Architecture Direction

- Monolithic Next.js application with Supabase backend
- API routes within Next.js (no separate backend service)
- Server-side rendering where beneficial, static generation where possible
- Progressive enhancement toward offline capability

---

## Technology Decisions

- TypeScript for type safety across the entire stack
- TailwindCSS for utility-first responsive design
- shadcn/ui for consistent, accessible, customizable components
- Supabase for managed PostgreSQL with built-in auth and RLS
- No separate backend — single Next.js monolith keeps deployment simple

---

## Current Constraints

- Must maintain zero TypeScript errors
- Must maintain successful production build
- Must work reliably on low-bandwidth mobile connections
- Must support touch-first interactions
- Must support multiple currencies

---

## Non-negotiable Product Decisions

- WhatsApp is the primary interface, not a notification channel
- Health indicator is the primary metric shown to users
- All design is mobile-first
- Progressive disclosure applies to every screen
- Zero TypeScript errors and zero build errors are mandatory
