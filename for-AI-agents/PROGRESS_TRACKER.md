# PROGRESS_TRACKER.md — Progress, Lessons, and Outstanding Problems

---

## Current Phase

**UI Revamp — Design Structure Implementation**

Following the `design structure.txt` specification, the entire authenticated UI is being restructured from the current 4-tab navigation (Dashboard, Sales, Inventory, Expenses) to a 3-tab navigation (Health, Quotla, Records) with bottom sheets, slide-in drawers, and a notification center.
---

## Current Sprint

Phase 1: Navigation & Layout Restructure

---

## Implementation Plan (9 Independent Phases)

### PHASE 1: Navigation & Layout Restructure
**Goal:** Replace the current 4-item bottom nav and sidebar with the new 3-item nav structure.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 1.1 | Create new `BottomNav` with 3 items: Health (HNIC), Quotla (QNIC), Records (RNIC). Active state = filled/dark icon. Tooltips on each. | `components/dashboard/BottomNav.tsx` |
| 1.2 | Update `Sidebar` to match new nav items + add Records sub-items. | `components/dashboard/Sidebar.tsx` |
| 1.3 | Update `TopBar` — add hamburger icon (HIC) on left, notification icon (NIC) on right. Remove old search/avatar dropdown. | `components/dashboard/TopBar.tsx` |
| 1.4 | Restructure `DashboardLayout` — integrate new TopBar, new BottomNav, prepare slot for bottom sheets. | `components/DashboardLayout.tsx` |
| 1.5 | Create route `/business/dashboard` → Health screen. Update dashboard layout. | `app/business/dashboard/page.tsx`, `app/business/dashboard/layout.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 2: Health Screen (Home)
**Goal:** Rebuild the dashboard as the Health screen — answers "Is my business okay?"

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 2.1 | **Health Score component** — Circular/visual indicator showing business health percentage inside [HNIC], with "Last updated X ago" timestamp. | `components/health/HealthScore.tsx` |
| 2.2 | **Needs Attention section** — Red AIC icon, collapsible list of items (overdue invoices with amount, low stock products). Max 2 visible, collapse rest. | `components/health/NeedsAttention.tsx` |
| 2.3 | **Today's metrics cards** — Revenue, Profit, Outstanding in 2x2 grid layout with ₦ formatting. | `components/health/TodayMetrics.tsx` |
| 2.4 | **Customer search bar** — Rounded-corner search with "customers" placeholder, filters down to customer search. | `components/health/CustomerSearch.tsx` |
| 2.5 | **Recent Activity section** — Activity feed with icons per type (SIC for sales, IIC for invoices, etc). "View all" slides up bottom sheet. | `components/health/RecentActivity.tsx` |
| 2.6 | **Assemble Health Screen** — Compose all components into the main `/business/dashboard` page. | `app/business/dashboard/page.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 3: Quotla Action Sheet (Bottom Sheet)
**Goal:** Middle nav button opens a bottom sheet with quick-create actions.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 3.1 | **Quotla Sheet component** — Bottom sheet (using vaul) that swipes up from bottom. Title "What's up?" with REDX close button. | `components/quotla/QuotlaSheet.tsx` |
| 3.2 | **Action items** — Each row: [SIC] "I just made a sale!" >, [IIC] "I need an invoice" >, [PIC] "I want to add a new product" >, [EIC] "I spent money" >, [CIC] "Want to add a customer" >. | `components/quotla/QuotlaSheet.tsx` |
| 3.3 | **"More" sub-view** — When user clicks "More", the tab transforms/swipes to show [DIC] Documents and [HISC] History options. | `components/quotla/QuotlaMoreView.tsx` |
| 3.4 | **"Nothing" dismiss** — REDX "Nothing" option closes the sheet. | `components/quotla/QuotlaSheet.tsx` |
| 3.5 | **SheetTrigger integration** — Wire the QNIC bottom nav button to open the sheet. | `components/dashboard/BottomNav.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 4: Records Bottom Sheet & Sub-pages
**Goal:** Records bottom sheet provides access to Sales, Invoices, Expenses, Inventory, Customers, Documents.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 4.1 | **Records Sheet component** — Bottom sheet (vaul) with title "Records", HIC and SIC in header. | `components/records/RecordsSheet.tsx` |
| 4.2 | **Records list items** — [SIC] Sales >, [IIC] Invoices >, [EIC] Expenses >, [PIC] Inventory >, [MCIC] Customers >, [DIC] Documents >. Each navigates to its page/section. | `components/records/RecordsSheet.tsx` |
| 4.3 | **Recent Activity in Records** — Same activity feed pattern, collapsed after 3 items with "View all" affordance. | `components/records/RecordsRecentActivity.tsx` |
| 4.4 | **Page routing** — Ensure existing pages (sales, products, expenses) are accessible from Records. Possibly create missing pages (invoices, customers, documents). | `app/business/sales/page.tsx`, `app/business/invoices/page.tsx`, `app/business/customers/page.tsx`, `app/business/documents/page.tsx` |
| 4.5 | **SheetTrigger integration** — Wire the RNIC bottom nav button to open the sheet. | `components/dashboard/BottomNav.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 5: Pipeline Screens (Universal Creation Flows)
**Goal:** Build all creation pipelines using the shared Action → Details → Review → Done flow.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 5.1 | **Pipeline framework** — Create reusable `PipelineContainer`, `PipelineStep`, `PipelineReview` components that enforce the 3-4 step pattern. | `components/pipeline/PipelineContainer.tsx`, `components/pipeline/PipelineStep.tsx`, `components/pipeline/PipelineReview.tsx` |
| 5.2 | **Record Sale pipeline** — 3 steps: (1) Search/select product or service, (2) Customer, Quantity, Payment method, (3) Review & Record Sale. | `components/pipeline/RecordSalePipeline.tsx` |
| 5.3 | **Invoice pipeline** — 3 steps: (1) Customer, (2) Service, Price, Due Date, (3) Review & Create Invoice. | `components/pipeline/InvoicePipeline.tsx` |
| 5.4 | **Expense pipeline** — 3 steps: (1) Category (Rent/Transport/Utilities/Products/Salary/Other), (2) Amount, Description, Receipt (optional), (3) Review & Save Expense. | `components/pipeline/ExpensePipeline.tsx` |
| 5.5 | **Add Product pipeline** — 3 steps: (1) Product Name, Category, (2) Buying Price, Selling Price, Current Stock, Minimum Stock, (3) Review & Save Product. | `components/pipeline/AddProductPipeline.tsx` |
| 5.6 | **Add Customer** — Single screen: Name, Phone, Email (optional), Birthday (optional), Notes (optional), Save. | `components/pipeline/AddCustomerScreen.tsx` |
| 5.7 | **Create Quote pipeline** — 4 steps: (1) Customer, (2) Service, (3) Price, Expiry Date, (4) Review & Create Quote. | `components/pipeline/CreateQuotePipeline.tsx` |
| 5.8 | **Documents screen** — Upload options: Upload, Take Photo, Import PDF, Import Image, Cancel. | `components/documents/DocumentsScreen.tsx` |
| 5.9 | **Product Details view** — Detail display: Stock, Buying Price, Selling Price, Minimum Stock, Edit button. | `components/products/ProductDetails.tsx` |
| 5.10 | **Customer Details view** — Detail display: Phone, Last Purchase, Total Purchases, Outstanding, Record Sale button. | `components/customers/CustomerDetails.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 6: Notifications System
**Goal:** Notification panel with Attention/Updates/System tabs accessed from NIC icon.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 6.1 | **Notification Panel component** — Slide-in/overlay panel from right with "< Notifications" header and TDIC menu. | `components/notifications/NotificationPanel.tsx` |
| 6.2 | **Filter tabs** — Three tabs: Attention, Updates, System. Each shows filtered notifications. | `components/notifications/NotificationFilters.tsx` |
| 6.3 | **Notification items** — Rows with appropriate icons per type (SIC/IIC/EIC/CIC/PIC/QIC), description, amount, timestamp. | `components/notifications/NotificationItem.tsx` |
| 6.4 | **Notification data/context** — Fetch and manage notification state from Supabase or local events. | `contexts/NotificationContext.tsx` |
| 6.5 | **Badge/indicator** — Unread count badge on NIC in TopBar. | `components/dashboard/TopBar.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 7: Hamburger Menu (Settings Drawer)
**Goal:** Slide-in drawer from right with settings, business, account options.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 7.1 | **Settings Drawer component** — Slides from right when HIC is clicked. QLO logo + REDX close. | `components/settings/SettingsDrawer.tsx` |
| 7.2 | **Menu items** — [BPIC] Business, [SETIC] Settings, [SBIC] Switch Business, [BILIC] Billings, [HSIC] Support, [SIIC] Sign Out (faded grey). | `components/settings/SettingsDrawer.tsx` |
| 7.3 | **DrawerTrigger integration** — Wire HIC in TopBar to open the drawer. | `components/dashboard/TopBar.tsx` |
| 7.4 | **Sign Out logic** — Handle sign out with confirmation. | `components/settings/SettingsDrawer.tsx` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 8: Icon System & Polish
**Goal:** Implement all icon shortcodes, tooltips, transitions, accessibility.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 8.1 | **Icon registry** — Create a central icon mapping (QLO, SIC, EIC, IIC, QIC, CIC, MCIC, PIC, DIC, AIC, HIC, SMIC, TDIC, REDX, HISIC, NIC, HNIC, QNIC, RNIC, BPIC, SETIC, SBIC, BILIC, HSIC, SIIC) mapped to Lucide icons. | `components/icons/IconRegistry.tsx` |
| 8.2 | **Tooltip system** — All navigation icons get tooltip quick actions on hover/tap-hold. | `components/ui/TooltipWrapper.tsx` |
| 8.3 | **Smooth transitions** — Ensure all panel slides, sheet swipes, and drawer animations are smooth (200-300ms) and respect `prefers-reduced-motion`. | Global CSS + animation utilities |
| 8.4 | **Accessibility pass** — aria-labels on all icons, keyboard navigation for sheets/drawers, screen reader labels. | Across all new components |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

### PHASE 9: Verification & Cleanup
**Goal:** Ensure zero errors and no broken references.

| Stage | Description | Files to Create/Modify |
|-------|-------------|------------------------|
| 9.1 | **TypeScript check** — Run `npx tsc --noEmit`, fix all errors. | — |
| 9.2 | **Build check** — Run `npm run build`, fix all errors. | — |
| 9.3 | **Remove deprecated components** — Delete old Sidebar (if replaced), old BottomNav (if replaced), old dashboard components that are no longer referenced. | Various |
| 9.4 | **Update references** — Ensure all links lead to existing pages. Update any cross-references. | Various |
| 9.5 | **Final PROGRESS_TRACKER update** — Document scores, lessons, remaining issues. | `for-AI-agents/PROGRESS_TRACKER.md` |

**Verification:** `npx tsc --noEmit`, `npm run build`

---

## Completed Work

- Initial project setup with Next.js 16, React 19, TypeScript, TailwindCSS 3, shadcn/ui
- Supabase integration (PostgreSQL + Auth)
- Public pages: Landing, About, Pricing, Solutions, Legal
- Authentication pages: Login, Signup
- Authenticated pages: Dashboard, Sales, Products, Expenses, Settings, API Docs
- Admin dashboard
- Core feature pages (Sales, Inventory, Expenses) implemented
- AI agents folder restructured with new governance files
- **Context gathered:** Read MASTER_GUIDE.md, MASTER_CONTEXT.md, DESIGN_PRO.md, design structure.txt, explored full codebase
- **Implementation plan created:** 9 phases with detailed stages for full UI revamp
- **Integrated "design structures yet to be accounted for.txt":** Merged Universal Pipeline philosophy and 9 creation screen designs into design structure.txt; cleaned and removed redundant file

---

## In Progress

**PHASE 1: Navigation & Layout Restructure**
- Not yet started

---

## Upcoming Work

See [Implementation Plan](#implementation-plan-8-independent-phases) above.

---

## Major Decisions Made

- Single Next.js monolith (no separate Go backend)
- WhatsApp-first architecture (conversational primary interface)
- Health-over-metrics philosophy
- Mobile-first design approach
- Supabase for both database and authentication
- shadcn/ui + Radix UI for component library
- AI agents governed by structured files in `for-AI-agents/`
- **Design structure revamp:** Health/Quotla/Records 3-tab navigation, bottom sheets instead of pages, notification center, slide-in settings drawer

---

## Architecture Changes

- Folder `for-AI-agents/` restructured: replaced 7 redundant files with 6 structured governance files
- `MASTER_GUIDE.md`, `MASTER_CONTEXT.md`, `SECURITY_PRO.md`, `DESIGN_PRO.md`, `PROGRESS_TRACKER.md`, `SECURITY_LOOPHOLES.md` created
- `design principles/` and `security-principles/` retained as supporting reference directories
- **Future:** BottomNav will change from 4 items (Dashboard, Sales, Inventory, Expenses) to 3 items (Health, Quotla, Records)
- **Future:** Dashboard becomes Health screen with health score, needs attention, today metrics
- **Future:** New bottom sheets for Quotla actions and Records navigation
- **Future:** Notification panel with 3 tabs (Attention, Updates, System)
- **Future:** Slide-in settings drawer replaces old settings dropdown

---

## Files Modified

_None yet in this revamp phase._

---

## Known Issues

_None documented._

---

## Technical Debt

_None documented._

---

## Security Concerns

_None documented._

---

## Design Concerns

_None documented._

---

## Lessons Learned

- Separating instructions (MASTER_GUIDE) from product knowledge (MASTER_CONTEXT) reduces confusion
- Security governance should reference external principle files, not duplicate them
- A single progress file is better than scattered logs (LessonsSoFar + WhatIsWrong + PRD)
- **New:** The design structure specification is detailed enough to implement phase-by-phase independently
- **New:** Each phase should be self-contained with its own verification step to maintain progress continuity
- **New:** "design structures yet to be accounted for.txt" integrated into design structure.txt as Universal Pipeline + dedicated pipeline screens (Record Sale, Invoice, Expense, Add Product, Add Customer, Create Quote, Documents, Product Details, Customer Details)
- **New:** Existing file deleted after clean integration

---

## Mistakes To Never Repeat

- Avoid mixing instructions and product knowledge in the same file
- Avoid scattered progress tracking across multiple files
- Avoid duplicating OWASP content when references suffice
- Avoid making unrelated changes during a phase — surgical changes per phase only

---

## Performance Notes

- Next.js 16 with React 19 provides strong baseline performance
- TailwindCSS ensures minimal CSS overhead
- vaul (drawer library) is already in the stack for bottom sheets
- sonner (toast library) is already in the stack for notifications

---

## Security Audit Results

- npm audit passes at moderate level
- TypeScript strict mode enabled
- RLS policies require verification on all tables

---

## Design Audit Results

- Design follows one-primary-action-per-screen principle
- **New design:** Navigation reduced to 3 items (was 4) — satisfies DESIGN_PRO rule of max 3
- **New design:** Health screen answers "Is my business okay?" — satisfies one-question-per-screen
- Mobile-first responsive approach in place

---

## Overall Security Score

**Not yet rated** (baseline established, detailed audit pending)

## Overall Design Score

**Not yet rated** (baseline established, detailed audit pending)

---

## Next Recommended Task

**PHASE 1, Stage 1.1:** Create new BottomNav with 3 items: Health (HNIC), Quotla (QNIC), Records (RNIC). Start in `components/dashboard/BottomNav.tsx`.
