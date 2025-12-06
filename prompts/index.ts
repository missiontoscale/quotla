/**
 * Central export file for all AI prompts
 * Import prompts from here throughout the application
 */

// Chat prompts
export {
  CHAT_SYSTEM_PROMPT,
  CHAT_BUSINESS_ADVISOR_PROMPT,
  CHAT_PRICING_EXPERT_PROMPT,
} from './chat'

// Quote prompts
export {
  QUOTE_GENERATION_SYSTEM_PROMPT,
  getQuoteGenerationPrompt,
  QUOTE_GENERATION_CONFIG,
} from './quote'

// Invoice prompts
export {
  INVOICE_GENERATION_SYSTEM_PROMPT,
  getInvoiceGenerationPrompt,
  INVOICE_GENERATION_CONFIG,
  PAYMENT_TERMS_TEMPLATES,
} from './invoice'

// Vision prompts
export {
  VISION_EXTRACTION_PROMPT,
  VISION_CONFIG,
} from './vision'
