# Design & Security Implementation Plan

## Guiding Principles

### Mobile-First Design
All UI changes prioritize mobile users. Test on small screens first.

### Security by Design (OWASP A06)
Security controls designed into forms, navigation, and data handling from inception—not patched later.

---

## Phase 1: Invoice Form Improvements

**File:** `components/invoices/AddInvoiceDialog.tsx`

### Design Changes:
1. **FormSection containers:** Invoice Details, Line Items, Tax & Summary, Additional Details (collapsible)
2. **Proximity:** Group invoice # + title, issue + due dates, client + currency
3. **Labels:** Full words ("Invoice Number"), mark optional fields

### Security (A01, A05):
- Server-side validation for all invoice data (CWE-602)
- Verify user owns invoice before edit/view—using `user_id` filter ✓
- Sanitize notes/payment_terms before storage (XSS prevention)
- Parameterized queries via Supabase ✓

---

## Phase 2: Sidebar Navigation Grouping

**File:** `components/dashboard/Sidebar.tsx`

### Design Changes:
Restructure into groups:
- **Core:** Dashboard
- **Sales:** Customers, Invoices
- **Procurement:** Suppliers, Purchase Orders
- **Inventory:** Products, Stock Movements
- **Finance:** Payments, Accounts
- **Admin:** Audit Logs

**Visual:** Group labels `text-[0.65rem] text-slate-500 uppercase`, separators `border-t border-slate-800 my-2`, hide labels when collapsed.

### Security (A01):
- Navigation visibility should match user permissions
- Admin links render only for admin users
- Route protection enforced server-side regardless of UI

---

## Phase 3: Settings Page

**File:** `app/settings/page.tsx`

### Design Changes:
1. Section descriptions under headers
2. Group address fields with FieldGroup
3. Add "(optional)" indicator

### Security (A01, A06, A07):
- File upload validation (type, size) ✓
- Multi-step account deletion with confirmation ✓
- Verify `signOut()` invalidates server session
- CSRF protection on delete endpoint

---

## Phase 4: Other Form Dialogs

### Customer Form
**Sections:** Contact Information, Company Details, Address, Preferences

### Supplier Form
**Sections:** Contact Information, Payment Terms, Address & Tax

### Product Form
**Sections:** Basic Info, Pricing, Inventory

### Security for All Forms (A05):
- Sanitize text inputs before storage
- Validate email/URL formats server-side
- Escape output when displaying user data

---

## Phase 5: Error Handling & Feedback

### Design:
- Top-level banner for API errors
- Field-level: `border-rose-500` + error text below
- Toast notifications for success

### Security (A06, A10):
Generic messages to users, detailed logs server-side:
```tsx
// BAD
setError(err.message) // Could expose "relation 'invoices' does not exist"

// GOOD
console.error('Invoice creation failed:', err)
setError('Unable to create invoice. Please try again.')
```

---

## Phase 6: Drop the view/edit button

### Copy the entire methodology for editing products to editing invoices
- Editing invoices is currently broken, and does not actually show the details of previously created invoices when view/edit is clicked

### For all the list items across supplier, invoices, customers, etc:
[Since desktop is the one that has the following buttons]
- Drop the edit/view button. Instead, show a small pencil which users can click to edit.

---


## Phase 7: Recognition Over Recall

### Client Selection:
- "Recent" section with last 3 clients (filtered by current user)
- Show email for disambiguation

### Due Date:
- Preset buttons: "Net 15", "Net 30", "Net 60"

---

## Security Checklist

### Access Control (A01)
- [ ] All API routes verify `user_id` ownership
- [ ] No client-side-only access control
- [ ] Session tokens invalidated on logout
- [ ] Rate limiting on sensitive endpoints

### Injection Prevention (A05)
- [ ] Parameterized queries only
- [ ] Input sanitized before display (XSS)
- [ ] No string concatenation in queries

### Secure Design (A06)
- [ ] File uploads validated
- [ ] Sensitive actions require confirmation
- [ ] Error messages don't leak details
- [ ] Business logic validated server-side

### Authentication (A07)
- [ ] Session via Supabase Auth ✓
- [ ] Logout invalidates session
- [ ] Protected routes redirect unauthenticated

---

## Files to Modify

| Priority | File | Design | Security |
|----------|------|--------|----------|
| 1 | `components/invoices/AddInvoiceDialog.tsx` | Sections | Input sanitization |
| 2 | `components/dashboard/Sidebar.tsx` | Grouping | Permission visibility |
| 3 | `app/settings/page.tsx` | Address grouping | File upload, deletion |
| 4 | `components/customers/AddCustomerDialog.tsx` | Sections | Input sanitization |
| 5 | `components/suppliers/AddSupplierDialog.tsx` | Sections | Input sanitization |
| 6 | `components/products/AddProductDialog.tsx` | Sections | Input sanitization |

## Completed

| File | Status |
|------|--------|
| `components/ui/form-section.tsx` | ✅ Created |
| `components/ui/field-group.tsx` | ✅ Created |

---

## Verification

### Design Testing
1. Mobile-first: Test at 375px width
2. Sections visually distinct
3. Groups separated in sidebar
4. Optional/required marked

### Security Testing
1. Access another user's data via modified requests → should fail
2. Submit `<script>` in text fields → verify escaped
3. Logout → verify can't access protected routes
4. Trigger errors → verify no sensitive info exposed

### Checklist
- [ ] Proximity: Related items grouped
- [ ] Common Region: Sections have borders
- [ ] Mobile-first: Works on small screens
- [ ] Deny by default: Access denied unless granted
- [ ] Server-side validation: No client-only security
