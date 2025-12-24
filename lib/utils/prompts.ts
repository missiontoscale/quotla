/**
 * Utility functions for loading AI prompts from text files
 * All prompts are stored in prompts/txt/ as .txt files for easy editing
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const PROMPTS_DIR = join(process.cwd(), 'prompts', 'txt')

/**
 * Load a prompt from a text file
 * @param filename - The name of the prompt file (without .txt extension)
 * @returns The prompt content as a string
 */
function loadPrompt(filename: string): string {
  const filePath = join(PROMPTS_DIR, `${filename}.txt`)
  return readFileSync(filePath, 'utf-8').trim()
}

/**
 * Replace template variables in a prompt
 * @param prompt - The prompt template with {{variables}}
 * @param variables - Object with variable replacements
 * @returns The prompt with variables replaced
 */
function replaceVariables(prompt: string, variables: Record<string, string>): string {
  let result = prompt
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

// ============================================================================
// CHAT PROMPTS
// ============================================================================

export const CHAT_SYSTEM_PROMPT = loadPrompt('chat-system')
export const CHAT_BUSINESS_ADVISOR_PROMPT = loadPrompt('chat-business-advisor')
export const CHAT_PRICING_EXPERT_PROMPT = loadPrompt('chat-pricing-expert')

// ============================================================================
// QUOTE PROMPTS
// ============================================================================

export const QUOTE_GENERATION_SYSTEM_PROMPT = loadPrompt('quote-generation-system')

export function getQuoteGenerationPrompt(description: string, currency: string): string {
  const template = loadPrompt('quote-generation-user')
  return replaceVariables(template, { description, currency })
}

export const QUOTE_GENERATION_CONFIG = {
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for more consistent, structured output
}

// ============================================================================
// INVOICE PROMPTS
// ============================================================================

export const INVOICE_GENERATION_SYSTEM_PROMPT = loadPrompt('invoice-generation-system')

export function getInvoiceGenerationPrompt(description: string, currency: string): string {
  const template = loadPrompt('invoice-generation-user')
  return replaceVariables(template, { description, currency })
}

export const INVOICE_GENERATION_CONFIG = {
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for more consistent, structured output
}

export const PAYMENT_TERMS_TEMPLATES = {
  net30: 'Payment due within 30 days of invoice date.',
  net15: 'Payment due within 15 days of invoice date.',
  due_on_receipt: 'Payment due upon receipt.',
  net60: 'Payment due within 60 days of invoice date.',
}

// ============================================================================
// VISION PROMPTS
// ============================================================================

export const VISION_EXTRACTION_PROMPT = loadPrompt('vision-extraction')

export const VISION_CONFIG = {
  model: 'gpt-4o',
  maxTokens: 2000,
  temperature: 0.1, // Low temperature for deterministic extraction
  detail: 'high' as const // High detail for business documents
}
