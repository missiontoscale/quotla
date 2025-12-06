/**
 * Quote generation prompts
 * Used for creating professional business quotes
 */

export const QUOTE_GENERATION_SYSTEM_PROMPT = `You are a quote generation assistant. Generate a complete quote in JSON format. Always include at least one item with realistic pricing.`

/**
 * Generates the user prompt for quote creation
 * @param description - The quote description from the user
 * @param currency - The currency code (e.g., USD, EUR, NGN, GBP)
 */
export const getQuoteGenerationPrompt = (description: string, currency: string) => `Create a detailed quote for: ${description}

Currency: ${currency}

Return JSON with this structure:
{
  "client_name": "extracted or generic name",
  "currency": "${currency}",
  "items": [
    {
      "description": "item description",
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
  "valid_until": "YYYY-MM-DD (30 days from now)"
}`

/**
 * Model configuration for quote generation
 */
export const QUOTE_GENERATION_CONFIG = {
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for more consistent, structured output
}
