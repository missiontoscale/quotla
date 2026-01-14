# Invoice Number Generation

## Overview
Quotla automatically generates sequential invoice numbers for each user. Invoice numbers follow a consistent, professional format that makes them easy to track and organize.

## Format

### Invoice Numbers
- **Format**: `INV-YYYY-NNNN`
- **Example**: `INV-2024-0001`, `INV-2024-0002`, etc.

### Quote Numbers
- **Format**: `QUO-YYYY-NNNN`
- **Example**: `QUO-2024-0001`, `QUO-2024-0002`, etc.

## How It Works

### Sequential Generation
1. When creating a new invoice, the system queries the database for the latest invoice number for that user in the current year
2. It extracts the sequence number and increments it by 1
3. The sequence number is padded with leading zeros to 4 digits
4. A new invoice number is generated: `INV-{currentYear}-{paddedSequence}`

### Year Reset
- Sequence numbers restart at 0001 at the beginning of each calendar year
- Example:
  - Last invoice of 2023: `INV-2023-0156`
  - First invoice of 2024: `INV-2024-0001`

### Per-User Sequences
- Each user has their own independent sequence
- User A's invoices: `INV-2024-0001`, `INV-2024-0002`, ...
- User B's invoices: `INV-2024-0001`, `INV-2024-0002`, ...

## Implementation

### Usage in Components

```typescript
import { generateInvoiceNumber, generateQuoteNumber } from '@/lib/utils/invoice-generator'

// Generate invoice number
const invoiceNumber = await generateInvoiceNumber(userId)
// Returns: "INV-2024-0001"

// Generate quote number
const quoteNumber = await generateQuoteNumber(userId)
// Returns: "QUO-2024-0001"
```

### Validation

```typescript
import { isValidInvoiceNumber, isValidQuoteNumber } from '@/lib/utils/invoice-generator'

// Validate invoice number
const valid = isValidInvoiceNumber('INV-2024-0001')
// Returns: true

const invalid = isValidInvoiceNumber('INVALID-123')
// Returns: false
```

### Parsing

```typescript
import { parseInvoiceNumber } from '@/lib/utils/invoice-generator'

const parsed = parseInvoiceNumber('INV-2024-0123')
// Returns: { year: 2024, sequence: 123, isTimestamp: false }
```

## Fallback Mechanism

If the generation fails for any reason (database error, etc.), the system falls back to a timestamp-based format:
- **Format**: `INV-{timestamp}`
- **Example**: `INV-1704063600000`

This ensures that invoice creation never fails due to numbering issues.

## Benefits

### Professional Appearance
- Clean, consistent format
- Easy to read and reference
- Looks professional on printed invoices

### Easy Tracking
- Sequential numbers make it easy to track invoice count
- Year prefix helps with annual reporting
- Predictable ordering

### Scalability
- Supports up to 9,999 invoices per year per user
- Can be extended to 5 or 6 digits if needed
- Independent sequences prevent conflicts

## Database Schema

No additional database tables are required. The system uses the existing `invoices` and `quotes` tables:

```sql
-- Invoices table already has:
-- - invoice_number (TEXT)
-- - user_id (UUID)
-- - created_at (TIMESTAMP)

-- We query with:
SELECT invoice_number
FROM invoices
WHERE user_id = $1
  AND invoice_number LIKE 'INV-2024-%'
ORDER BY created_at DESC
LIMIT 1
```

## Future Enhancements

- [ ] Custom prefixes per user (e.g., "ACME-2024-0001")
- [ ] Custom number of digits (e.g., 5 or 6 digits)
- [ ] Suffix options (e.g., "INV-2024-0001-A" for revisions)
- [ ] API endpoint to preview next invoice number
- [ ] Bulk number reservation for offline use
- [ ] Gap detection and reporting

## Migration

Existing invoices with timestamp-based numbers (`INV-{timestamp}`) will continue to work. The validation functions accept both formats:
- Sequential: `INV-2024-0001`
- Timestamp: `INV-1704063600000`

New invoices will use the sequential format.

## Testing

To test invoice number generation:

1. Create a new invoice
2. Verify the number follows `INV-YYYY-NNNN` format
3. Create another invoice
4. Verify the sequence increments by 1
5. Check that the year matches the current year

Example test sequence:
```
First invoice: INV-2024-0001
Second invoice: INV-2024-0002
Third invoice: INV-2024-0003
```
