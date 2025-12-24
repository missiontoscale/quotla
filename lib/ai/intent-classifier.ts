import OpenAI from 'openai'

let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openai = new OpenAI({
      apiKey,
    })
  }
  return openai
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  generatedQuote?: any
  generatedInvoice?: any
}

export type Intent =
  | 'generate_quote'
  | 'save_quote'
  | 'generate_invoice'
  | 'save_invoice'
  | 'general'

export interface IntentClassification {
  intent: Intent
  confidence: number
  reasoning: string
  suggestedAction?: string
}

const INTENT_CLASSIFICATION_PROMPT = `You are an intent classifier for Quotla, a business assistant that helps with quotes and invoices.

Analyze the conversation history and the user's latest message to determine their intent.

## Available Intents:

1. **generate_quote** - User wants to create a new quote or modify an existing generated quote
   - Examples: "create a quote", "I need a quote for web dev", "change the currency to NGN"
   - Also use if they're asking for modifications to a generated quote (currency, items, pricing)

2. **save_quote** - User confirms they want to save a previously generated quote
   - Examples: "yes, save it", "looks good", "create this quote", "do it"
   - Only valid if there's a generated quote in the conversation

3. **generate_invoice** - User wants to create a new invoice or modify an existing generated invoice
   - Examples: "create an invoice", "I need to bill someone", "change the payment terms"
   - Also use if they're asking for modifications to a generated invoice

4. **save_invoice** - User confirms they want to save a previously generated invoice
   - Examples: "yes, create it", "perfect, save this", "looks great"
   - Only valid if there's a generated invoice in the conversation

5. **general** - General business advice, questions, or conversation
   - Examples: "what are the new tax laws?", "how should I price my services?", "hello"
   - Use when intent doesn't fit the above categories

## Important Rules:

- **Context matters**: Look at the ENTIRE conversation, not just keywords
- **Last generated item**: If the last assistant message has a generatedQuote or generatedInvoice, pay attention to whether the user is confirming (save) or requesting changes (regenerate)
- **Modification vs Confirmation**:
  - "Yes but change to NGN" = regenerate (generate_quote/generate_invoice)
  - "Yes, looks good" = save (save_quote/save_invoice)
- **Ambiguous phrases**: "create it", "do it", "yes" - these depend on context:
  - If quote/invoice was just shown → save intent
  - If no quote/invoice shown yet → generate intent
  - If modifying existing → regenerate intent

Respond with a JSON object:
{
  "intent": "generate_quote" | "save_quote" | "generate_invoice" | "save_invoice" | "general",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of why this intent was chosen",
  "suggestedAction": "Optional: What the system should do next"
}`

/**
 * Uses AI to intelligently classify user intent based on full conversation context
 */
export async function classifyIntent(
  messages: Message[],
  currentMessage: string
): Promise<IntentClassification> {
  try {
    // Build context from conversation history
    const conversationContext = messages.map((msg, idx) => {
      let context = `${msg.role}: ${msg.content}`

      // Add metadata about generated items
      if (msg.generatedQuote) {
        context += ` [Assistant generated a quote for ${msg.generatedQuote.client_name}]`
      }
      if (msg.generatedInvoice) {
        context += ` [Assistant generated an invoice for ${msg.generatedInvoice.client_name}]`
      }

      return context
    }).join('\n')

    // Get last assistant message to check for generated items
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()
    const hasGeneratedQuote = !!lastAssistantMsg?.generatedQuote
    const hasGeneratedInvoice = !!lastAssistantMsg?.generatedInvoice

    const analysisPrompt = `## Conversation History:
${conversationContext}

## User's Latest Message:
${currentMessage}

## Context Flags:
- Last message has generated quote: ${hasGeneratedQuote}
- Last message has generated invoice: ${hasGeneratedInvoice}

Classify the user's intent and respond with JSON.`

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: INTENT_CLASSIFICATION_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3, // Low temperature for consistent classification
      response_format: { type: 'json_object' },
      max_tokens: 300,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No classification generated')
    }

    const classification = JSON.parse(content) as IntentClassification

    // Validate the classification
    if (!classification.intent || !['generate_quote', 'save_quote', 'generate_invoice', 'save_invoice', 'general'].includes(classification.intent)) {
      console.warn('Invalid intent from AI:', classification.intent, '- defaulting to general')
      return {
        intent: 'general',
        confidence: 0.5,
        reasoning: 'AI returned invalid intent, defaulting to general',
      }
    }

    // Validate save intents - they require a generated item
    if (classification.intent === 'save_quote' && !hasGeneratedQuote) {
      console.warn('AI suggested save_quote but no quote exists - switching to generate_quote')
      classification.intent = 'generate_quote'
      classification.reasoning = 'User wants a quote but none exists yet'
    }

    if (classification.intent === 'save_invoice' && !hasGeneratedInvoice) {
      console.warn('AI suggested save_invoice but no invoice exists - switching to generate_invoice')
      classification.intent = 'generate_invoice'
      classification.reasoning = 'User wants an invoice but none exists yet'
    }

    return classification

  } catch (error) {
    console.error('Intent classification error:', error)

    // Fallback to simple heuristics if AI fails
    const lowerMsg = currentMessage.toLowerCase()

    if (lowerMsg.includes('invoice')) {
      return {
        intent: 'generate_invoice',
        confidence: 0.6,
        reasoning: 'AI classification failed, using keyword fallback'
      }
    }

    if (lowerMsg.includes('quote')) {
      return {
        intent: 'generate_quote',
        confidence: 0.6,
        reasoning: 'AI classification failed, using keyword fallback'
      }
    }

    return {
      intent: 'general',
      confidence: 0.5,
      reasoning: 'AI classification failed, defaulting to general'
    }
  }
}

/**
 * Faster version that uses local heuristics but with better context awareness
 * Use this as a fallback or for cost optimization
 */
export function classifyIntentFast(
  messages: Message[],
  currentMessage: string
): Intent {
  const lowerMsg = currentMessage.toLowerCase()
  const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()

  // PRIORITY 1: If there's a generated quote, check if user is confirming or modifying
  if (lastAssistantMsg?.generatedQuote) {
    // Look for modification keywords
    const isModifying = (
      lowerMsg.includes('but') ||
      lowerMsg.includes('instead') ||
      lowerMsg.includes('different') ||
      lowerMsg.includes('change') ||
      lowerMsg.includes('modify') ||
      lowerMsg.includes('currency') ||
      lowerMsg.match(/\b(ngn|usd|eur|gbp|naira|dollar|euro|pound)\b/)
    )

    if (isModifying) {
      return 'generate_quote'
    }

    // Look for confirmation keywords - MUST return save_quote if confirming
    const isConfirming = (
      lowerMsg.match(/\b(yes|yep|yeah|sure|okay|ok|good|great|perfect|looks good|do it|create it|create|save|make|file)\b/)
    )

    if (isConfirming) {
      return 'save_quote'
    }
  }

  // PRIORITY 2: If there's a generated invoice, same logic
  if (lastAssistantMsg?.generatedInvoice) {
    const isModifying = (
      lowerMsg.includes('but') ||
      lowerMsg.includes('instead') ||
      lowerMsg.includes('different') ||
      lowerMsg.includes('change') ||
      lowerMsg.includes('modify')
    )

    if (isModifying) {
      return 'generate_invoice'
    }

    // Look for confirmation keywords - MUST return save_invoice if confirming
    const isConfirming = (
      lowerMsg.match(/\b(yes|yep|yeah|sure|okay|ok|good|great|perfect|looks good|do it|create it|create|save|make|file)\b/)
    )

    if (isConfirming) {
      return 'save_invoice'
    }
  }

  // PRIORITY 3: Check for explicit invoice/quote keywords in current message
  if (lowerMsg.includes('invoice') || lowerMsg.includes('bill')) {
    return 'generate_invoice'
  }

  // PRIORITY 4: Look through recent conversation for invoice/quote context
  // Only use this if there's NO generated document (handled above)
  const recentMessages = messages.slice(-5)
  const hasRecentInvoiceContext = recentMessages.some(msg =>
    msg.content.toLowerCase().includes('invoice')
  )
  const hasRecentQuoteContext = recentMessages.some(msg =>
    msg.content.toLowerCase().includes('quote')
  )

  // If user says "create it" with invoice context and NO generated document
  if (hasRecentInvoiceContext && lowerMsg.match(/\b(create|do it|yes|make)\b/)) {
    return 'generate_invoice'
  }

  // If user says "create it" with quote context and NO generated document
  if (hasRecentQuoteContext && lowerMsg.match(/\b(create|do it|yes|make)\b/)) {
    return 'generate_quote'
  }

  // Check for quote intent
  if (
    lowerMsg.includes('quote') ||
    lowerMsg.includes('estimate') ||
    lowerMsg.includes('price') ||
    lowerMsg.includes('pricing')
  ) {
    return 'generate_quote'
  }

  // Default to general
  return 'general'
}
