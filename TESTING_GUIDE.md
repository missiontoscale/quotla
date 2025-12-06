# Testing Guide - AI Vision & Invoice Generation

## Quick Start

```bash
# Start the development server
npm run dev

# Server will run at http://localhost:3000
```

---

## Test 1: Invoice Generation (Text-based)

### Using the API directly

```bash
curl -X POST http://localhost:3000/api/ai/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Invoice for John Doe at 123 Main Street, Lagos. 100 units of HWY Granola at 5000 NGN each, 50 units of Coffee at 8000 NGN each"
  }'
```

**Expected Response:**
```json
{
  "invoice": "--- Invoice ---\nInvoice Number: #INV123456\n...",
  "invoiceData": {
    "invoiceNumber": "#INV123456",
    "billTo": {
      "name": "John Doe",
      "address": "123 Main Street",
      "city": "Lagos",
      "country": "Nigeria"
    },
    "items": [
      {
        "description": "HWY Granola",
        "quantity": 100,
        "unitPrice": 5000,
        "subtotal": 500000
      },
      {
        "description": "Coffee",
        "quantity": 50,
        "unitPrice": 8000,
        "subtotal": 400000
      }
    ],
    "currency": "NGN",
    "subtotal": 900000,
    "tax": 67500,
    "delivery": 27000,
    "total": 994500
  },
  "success": true
}
```

---

## Test 2: Quote Generation

```bash
curl -X POST http://localhost:3000/api/ai/generate-quote \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Quote for Tech Corp in Abuja. 200 consulting hours at 15000 NGN per hour"
  }'
```

**Expected Response:**
```json
{
  "quote": "--- Quote ---\nClient: Tech Corp\n...",
  "quoteData": {
    "client_name": "Tech Corp",
    "currency": "NGN",
    "items": [
      {
        "description": "Consulting Hours",
        "quantity": 200,
        "unit_price": 15000,
        "amount": 3000000
      }
    ],
    "subtotal": 3000000,
    "tax_rate": 0.075,
    "tax_amount": 225000,
    "total": 3225000
  },
  "success": true
}
```

---

## Test 3: Image Upload - Vision Extraction

### Prepare a test image

Create a sample invoice image or use any invoice/receipt image you have.

### Test using curl

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -F "file=@/path/to/invoice.jpg" \
  -F "prompt=Extract invoice data from this image"
```

**Expected Response (Complete Data):**
```json
{
  "description": "✅ Extracted invoice data (95% confidence)\n\n**Client:** John Doe\n**Currency:** NGN\n\n**Items:**\n1. Product X (x100) @ 5000 = 500000\n\n**Total:** NGN 552500\n\n✅ All required information extracted! Ready to create document.",
  "extractedData": {
    "client": {
      "name": "John Doe",
      "address": "123 Main St, Lagos"
    },
    "items": [
      {
        "description": "Product X",
        "quantity": 100,
        "unitPrice": 5000,
        "amount": 500000
      }
    ],
    "currency": "NGN",
    "subtotal": 500000,
    "taxRate": 0.075,
    "taxAmount": 37500,
    "deliveryCharge": 15000,
    "total": 552500
  },
  "documentType": "invoice",
  "canAutoCreate": true,
  "missingFields": [],
  "shouldCreateDocument": true
}
```

**Expected Response (Missing Data):**
```json
{
  "description": "✅ Extracted invoice data (80% confidence)\n\n**Items:**\n1. Product X (x100)\n\n⚠️ **Missing information:** client.name, currency\n\nI've extracted most of the invoice information, but I need a few more details:\n\n• the client's name or company name\n• the currency (e.g., USD, NGN, EUR, GBP)\n\nPlease provide these details so I can create the invoice.",
  "extractedData": {
    "items": [...]
  },
  "documentType": "invoice",
  "canAutoCreate": false,
  "missingFields": ["client.name", "currency"],
  "requiresFollowUp": true,
  "shouldCreateDocument": false
}
```

---

## Test 4: Using the Chat Interface (UI)

### Option A: Via Dashboard

1. Go to `http://localhost:3000/dashboard`
2. Use the chat interface at the bottom
3. Try these prompts:
   - "Create an invoice for John Doe in Lagos for 100 units at 5000 NGN each"
   - "Generate a quote for Tech Corp, 50 consulting hours at 15000 NGN per hour"

### Option B: Via Create Page

1. Go to `http://localhost:3000/create`
2. Use the voice/text interface
3. Upload an invoice image using the file upload button (if implemented in UI)

---

## Test 5: Currency Detection

Test that the AI properly detects different currencies:

```bash
# Test NGN
curl -X POST http://localhost:3000/api/ai/invoice \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Invoice for client in Lagos, 100 units at 5000 NGN each"}'

# Test USD
curl -X POST http://localhost:3000/api/ai/invoice \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Invoice for US client, 10 items at $50 each"}'

# Test EUR
curl -X POST http://localhost:3000/api/ai/invoice \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Invoice for Berlin client, 20 units at 100 EUR each"}'
```

Each should return the correct currency in the response.

---

## Test 6: Validation Logic

### Test Missing Client Name

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -F "file=@invoice_without_name.jpg" \
  -F "prompt=Extract data"
```

**Expected**: Response should include `"missingFields": ["client.name"]` and `"requiresFollowUp": true`

### Test Complete Document

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -F "file=@complete_invoice.jpg" \
  -F "prompt=Extract all data"
```

**Expected**: Response should include `"canAutoCreate": true` and `"shouldCreateDocument": true`

---

## Debugging

### Check Vision API is Working

```bash
# Check OpenAI API key is set
echo $OPENAI_API_KEY

# Or on Windows
echo %OPENAI_API_KEY%
```

### Check Server Logs

When you upload an image, you should see:
```
[OpenAI vision extraction] Processing image...
[Vision Result] Success: true, Confidence: 0.95
[Validation] Missing fields: []
```

If you see errors:
```
OpenAI vision extraction error: ...
```

Check:
1. API key is valid
2. Image file is under 20MB
3. Image is a valid format (JPEG, PNG)

---

## Expected Behavior

### ✅ What Should Work

1. **Text-based generation**: Invoice/quote from natural language
2. **Currency detection**: Automatically detects NGN, USD, EUR, GBP
3. **Image upload**: Extracts data from invoice/receipt images
4. **Validation**: Identifies missing required fields
5. **Calculations**: Auto-calculates tax (7.5%), delivery (3%), totals
6. **Follow-up**: Asks for missing information naturally

### ❌ What Won't Work Yet

1. **File upload UI**: Need to add button to chat interface (Phase 2)
2. **Follow-up conversation**: Need to implement multi-turn dialogue (Phase 2)
3. **Form pre-fill**: Need to connect extracted data to forms (Phase 2)
4. **Templates**: Need to implement template system (Phase 3)

---

## Comparison: Before vs After

### Before (Broken)
```bash
# Request
curl -X POST http://localhost:3000/api/ai/invoice \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Invoice for John at Lagos, 100 units of Product X at 5000 NGN"}'

# Response (using regex - often failed)
{
  "invoiceData": {
    "billTo": { "name": "Customer Name" },  # Failed to extract
    "items": [{
      "description": "Product/Service",  # Failed to extract
      "quantity": 1,  # Wrong
      "unitPrice": 0  # Wrong
    }]
  }
}
```

### After (Working)
```bash
# Same request

# Response (using AI - works correctly)
{
  "invoiceData": {
    "billTo": { "name": "John" },  # ✅ Extracted
    "items": [{
      "description": "Product X",  # ✅ Extracted
      "quantity": 100,  # ✅ Correct
      "unitPrice": 5000  # ✅ Correct
    }],
    "currency": "NGN",  # ✅ Detected
    "total": 552500  # ✅ Calculated correctly
  }
}
```

---

## Performance Expectations

- **Text generation**: 1-2 seconds
- **Vision extraction**: 2-4 seconds
- **Validation**: < 100ms
- **Total (with image)**: 2-5 seconds

---

## Troubleshooting

### Issue: "OpenAI API key not found"

**Solution**: Set the environment variable
```bash
# Linux/Mac
export OPENAI_API_KEY=sk-...

# Windows CMD
set OPENAI_API_KEY=sk-...

# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."

# Or add to .env.local
OPENAI_API_KEY=sk-...
```

### Issue: "Failed to extract data from image"

**Possible causes**:
1. Image is too blurry
2. Image is not a business document
3. API rate limit exceeded
4. Invalid API key

**Solution**: Check server logs for specific error

### Issue: Build errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## Success Indicators

When testing is successful, you should see:

✅ Invoice generation returns structured data with all fields
✅ Currency is correctly detected from prompt
✅ Image upload returns vision extraction results
✅ Missing fields are identified and listed
✅ Calculations (tax, delivery, total) are correct
✅ No TypeScript errors in build
✅ API responds in 2-5 seconds

---

*Last Updated: 2025-12-05*
