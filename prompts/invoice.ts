/**
 * Invoice generation prompts
 * Used for creating professional invoices
 */

export const INVOICE_GENERATION_SYSTEM_PROMPT = `You are an invoice generation assistant. Generate a complete invoice in JSON format based on the user's description. Always include at least one line item with realistic pricing.`

/**
 * Generates the user prompt for invoice creation
 * @param description - The invoice description from the user
 * @param currency - The currency code (e.g., USD, EUR, NGN, GBP)
 */
export const getInvoiceGenerationPrompt = (description: string, currency: string) => `Create a detailed invoice for: ${description}

Currency: ${currency}

Return JSON with this structure:
{
  "client_name": "extracted or generic name",
  "currency": "${currency}",
  "items": [
    {
      "description": "item or service description",
      "quantity": number,
      "unit_price": number,
      "amount": number (quantity * unit_price)
    }
  ],
  "subtotal": number (sum of all item amounts),
  "tax_rate": number (0.1 for 10%),
  "tax_amount": number (subtotal * tax_rate),
  "total": number (subtotal + tax_amount),
  "notes": "optional payment terms or notes",
  "due_date": "YYYY-MM-DD (typically 30 days from today)",
  "invoice_number": "generate a realistic invoice number like INV-2024-001"
}`

/**
 * Model configuration for invoice generation
 */
export const INVOICE_GENERATION_CONFIG = {
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for more consistent, structured output
}

/**
 * Payment terms templates
 */
export const PAYMENT_TERMS_TEMPLATES = {
  net30: 'Payment due within 30 days of invoice date.',
  net15: 'Payment due within 15 days of invoice date.',
  due_on_receipt: 'Payment due upon receipt.',
  net60: 'Payment due within 60 days of invoice date.',
}
