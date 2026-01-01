# Quotla - AI-Powered Business Management Platform

**Empowering small businesses with enterprise-grade tools that are simple to use and accessible to all.**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Inventory Management System](#inventory-management-system)
- [Quote & Invoice Integration](#quote--invoice-integration)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Future Roadmap](#future-roadmap)
- [Support](#support)

---

## Overview

Quotla is an intelligent business management platform designed to help small businesses and entrepreneurs streamline their operations through AI-powered document generation, comprehensive inventory management, and business automation tools.

### Mission

Empower small businesses with enterprise-grade tools that are simple to use and accessible to all.

---

## Features

### Core Document Management

#### Intelligent Quote Generation
- AI-powered quote generation from natural language
- Conversational interface for quick creation
- Manual form-based creation
- Customizable line items with descriptions, quantities, and pricing
- Automatic tax calculations
- Multi-currency support (USD, NGN, EUR, GBP, CAD, AUD, JPY, CNY)
- Draft and sent status tracking
- Export to PDF, DOCX, and PNG formats

#### Invoice Management
- AI-powered invoice generation from natural language
- Voice input support for hands-free creation
- File upload (PDF, DOCX, images) for data extraction
- Convert quotes to invoices
- Payment terms and due date management
- Invoice status tracking (draft, sent, paid, overdue)
- Professional export formats
- Automatic stock deduction on invoice creation

#### Client Management
- Complete client profiles with contact information
- Client address management
- Document history per client
- Quick client selection during document creation

### Inventory Management System (QuickBooks-Level Features)

#### Product & Service Management
- Track both physical products and services
- SKU (Stock Keeping Unit) support
- Categories and descriptions
- Multi-currency pricing (USD, NGN, EUR, GBP)
- Cost price vs selling price tracking
- Tax rate configuration per item
- Active/inactive status management

#### Real-Time Inventory Tracking
- Real-time stock quantity monitoring
- Low stock threshold alerts
- Out-of-stock detection
- Reorder quantity suggestions
- Optional tracking (can be disabled for services)
- Inventory valuation (cost and retail value)

#### Supplier Management
- Complete supplier/vendor database
- Contact information management
- Payment terms tracking (Due on receipt, Net 15, 30, 60, 90)
- Active/inactive status
- Address and tax ID storage
- Notes and communication history

#### Stock Movement Audit Trail
- Complete history of all stock changes
- Movement types: purchase, sale, adjustment, return, damage, transfer
- Reference linking to quotes, invoices, and purchase orders
- Financial value tracking for each movement
- User attribution for all changes

#### Purchase Order System
- Create and manage purchase orders
- Link to suppliers
- Line item management
- Status tracking (draft, sent, received, partial, cancelled)
- Automatic total calculations
- Expected delivery date tracking

#### Low Stock Alerts
- Automatic alert generation when stock falls below threshold
- Notification system (ready for email integration)
- Acknowledgement tracking
- Dashboard widget for quick visibility

#### Quote & Invoice Integration
- Automatic stock deduction when quotes are approved
- Automatic stock deduction when invoices are sent/paid
- Real-time stock availability checking
- Currency mismatch warnings
- Stock status indicators (In stock, Low stock, Out of stock)

### AI & Automation

#### Natural Language Processing
- Text-based conversational AI
- Voice recording and transcription
- Intent classification (quote vs invoice detection)
- Automatic data extraction from descriptions

#### Vision AI
- PDF data extraction
- Image-to-text conversion
- Document parsing and structuring
- Support for DOCX and TXT files

#### Content Generation
- Line item description enhancement
- Professional language optimization
- Context-aware content generation

### Business Operations

#### Dashboard & Analytics
- Recent quotes and invoices overview
- Quick action buttons
- Status summaries
- Navigation to all features
- Low stock alerts widget
- Inventory statistics (Total Items, Total Value, Low Stock, Out of Stock)

#### Business Profile Management
- Company logo upload
- Business details configuration
- Tax information setup
- Branding customization

#### Export & Sharing
- PDF generation with branded templates
- DOCX export for editing
- PNG export for quick sharing
- Automatic formatting and styling

### Content & Marketing

#### Blog System
- Markdown-based blog posts
- Categories and tags
- Featured posts
- Comment system with moderation
- Reading time calculation
- SEO-friendly URLs
- Isolated dark mode (doesn't affect other pages)

#### Newsletter
- Subscription forms
- Subscriber database
- Admin dashboard for subscriber management

### Security & Compliance

#### Authentication & Authorization
- Email/password authentication
- JWT token-based sessions
- Row-level security (RLS) on all tables
- Password complexity requirements
- Secure session management

#### Data Protection
- Rate limiting on sensitive endpoints
- Input sanitization (XSS prevention)
- File upload validation
- Audit logging
- HTTPS encryption

### Administrative Tools

#### Admin Dashboard
- Comment moderation
- Newsletter subscriber management
- Audit log viewing
- User activity monitoring

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 15, React 19 | Server-side rendering, modern UI |
| Backend | Next.js API Routes | Serverless API endpoints |
| AI Backend | FastAPI (External) | AI operations, model orchestration |
| Database | Supabase (PostgreSQL) | Data storage with RLS |
| Authentication | Supabase Auth | Secure user management |
| AI Models | OpenAI, Anthropic, Google | Content generation, NLP |
| Storage | Supabase Storage | File and image storage |
| Deployment | Vercel | Edge deployment, CDN |
| Styling | Tailwind CSS | Utility-first CSS framework |
| UI Components | Headless UI, Lucide Icons | Accessible components |
| Forms | React Hook Form | Form state management |
| PDF Generation | jsPDF, jsPDF-AutoTable | Document export |
| DOCX Generation | docx | Word document export |

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- API keys for AI providers (OpenAI, Anthropic, or Google)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quotla
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# External AI API (FastAPI backend)
NEXT_PUBLIC_AI_API_URL=your_fastapi_url
```

4. Set up the database:
- Run `database/inventory-schema.sql` in Supabase SQL Editor
- Run `database/add-inventory-to-quotes-invoices.sql` in Supabase SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Inventory Management System

### Database Schema

The inventory system uses 6 main tables:

1. **suppliers** - Vendor/supplier information
2. **inventory_items** - Products and services catalog
3. **purchase_orders** - Purchase order headers
4. **purchase_order_items** - PO line items
5. **stock_movements** - Complete audit trail
6. **low_stock_alerts** - Automated alerts

All tables have Row Level Security (RLS) enabled for user-scoped data access.

### Key Features

#### Automatic Stock Tracking
When quotes are approved or invoices are sent/paid, stock is automatically deducted via database triggers:
- Stock quantity updated in real-time
- Movement record created in audit trail
- Low stock alerts triggered if threshold reached
- Financial impact tracked

#### Inventory Valuation
Real-time calculation of:
- Total inventory value (at cost)
- Potential profit (retail value - cost value)
- Category-wise breakdown
- Profit margin per item

#### Multi-Currency Support
Track inventory in 4 major currencies:
- USD (US Dollar)
- NGN (Nigerian Naira)
- EUR (Euro)
- GBP (British Pound)

### Usage Example

```typescript
// Import the inventory selector component
import InventoryItemSelector from '@/components/InventoryItemSelector'

// Use in your quote/invoice form
<InventoryItemSelector
  onSelect={(inventoryItem) => {
    // Populate line item with inventory details
    setLineItem({
      description: inventoryItem.name,
      unit_price: inventoryItem.unit_price,
      inventory_item_id: inventoryItem.id,
      stock_status: inventoryItem.quantity_on_hand > 0 ? 'In stock' : 'Out of stock'
    })
  }}
  currency={formData.currency}
/>
```

### Database Functions

#### Update Inventory Quantity
Central function for all stock changes:

```typescript
await supabase.rpc('update_inventory_quantity', {
  p_inventory_item_id: 'item-uuid',
  p_quantity_change: -5,  // negative for decrease, positive for increase
  p_movement_type: 'sale',
  p_reference_type: 'invoice',
  p_reference_id: 'invoice-uuid',
  p_notes: 'Sold to customer'
})
```

---

## Quote & Invoice Integration

### How It Works

#### When Creating a Quote/Invoice
1. User selects an inventory item using `InventoryItemSelector` component
2. Item details (name, price, stock info) are populated automatically
3. Stock availability is checked and displayed:
   - ✅ In stock - Enough inventory available
   - ⚠️ Low stock - Below threshold but available
   - ❌ Out of stock - No inventory available
   - 📦 Service - No inventory tracking needed

#### When Quote is Approved
```sql
-- Automatic trigger fires
UPDATE quotes SET status = 'approved' WHERE id = 'quote-id';

-- For each line item with inventory_item_id:
-- 1. Stock quantity is decreased
-- 2. Stock movement record is created
-- 3. Low stock alert generated if needed
```

#### When Invoice is Sent/Paid
```sql
-- Automatic trigger fires
UPDATE invoices SET status = 'sent' WHERE id = 'invoice-id';

-- For each line item with inventory_item_id:
-- 1. Stock quantity is decreased
-- 2. Stock movement record is created
-- 3. Low stock alert generated if needed
```

### Stock Validation

Before creating a quote/invoice, validate stock availability:

```typescript
const validateStock = async (items: LineItem[]) => {
  const warnings: string[] = []

  for (const item of items) {
    if (item.inventory_item_id && item.stock_status === 'Out of stock') {
      warnings.push(`${item.description} is out of stock`)
    } else if (item.available_quantity !== undefined && item.quantity > item.available_quantity) {
      warnings.push(`${item.description}: Requesting ${item.quantity} but only ${item.available_quantity} available`)
    }
  }

  if (warnings.length > 0) {
    const proceed = confirm('Stock warnings:\n\n' + warnings.join('\n') + '\n\nProceed anyway?')
    return proceed
  }

  return true
}
```

### Viewing Stock History

```typescript
// Get stock movement history
const { data } = await supabase
  .from('stock_movements')
  .select('*')
  .eq('inventory_item_id', inventoryItemId)
  .order('created_at', { ascending: false })

// Find related documents
const { data: quoteMovements } = await supabase
  .from('stock_movements')
  .select('*, quotes(*)')
  .eq('inventory_item_id', inventoryItemId)
  .eq('reference_type', 'quote')
```

---

## Database Setup

### Step 1: Run Main Inventory Schema

In Supabase SQL Editor, run `database/inventory-schema.sql`:
- Creates 6 inventory tables
- Sets up triggers and functions
- Creates helper views
- Configures RLS policies
- Creates indexes for performance

### Step 2: Run Integration Schema

In Supabase SQL Editor, run `database/add-inventory-to-quotes-invoices.sql`:
- Adds `inventory_item_id` to quote_items and invoice_items
- Creates automatic stock deduction triggers
- Creates status checking views

### Verification

```sql
-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'inventory%';

-- Verify triggers created
SELECT * FROM pg_trigger WHERE tgname LIKE '%inventory%';

-- Verify RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'inventory%';
```

---

## Project Structure

```
/app
  /api
    /inventory
      /low-stock-alerts
        route.ts              # Alert management API
  /inventory
    page.tsx                  # Main inventory dashboard
    /new
      page.tsx                # Add new item form
    /[id]
      /edit
        page.tsx              # Edit item form
    /suppliers
      page.tsx                # Suppliers list
      /new
        page.tsx              # Add supplier form
  /quotes
    page.tsx                  # Quotes list
    /new
      page.tsx                # Create quote
  /invoices
    page.tsx                  # Invoices list
    /new
      page.tsx                # Create invoice
  /blog
    page.tsx                  # Blog listing
  /dashboard
    page.tsx                  # Main dashboard

/components
  InventoryItemSelector.tsx   # Reusable inventory picker
  LowStockAlerts.tsx          # Alert display widget
  /navbar
    nav-data.ts               # Navigation configuration

/types
  inventory.ts                # Inventory type definitions
  index.ts                    # Core type definitions

/database
  inventory-schema.sql        # Main inventory schema
  add-inventory-to-quotes-invoices.sql  # Integration schema

/documentation
  INVENTORY_SYSTEM_GUIDE.md   # Complete inventory guide
  INVENTORY_QUOTE_INVOICE_INTEGRATION.md  # Integration guide
  IMPLEMENTATION_SUMMARY.md   # Implementation overview
  PRODUCT_REQUIREMENTS.md     # Product requirements
  SESSION_COMPLETE.md         # Session summary
```

---

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Run development server on port 3000
npm run dev

# Run on custom port (e.g., 3001)
PORT=3001 npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Quality

- Full TypeScript coverage
- ESLint configuration
- Prettier formatting
- React Hook Form for forms
- Tailwind CSS for styling

### Testing Checklist

#### Inventory Management
- [ ] Create a product with inventory tracking
- [ ] Create a service without tracking
- [ ] Add multiple suppliers
- [ ] Edit inventory items
- [ ] Delete inventory items
- [ ] Search functionality
- [ ] Filter by type/category
- [ ] Low stock toggle
- [ ] Multi-currency items

#### Inventory Integration
- [ ] Add InventoryItemSelector to quote form
- [ ] Create quote with inventory items
- [ ] Approve quote and verify stock decreases
- [ ] Check stock movement record created
- [ ] Add InventoryItemSelector to invoice form
- [ ] Create invoice with inventory items
- [ ] Mark invoice as sent/paid
- [ ] Verify stock decreases
- [ ] Test with out-of-stock items
- [ ] Test currency mismatches

#### Stock Alerts
- [ ] Reduce inventory below threshold
- [ ] Verify alert created in database
- [ ] Check alert shows correct quantity
- [ ] Test acknowledgement

---

## Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Required environment variables for production:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
NEXT_PUBLIC_AI_API_URL=
```

### Database Migrations

Run the following SQL scripts in order:
1. `database/inventory-schema.sql`
2. `database/add-inventory-to-quotes-invoices.sql`

---

## Documentation

### Comprehensive Guides

- **INVENTORY_SYSTEM_GUIDE.md** - Complete inventory system overview, features, database schema, setup instructions
- **INVENTORY_QUOTE_INVOICE_INTEGRATION.md** - Integration guide for quotes and invoices with inventory
- **IMPLEMENTATION_SUMMARY.md** - Detailed implementation summary with architecture highlights
- **PRODUCT_REQUIREMENTS.md** - Full product requirements and roadmap
- **SESSION_COMPLETE.md** - Development session summary and statistics

### Database Documentation

All database tables, functions, and triggers have inline comments in the SQL schema files.

### Type Definitions

Complete TypeScript type definitions in:
- `/types/inventory.ts` - Inventory-related types
- `/types/index.ts` - Core application types

---

## Future Roadmap

### Phase 1: Enhanced Business Operations (Q1 2026)
- ✅ Inventory Management (Complete)
- Payment Processing Integration (Stripe/PayPal)
- Expense Tracking

### Phase 2: Advanced Analytics & Insights (Q2 2026)
- Business Intelligence Dashboard
- Revenue analytics and trends
- Sales forecasting
- Automated Reporting

### Phase 3: Collaboration & Team Features (Q3 2026)
- Multi-User Support with role-based access
- Client Portal
- Team performance metrics

### Phase 4: Industry-Specific Tools (Q4 2026)
- Time Tracking
- Project Management
- Recurring Invoices & Subscriptions

### Phase 5: Mobile & Integrations (2027)
- iOS and Android apps
- QuickBooks/Xero sync
- Third-party integrations (Zapier, Make.com)

---

## Building an Inventory Generator/Updater

### Understanding the System Architecture

The inventory system in Quotla is designed with a database-first approach, where business logic is handled at the database level through triggers and functions. This ensures data consistency and prevents bypassing critical operations.

### Key Components

#### 1. Database Layer
The foundation is built on 6 core tables:
- `suppliers` - Manages vendor information
- `inventory_items` - Stores product/service details
- `purchase_orders` & `purchase_order_items` - Handles procurement
- `stock_movements` - Audit trail for all inventory changes
- `low_stock_alerts` - Automated alert system

#### 2. Core Database Function
The central `update_inventory_quantity()` function handles all stock changes:

```sql
CREATE OR REPLACE FUNCTION update_inventory_quantity(
  p_inventory_item_id UUID,
  p_quantity_change INTEGER,
  p_movement_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
```

This function:
- Updates the inventory quantity
- Creates a stock movement record
- Triggers low stock alerts if needed
- Ensures data integrity

#### 3. Automated Triggers
Two main triggers automate stock deduction:
- `trigger_quote_inventory` - Fires when quote status changes to 'approved'
- `trigger_invoice_inventory` - Fires when invoice status changes to 'sent' or 'paid'

### Building Similar Features

To build an inventory generator/updater similar to the quote/invoice generator:

#### Step 1: Create the UI Component
Build a form component that:
- Allows selecting item type (product/service)
- Captures all required fields (name, SKU, price, etc.)
- Handles multi-currency selection
- Manages inventory tracking toggle
- Links to suppliers

```typescript
// Example structure
interface InventoryFormData {
  name: string
  item_type: 'product' | 'service'
  sku?: string
  description?: string
  category?: string
  unit_price: number
  cost_price: number
  currency: 'USD' | 'NGN' | 'EUR' | 'GBP'
  tax_rate: number
  track_inventory: boolean
  quantity_on_hand?: number
  low_stock_threshold?: number
  reorder_quantity?: number
  supplier_id?: string
  is_active: boolean
}
```

#### Step 2: Create API Routes
Build Next.js API routes to handle CRUD operations:

```typescript
// app/api/inventory/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const data = await request.json()

  // Insert inventory item
  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert(data)
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(item)
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { id, ...updates } = await request.json()

  // Update inventory item
  const { data: item, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(item)
}
```

#### Step 3: Implement Stock Updates
Use the `update_inventory_quantity` function for all stock changes:

```typescript
// Increase stock (e.g., receiving purchase order)
await supabase.rpc('update_inventory_quantity', {
  p_inventory_item_id: itemId,
  p_quantity_change: 100,  // positive for increase
  p_movement_type: 'purchase',
  p_reference_type: 'purchase_order',
  p_reference_id: poId,
  p_notes: 'Received from supplier'
})

// Decrease stock (e.g., manual adjustment)
await supabase.rpc('update_inventory_quantity', {
  p_inventory_item_id: itemId,
  p_quantity_change: -10,  // negative for decrease
  p_movement_type: 'adjustment',
  p_reference_type: 'manual',
  p_reference_id: null,
  p_notes: 'Damaged items removed'
})
```

#### Step 4: Add AI-Powered Generation (Optional)
To make it similar to the quote/invoice generator, add AI capabilities:

```typescript
// Extract inventory details from natural language
const prompt = `Extract product details from: "${userInput}"`

const response = await fetch('/api/ai/extract-inventory', {
  method: 'POST',
  body: JSON.stringify({ prompt })
})

const inventoryData = await response.json()
// Pre-fill form with AI-extracted data
```

#### Step 5: Implement Validation
Add validation for:
- Required fields (name, prices, currency)
- Stock quantity constraints (can't go negative)
- Currency matching in transactions
- Supplier existence
- SKU uniqueness

```typescript
const validateInventoryItem = (data: InventoryFormData) => {
  const errors: string[] = []

  if (!data.name) errors.push('Name is required')
  if (data.unit_price <= 0) errors.push('Unit price must be positive')
  if (data.track_inventory && data.quantity_on_hand === undefined) {
    errors.push('Stock quantity required when tracking is enabled')
  }

  return errors
}
```

#### Step 6: Create Dashboard Views
Build views to display:
- Total inventory value
- Low stock items
- Out of stock items
- Recent stock movements
- Best selling items

```typescript
// Example: Get low stock items
const { data: lowStockItems } = await supabase
  .from('inventory_items')
  .select('*, suppliers(*)')
  .eq('track_inventory', true)
  .filter('quantity_on_hand', 'lte', 'low_stock_threshold')
  .order('quantity_on_hand', { ascending: true })
```

### Best Practices

1. **Always use the database function** - Never update inventory_items.quantity_on_hand directly
2. **Create audit trails** - Every stock change should create a stock_movement record
3. **Implement proper RLS** - Ensure users can only access their own data
4. **Add proper indexes** - Index foreign keys and frequently queried fields
5. **Use transactions** - For operations that modify multiple tables
6. **Validate stock availability** - Before creating quotes/invoices
7. **Handle currency carefully** - Warn users about currency mismatches
8. **Provide clear feedback** - Show stock status, alerts, and warnings

### Integration Points

The inventory system integrates with:
- **Quotes** - Automatic stock deduction on approval
- **Invoices** - Automatic stock deduction on sent/paid
- **Purchase Orders** - Stock increases when received
- **Alerts** - Low stock notifications
- **Reports** - Inventory valuation, turnover, etc.

By following this architecture, you can build reliable inventory management features that maintain data integrity and provide a seamless user experience.

---

## Support

### Documentation
For detailed guides, see the `/documentation` folder:
- Complete feature documentation
- Integration examples
- Troubleshooting guides
- API documentation

### Common Issues

**Stock not decreasing:**
- Check that `inventory_item_id` is saved in quote_items/invoice_items
- Verify triggers are enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE '%inventory%'`
- Check quote/invoice status matches trigger conditions

**Trigger errors:**
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'update_inventory_quantity'`
- Review logs in Supabase dashboard
- Ensure RLS policies allow the operation

**Stock warnings not showing:**
- Verify low_stock_threshold is set on inventory items
- Check that track_inventory is TRUE
- Ensure low stock alert trigger is enabled

### Getting Help

1. Check the documentation files
2. Review inline code comments
3. Inspect database schema comments in Supabase
4. Review TypeScript types for data structures

---

## Competitive Advantages

1. **AI-First Approach** - Natural language document generation sets us apart from traditional accounting software
2. **All-in-One Platform** - From quotes to inventory to payments—everything in one place
3. **User Experience** - Conversational interface removes friction from business operations
4. **Scalability** - Grow from freelancer to enterprise without changing platforms
5. **Modern Technology** - Built on latest tech stack ensures speed and reliability
6. **QuickBooks-Level Features** - Enterprise-grade inventory management at small business pricing

---

## Target Users

### Primary
- Freelancers and solopreneurs
- Small business owners (1-10 employees)
- Service providers (consultants, agencies)
- E-commerce businesses
- Retail businesses with inventory needs

### Secondary (Future)
- Growing businesses (11-50 employees)
- Subscription-based businesses
- Multi-location businesses

---

## Success Metrics

### Current KPIs
- User signup rate
- Document generation success rate
- AI usage vs manual creation ratio
- User retention rate
- Export completion rate
- Average products per user
- Inventory turnover rate

---

## Version History

**Version 1.0.0** - January 1, 2026
- Initial release with complete inventory management
- Quote and invoice generation
- AI-powered document creation
- Multi-currency support
- Supplier management
- Low stock alerts
- Complete audit trail

---

## License

Copyright © 2026 Mission To Scale. All rights reserved.

---

## Acknowledgments

- Built with Next.js, React, and Supabase
- AI powered by OpenAI, Anthropic, and Google
- UI components from Headless UI
- Icons from Lucide React

---

**Ready to transform your business?** Start using Quotla today! 🚀

For more information, visit our documentation or contact support.
