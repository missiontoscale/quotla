# Currency Conversion System

## Overview

Quotla now includes a comprehensive currency conversion system that automatically converts prices between different currencies using real-time exchange rates.

## Key Features

1. **Real Currency Conversion** - Uses actual exchange rates from exchangerate-api.com
2. **Automatic Conversion** - Prices are automatically converted when currencies don't match
3. **Visual Indicators** - Shows conversion badges and original prices
4. **Caching** - Exchange rates are cached for 30 minutes to reduce API calls
5. **Fallback Handling** - Gracefully handles API failures with cached rates

## Components Updated

### 1. InventoryItemSelector
**File**: `components/InventoryItemSelector.tsx`

**What Changed**:
- Automatically converts inventory item prices to match invoice/quote currency
- Shows conversion indicator (🔄) when prices are converted
- Displays original price (strikethrough) when converted
- Passes converted prices to parent component

**Example**:
```tsx
// If invoice is in USD but inventory item is in NGN:
// Original: NGN 50,000.00
// Converted: $125.00 (with exchange rate 1 NGN = 0.0025 USD)
```

### 2. ProfitabilityDashboard
**File**: `components/ProfitabilityDashboard.tsx`

**What Changed**:
- Now uses user's preferred currency instead of hardcoded USD
- All revenue, costs, and profit displays respect user preference
- Automatically detects currency from localStorage

## New Utilities

### Hook: useCurrencyConversion
**File**: `hooks/useCurrencyConversion.ts`

**Purpose**: React hook for converting currency amounts with loading states

**Usage**:
```tsx
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'

function PriceDisplay({ amount, from, to }) {
  const { convertedAmount, isConverting, error, isConverted } =
    useCurrencyConversion(amount, from, to)

  if (isConverting) return <span>Loading...</span>
  if (error) return <span>Error: {error}</span>

  return (
    <span>
      {convertedAmount} {to}
      {isConverted && <span>🔄</span>}
    </span>
  )
}
```

### Hook: useBatchCurrencyConversion
**File**: `hooks/useCurrencyConversion.ts`

**Purpose**: Convert multiple amounts at once efficiently

**Usage**:
```tsx
const conversions = [
  { key: 'item1', amount: 100, from: 'USD', to: 'EUR' },
  { key: 'item2', amount: 200, from: 'GBP', to: 'EUR' },
]

const results = useBatchCurrencyConversion(conversions)
// results = { item1: 85.5, item2: 235.2 }
```

### Component: CurrencyDisplay
**File**: `components/CurrencyDisplay.tsx`

**Purpose**: Display component with automatic conversion

**Usage**:
```tsx
import CurrencyDisplay from '@/components/CurrencyDisplay'

// Simple display
<CurrencyDisplay
  amount={100}
  currency="USD"
/>

// With conversion
<CurrencyDisplay
  amount={50000}
  originalCurrency="NGN"
  currency="USD"
  showConversionBadge={true}
  showOriginalPrice={true}
/>
// Displays: $125.00 🔄 ₦50,000.00
```

## Existing Currency Utilities

### formatCurrency
**File**: `lib/utils/currency.ts`

**Purpose**: Format amount with proper currency symbol and locale

```tsx
import { formatCurrency } from '@/lib/utils/currency'

formatCurrency(1234.56, 'USD')  // "$1,234.56"
formatCurrency(1234.56, 'EUR')  // "€1,234.56"
formatCurrency(1234.56, 'NGN')  // "₦1,234.56"
```

### convertCurrency
**File**: `lib/utils/currency.ts`

**Purpose**: Convert amount between currencies with caching

```tsx
import { convertCurrency } from '@/lib/utils/currency'

const usdAmount = await convertCurrency(50000, 'NGN', 'USD')
// Returns: 125 (approximately, based on current exchange rate)
```

### getUserCurrency / setUserCurrency
**File**: `lib/utils/currency.ts`

**Purpose**: Manage user's preferred currency

```tsx
import { getUserCurrency, setUserCurrency } from '@/lib/utils/currency'

// Get current preference
const currency = getUserCurrency() // "USD"

// Set new preference
setUserCurrency('EUR')

// Triggers a 'currencyChanged' event that components can listen to
```

## API Endpoints

### POST /api/currency/convert
**Purpose**: Convert a specific amount between currencies

**Request**:
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

**Response**:
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "convertedAmount": 85.5,
  "rate": 0.855,
  "timestamp": "2026-01-13T10:30:00Z"
}
```

### GET /api/currency/convert?base=USD
**Purpose**: Get all exchange rates for a base currency

**Response**:
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.855,
    "GBP": 0.735,
    "NGN": 400.5,
    ...
  },
  "timestamp": "2026-01-13T10:30:00Z"
}
```

## Supported Currencies

The system supports 20 major currencies:

| Code | Name | Symbol |
|------|------|--------|
| NGN | Nigerian Naira | ₦ |
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| CAD | Canadian Dollar | CA$ |
| AUD | Australian Dollar | A$ |
| JPY | Japanese Yen | ¥ |
| CNY | Chinese Yuan | ¥ |
| INR | Indian Rupee | ₹ |
| ZAR | South African Rand | R |
| CHF | Swiss Franc | Fr |
| SGD | Singapore Dollar | S$ |
| NZD | New Zealand Dollar | NZ$ |
| SEK | Swedish Krona | kr |
| NOK | Norwegian Krone | kr |
| DKK | Danish Krone | kr |
| MXN | Mexican Peso | $ |
| BRL | Brazilian Real | R$ |
| KES | Kenyan Shilling | KSh |
| GHS | Ghanaian Cedi | GH₵ |

## How It Works

### 1. Exchange Rate Fetching
- Uses exchangerate-api.com free tier (1,500 requests/month)
- Rates are fetched on-demand when conversion is needed
- Cached for 30 minutes to reduce API calls
- Falls back to expired cache if API fails

### 2. Conversion Flow
```
User adds inventory item (NGN) to invoice (USD)
    ↓
System detects currency mismatch
    ↓
Check cache for NGN→USD rate
    ↓
If not cached or expired, fetch from API
    ↓
Apply exchange rate: NGN 50,000 × 0.0025 = USD 125
    ↓
Display converted price with indicator
    ↓
Store converted price in invoice
```

### 3. Visual Feedback
- **Green conversion badge** (🔄 NGN → USD) shows active conversion
- **Strikethrough original price** shows what it was before conversion
- **No badge** means no conversion was needed (same currency)

## Best Practices

### For Developers

1. **Always use formatCurrency** for displaying amounts:
   ```tsx
   // ✅ Good
   {formatCurrency(amount, currency)}

   // ❌ Bad
   {currency} {amount.toFixed(2)}
   ```

2. **Use hooks for reactive conversion**:
   ```tsx
   // ✅ Good - automatic updates
   const { convertedAmount } = useCurrencyConversion(amount, from, to)

   // ❌ Bad - manual Promise handling
   const [amount, setAmount] = useState(0)
   convertCurrency(amount, from, to).then(setAmount)
   ```

3. **Show conversion indicators when relevant**:
   ```tsx
   {isConverted && (
     <span className="text-green-400" title={`Converted from ${originalCurrency}`}>
       🔄 {originalCurrency} → {targetCurrency}
     </span>
   )}
   ```

### For Users

1. **Set your preferred currency** in settings to see all prices in your local currency
2. **Mixed currency invoices** will automatically convert to invoice currency
3. **Conversion rates update** every 30 minutes for accuracy
4. **Original prices are preserved** in the database for auditing

## Limitations

1. **API Rate Limits**: 1,500 conversions per month (resets monthly)
2. **Cache Duration**: Rates cached for 30 minutes, may be slightly outdated
3. **Offline Mode**: Falls back to last cached rate, may be stale
4. **Historical Rates**: Not supported, always uses current rates

## Future Enhancements

- [ ] Add support for more currencies
- [ ] Implement currency preference per invoice/quote
- [ ] Add historical exchange rate tracking
- [ ] Premium API key for unlimited conversions
- [ ] Manual exchange rate override option
- [ ] Multi-currency reporting and analytics

## Troubleshooting

### Conversion not working?
1. Check browser console for API errors
2. Verify internet connection (API requires network access)
3. Check if rate limit has been reached
4. Clear cache: `clearExchangeRatesCache()`

### Stale exchange rates?
- Rates update every 30 minutes automatically
- Force refresh by clearing cache or waiting for expiry

### Wrong conversion amount?
- Verify the source and target currencies are correct
- Check if item currency matches expected currency
- Review exchange rate in console logs

## Support

For issues or questions about currency conversion:
1. Check the browser console for detailed error messages
2. Verify API key is valid (if using paid tier)
3. Report issues at: https://github.com/anthropics/claude-code/issues
